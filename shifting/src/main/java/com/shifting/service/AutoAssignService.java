package com.shifting.service;

import com.shifting.model.*;
import com.shifting.payload.dto.TruckRecommendationDto;
import com.shifting.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * AutoAssignService — picks an available truck + driver for a booking and
 * persists a BookingSlot row.
 *
 * <h2>Race-condition fix</h2>
 * The old code did a SELECT (check) and then a separate INSERT with no locking
 * between them, so two concurrent requests could both see the same truck as
 * "free" and both successfully insert — violating the unique constraints.
 *
 * <p>The fix uses two layers of defence:
 * <ol>
 *   <li><b>DB unique constraints</b> on {@code (truck_id, slot_date, time_slot)}
 *       and {@code (driver_id, slot_date, time_slot)} — applied via
 *       {@code V1__add_booking_slot_unique_constraints.sql}.  These are the
 *       last line of defence that always holds regardless of concurrency.</li>
 *   <li><b>Retry loop</b> in {@link #autoAssign}: if the INSERT raises a
 *       {@link DataIntegrityViolationException} (meaning a concurrent request
 *       won the race), this service re-runs selection while <em>excluding</em>
 *       the truck/driver that just lost the race, up to {@code MAX_RETRIES}
 *       attempts.  This keeps the booking from failing outright.</li>
 * </ol>
 *
 * <p>{@link SlotAssignmentWriter#tryPersistSlot} is the only method that writes
 * to the DB.  It lives in a separate {@code @Service} so the call from this class
 * goes through the Spring proxy and {@code @Transactional} is honoured (self-
 * invocation within the same bean bypasses the proxy).  The outer {@code @Async}
 * method intentionally does <em>not</em> span one long transaction — holding a DB
 * connection across the AI/network calls (step 1) would waste pool resources.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AutoAssignService {

    /** Maximum number of select→insert attempts before giving up. */
    private static final int MAX_RETRIES = 3;

    private final BookingRepository          bookingRepository;
    private final BookingSlotRepository      bookingSlotRepository;
    private final TruckRepository            truckRepository;
    private final DriverRepository           driverRepository;
    private final TruckRecommendationService truckRecommendationService;
    private final EmailService               emailService;
    private final SlotAssignmentWriter       slotWriter;
    private final BookingLoader              bookingLoader;

    // ── PUBLIC API ────────────────────────────────────────────────────────────

    @Async
    public void autoAssign(Long bookingId) {
        try {
            // Load with items + user eagerly initialized — this Booking instance
            // is later passed into @Async email-sending code, which runs with no
            // Hibernate session of its own and would otherwise fail trying to
            // lazily resolve booking.getUser() (see EmailService).
            Booking booking = bookingLoader.loadWithItemsAndUser(bookingId);

            // Guard — must have scheduled date + slot
            if (booking.getScheduledDate() == null || booking.getTimeSlot() == null) {
                log.warn("Booking #{} has no date/slot — skipping auto-assign", bookingId);
                return;
            }

            // Guard — already assigned
            if (bookingSlotRepository.findByBookingId(bookingId).isPresent()) {
                log.info("Booking #{} already assigned — skipping", bookingId);
                return;
            }

            log.info("Auto-assign started for booking #{}", bookingId);

            // Step 1 — Get AI recommended truck size (network call; done outside
            //           the transaction so we don't hold a DB connection during it)
            String recommendedSize = getAiRecommendedSize(bookingId);
            log.info("AI recommended '{}' for booking #{}", recommendedSize, bookingId);

            // Step 2 — Retry loop: select → insert → catch conflict → retry
            //
            // On each attempt we pass the IDs of resources that already caused a
            // DataIntegrityViolationException so findAvailable* can skip them.
            List<Long> excludedTruckIds  = new ArrayList<>();
            List<Long> excludedDriverIds = new ArrayList<>();

            for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                log.debug("Auto-assign attempt {}/{} for booking #{}", attempt, MAX_RETRIES, bookingId);

                // 2a — Find a free truck (excluding ones that lost a race earlier)
                Truck truck = findAvailableTruck(booking, recommendedSize, excludedTruckIds);

                // 2b — Find a free driver (excluding ones that lost a race earlier)
                Driver driver = findAvailableDriver(booking, excludedDriverIds);

                // 2c — No resources available → email admin and bail out
                if (truck == null || driver == null) {
                    log.warn("No truck/driver available for booking #{} on attempt {}",
                            bookingId, attempt);
                    emailService.sendManualAssignmentNeededEmail(booking);
                    return;
                }

                // 2d — Attempt the atomic insert inside its own transaction.
                //      Delegated to SlotAssignmentWriter so the @Transactional
                //      proxy is honoured (self-invocation would bypass it).
                try {
                    slotWriter.tryPersistSlot(booking, truck, driver);

                    // ── SUCCESS ──────────────────────────────────────────────
                    booking.setStatus(BookingStatus.CONFIRMED);
                    bookingRepository.save(booking);

                    emailService.sendBookingConfirmedWithDriverEmail(
                            booking.getUser(), booking, truck, driver
                    );

                    log.info("Auto-assign SUCCESS (attempt {}): Booking #{} → {} + {}",
                            attempt, bookingId, truck.getRegNumber(), driver.getName());
                    return; // Done — exit the retry loop

                } catch (DataIntegrityViolationException dive) {
                    // Another concurrent request beat us to this truck or driver.
                    // Exclude both from the next attempt and retry selection.
                    log.warn(
                            "Booking #{} — conflict on attempt {} (truck={}, driver={}): {}. Retrying…",
                            bookingId, attempt,
                            truck.getRegNumber(), driver.getName(),
                            dive.getMostSpecificCause().getMessage()
                    );
                    excludedTruckIds.add(truck.getId());
                    excludedDriverIds.add(driver.getId());
                }
            }

            // All retries exhausted — notify admin for manual assignment
            log.error("Auto-assign EXHAUSTED all {} retries for booking #{}", MAX_RETRIES, bookingId);
            emailService.sendManualAssignmentNeededEmail(booking);

        } catch (Exception e) {
            log.error("Auto-assign FAILED for booking #{}: {}", bookingId, e.getMessage(), e);
        }
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private String getAiRecommendedSize(Long bookingId) {
        try {
            TruckRecommendationDto rec = truckRecommendationService.recommend(bookingId);
            return rec.getRecommendedTruckSize();
        } catch (Exception e) {
            log.warn("AI failed for booking #{}, using MEDIUM: {}", bookingId, e.getMessage());
            return "MEDIUM";
        }
    }

    /**
     * Finds the first truck that is:
     * <ul>
     *   <li>active</li>
     *   <li>matches the preferred size hierarchy</li>
     *   <li>not already booked for {@code booking.scheduledDate + timeSlot}</li>
     *   <li>not in {@code excludedIds} (trucks that caused a constraint conflict
     *       on a previous attempt in this request)</li>
     * </ul>
     */
    /**
     * Finds the first truck that is:
     * <ul>
     *   <li>active</li>
     *   <li>matches the preferred size hierarchy</li>
     *   <li>not already booked for {@code booking.scheduledDate + timeSlot}</li>
     *   <li>not in {@code excludedIds} (trucks that caused a constraint conflict
     *       on a previous attempt in this request)</li>
     * </ul>
     */
    private Truck findAvailableTruck(Booking booking, String recommendedSize,
                                     List<Long> excludedIds) {
        List<Long> bookedTruckIds = bookingSlotRepository
                .findBookedTruckIdsBySlotDateAndTimeSlot(
                        booking.getScheduledDate(),
                        booking.getTimeSlot()
                );

        for (String size : buildSizePriority(recommendedSize)) {
            List<Truck> trucks = truckRepository
                    .findBySizeAndIsActiveTrue(TruckSize.valueOf(size));

            for (Truck truck : trucks) {
                if (excludedIds.contains(truck.getId()) || bookedTruckIds.contains(truck.getId())) {
                    continue; // skip — lost a race on a previous attempt or busy
                }
                log.info("Found truck: {} ({})", truck.getRegNumber(), size);
                return truck;
            }
        }
        return null;
    }

    /**
     * Finds the first active driver who is not already booked for
     * {@code booking.scheduledDate + timeSlot} and not in {@code excludedIds}.
     */
    private Driver findAvailableDriver(Booking booking, List<Long> excludedIds) {
        List<Long> bookedDriverIds = bookingSlotRepository
                .findBookedDriverIdsBySlotDateAndTimeSlot(
                        booking.getScheduledDate(),
                        booking.getTimeSlot()
                );

        for (Driver driver : driverRepository.findByIsActiveTrue()) {
            if (excludedIds.contains(driver.getId()) || bookedDriverIds.contains(driver.getId())) {
                continue; // skip — lost a race on a previous attempt or busy
            }
            log.info("Found driver: {}", driver.getName());
            return driver;
        }
        return null;
    }

    private List<String> buildSizePriority(String recommended) {
        return switch (recommended) {
            case "SMALL" -> List.of("SMALL",  "MEDIUM", "LARGE");
            case "LARGE" -> List.of("LARGE",  "MEDIUM", "SMALL");
            default      -> List.of("MEDIUM", "LARGE",  "SMALL");
        };
    }
}