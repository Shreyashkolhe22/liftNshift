package com.shifting.service;

import com.shifting.model.*;
import com.shifting.payload.dto.TruckRecommendationDto;
import com.shifting.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AutoAssignService {

    private final BookingRepository          bookingRepository;
    private final BookingSlotRepository      bookingSlotRepository;
    private final TruckRepository            truckRepository;
    private final DriverRepository           driverRepository;
    private final TruckRecommendationService truckRecommendationService;
    private final EmailService               emailService;

    @Async
    public void autoAssign(Long bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

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

            // Step 1 — Get AI recommended truck size
            String recommendedSize = getAiRecommendedSize(bookingId);
            log.info("AI recommended '{}' for booking #{}", recommendedSize, bookingId);

            // Step 2 — Find available truck
            Truck truck = findAvailableTruck(booking, recommendedSize);

            // Step 3 — Find available driver
            Driver driver = findAvailableDriver(booking);

            // Step 4 — No truck or driver? Notify admin
            if (truck == null || driver == null) {
                log.warn("No truck/driver available for booking #{}", bookingId);
                emailService.sendManualAssignmentNeededEmail(booking);
                return;
            }

            // Step 5 — Save BookingSlot
            BookingSlot slot = BookingSlot.builder()
                    .booking(booking)
                    .truck(truck)
                    .driver(driver)
                    .slotDate(booking.getScheduledDate())
                    .timeSlot(booking.getTimeSlot())
                    .build();
            bookingSlotRepository.save(slot);

            // Step 6 — Update booking → CONFIRMED
            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

            // Step 7 — Email user with truck + driver details
            emailService.sendBookingConfirmedWithDriverEmail(
                    booking.getUser(), booking, truck, driver
            );

            log.info("Auto-assign SUCCESS: Booking #{} → {} + {}",
                    bookingId, truck.getRegNumber(), driver.getName());

        } catch (Exception e) {
            log.error("Auto-assign FAILED for booking #{}: {}", bookingId, e.getMessage());
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

    private Truck findAvailableTruck(Booking booking, String recommendedSize) {
        for (String size : buildSizePriority(recommendedSize)) {
            List<Truck> trucks = truckRepository
                    .findBySizeAndIsActiveTrue(TruckSize.valueOf(size));

            for (Truck truck : trucks) {
                boolean busy = bookingSlotRepository
                        .existsByTruckIdAndSlotDateAndTimeSlot(
                                truck.getId(),
                                booking.getScheduledDate(),
                                booking.getTimeSlot()
                        );
                if (!busy) {
                    log.info("Found truck: {} ({})", truck.getRegNumber(), size);
                    return truck;
                }
            }
        }
        return null;
    }

    private Driver findAvailableDriver(Booking booking) {
        for (Driver driver : driverRepository.findByIsActiveTrue()) {
            boolean busy = bookingSlotRepository
                    .existsByDriverIdAndSlotDateAndTimeSlot(
                            driver.getId(),
                            booking.getScheduledDate(),
                            booking.getTimeSlot()
                    );
            if (!busy) {
                log.info("Found driver: {}", driver.getName());
                return driver;
            }
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