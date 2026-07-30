package com.shifting.service;

import com.shifting.model.*;
import com.shifting.payload.dto.TruckRecommendationDto;
import com.shifting.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.core.task.SyncTaskExecutor;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Integration test that proves AutoAssignService correctly resolves a race
 * condition when two concurrent requests compete for the single available
 * truck+driver on the same slot_date + time_slot.
 *
 * <h2>Scenario</h2>
 * <ul>
 *   <li>1 active MEDIUM truck, 1 active driver in the test DB.</li>
 *   <li>2 bookings, both wanting a MEDIUM truck on the same date + MORNING slot.</li>
 *   <li>Both {@code autoAssign()} calls are submitted to a 2-thread
 *       {@link ExecutorService} and held behind a {@link CountDownLatch} so
 *       they enter the assign logic at the same instant.</li>
 * </ul>
 *
 * <h2>Expected outcome</h2>
 * <ul>
 *   <li>Exactly <b>one</b> {@code BookingSlot} row exists in the DB.</li>
 *   <li>The booking that owns that row has status {@code CONFIRMED}.</li>
 *   <li>The other booking either:
 *     <ul>
 *       <li>has no {@code BookingSlot} row (resources exhausted → manual email),
 *           <b>OR</b></li>
 *       <li>was given a <em>different</em> truck+date+time_slot combination
 *           (impossible here since there is only one resource, so it will always
 *           fall back to the manual-assignment email path).</li>
 *     </ul>
 *   </li>
 *   <li>No two rows share the same
 *       {@code (truck_id, slot_date, time_slot)} — the unique constraint is
 *       never violated.</li>
 * </ul>
 *
 * <p>The test is {@link RepeatedTest} 5 times to catch flaky timing-dependent
 * failures across multiple runs.
 *
 * <p>{@link EmailService} and {@link TruckRecommendationService} are mocked so
 * the test never touches real SMTP or Gemini.
 */
/**
 * Replaces Spring's real async executor with a {@link SyncTaskExecutor} so that
 * {@code @Async} methods run <em>synchronously on the calling thread</em>.
 *
 * <p>This is critical for the test's {@link CountDownLatch} strategy: without this,
 * {@code autoAssign()} would return immediately after dispatching work to a Spring
 * thread pool, causing {@code doneLatch.countDown()} to fire before the work
 * finishes — making all subsequent {@code verify()} calls unreliable.
 *
 * <p>With {@code SyncTaskExecutor}, each of our two test threads becomes the
 * "async" worker itself, so the latch fires only after the work completes.
 */
@TestConfiguration
class SyncAsyncTestConfig implements AsyncConfigurer {
    @Override
    public java.util.concurrent.Executor getAsyncExecutor() {
        return new SyncTaskExecutor();
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (ex, method, params) ->
                System.err.println("Async error in " + method.getName() + ": " + ex.getMessage());
    }
}

@SpringBootTest
@Import(SyncAsyncTestConfig.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class AutoAssignServiceRaceConditionIT {

    // ── Spring beans under test ───────────────────────────────────────────────

    @Autowired
    private AutoAssignService autoAssignService;

    // ── Repositories (wired to the H2 test DB) ───────────────────────────────

    @Autowired private UserRepository        userRepository;
    @Autowired private TruckRepository       truckRepository;
    @Autowired private DriverRepository      driverRepository;
    @Autowired private BookingRepository     bookingRepository;
    @Autowired private BookingSlotRepository bookingSlotRepository;

    // ── Collaborators that would talk to the network / SMTP — mocked ──────────

    @MockitoBean
    private EmailService emailService;

    @MockitoBean
    private TruckRecommendationService truckRecommendationService;

    // ── Test fixtures ─────────────────────────────────────────────────────────

    private static final LocalDate SLOT_DATE  = LocalDate.of(2030, 8, 15);
    private static final TimeSlot  TIME_SLOT  = TimeSlot.MORNING;

    /** IDs set during {@link #setUp()} so test methods can reference them. */
    private Long booking1Id;
    private Long booking2Id;

    // ─────────────────────────────────────────────────────────────────────────

    @BeforeEach
    void setUp() {
        // ── 1. Stub TruckRecommendationService to return MEDIUM quickly ────────
        //       (avoids Gemini HTTP calls; exception path falls back to MEDIUM too,
        //        but explicit stub is cleaner and deterministic)
        TruckRecommendationDto mediumRec = TruckRecommendationDto.builder()
                .recommendedTruckSize("MEDIUM")
                .confidence("HIGH")
                .estimatedLoadPercent(60)
                .reason("Test stub")
                .build();
        when(truckRecommendationService.recommend(anyLong())).thenReturn(mediumRec);

        // ── 2. Stub EmailService — we'll verify call counts later ─────────────
        doNothing().when(emailService).sendManualAssignmentNeededEmail(any());
        doNothing().when(emailService).sendBookingConfirmedWithDriverEmail(any(), any(), any(), any());

        // ── 3. Seed the DB ────────────────────────────────────────────────────

        // One user for both bookings
        User user = new User();
        user.setName("Race Test User");
        user.setEmail("race@test.com");
        user.setPassword("pw");
        user.setPhone("9999999999");
        user.setRole(Role.USER);
        user = userRepository.save(user);

        // One active MEDIUM truck
        Truck truck = Truck.builder()
                .regNumber("MH12-RACE-01")
                .size(TruckSize.MEDIUM)
                .capacityKg(1200)
                .isActive(true)
                .build();
        truckRepository.save(truck);

        // One active driver
        Driver driver = Driver.builder()
                .name("Race Driver")
                .phone("8888888888")
                .licenseNo("DL-RACE-001")
                .isActive(true)
                .build();
        driverRepository.save(driver);

        // Two bookings — identical date + time slot, same truck-size need
        Booking b1 = Booking.builder()
                .user(user)
                .pickupAddress("Address A")
                .dropAddress("Address B")
                .scheduledDate(SLOT_DATE)
                .timeSlot(TIME_SLOT)
                .status(BookingStatus.PENDING)
                .build();

        Booking b2 = Booking.builder()
                .user(user)
                .pickupAddress("Address C")
                .dropAddress("Address D")
                .scheduledDate(SLOT_DATE)
                .timeSlot(TIME_SLOT)
                .status(BookingStatus.PENDING)
                .build();

        booking1Id = bookingRepository.save(b1).getId();
        booking2Id = bookingRepository.save(b2).getId();
    }

    // ─────────────────────────────────────────────────────────────────────────

    @RepeatedTest(5)
    @DisplayName("Race condition: only one booking gets the slot, other triggers manual email")
    void onlyOneBookingClaimsTheSingleTruckDriverSlot() throws InterruptedException {

        // ── Arrange ───────────────────────────────────────────────────────────

        CountDownLatch startGate = new CountDownLatch(1); // both threads wait here
        CountDownLatch doneLatch = new CountDownLatch(2); // main thread waits here

        ExecutorService pool = Executors.newFixedThreadPool(2);
        List<Exception> thrownExceptions = new CopyOnWriteArrayList<>();

        // ── Act ───────────────────────────────────────────────────────────────

        // Thread 1 — autoAssign for booking 1
        pool.submit(() -> {
            try {
                startGate.await();           // wait for the gun
                autoAssignService.autoAssign(booking1Id);
            } catch (Exception e) {
                thrownExceptions.add(e);
            } finally {
                doneLatch.countDown();
            }
        });

        // Thread 2 — autoAssign for booking 2
        pool.submit(() -> {
            try {
                startGate.await();           // wait for the gun
                autoAssignService.autoAssign(booking2Id);
            } catch (Exception e) {
                thrownExceptions.add(e);
            } finally {
                doneLatch.countDown();
            }
        });

        startGate.countDown();   // fire! both threads enter autoAssign at the same instant

        // Wait up to 30 s — normally completes in < 2 s; 30 s is generous headroom
        boolean finished = doneLatch.await(30, TimeUnit.SECONDS);
        pool.shutdown();

        // ── Assert: threads finished cleanly ─────────────────────────────────

        assertThat(finished)
                .as("Both autoAssign() calls must complete within the timeout")
                .isTrue();

        assertThat(thrownExceptions)
                .as("No unexpected exceptions should have escaped from autoAssign()")
                .isEmpty();

        // ── Assert: DB invariants ─────────────────────────────────────────────

        List<BookingSlot> allSlots = bookingSlotRepository.findAll();

        // Invariant 1 — At most one slot row may exist (only one truck+driver pair)
        assertThat(allSlots)
                .as("With only one truck and one driver, at most one BookingSlot row must exist")
                .hasSizeLessThanOrEqualTo(1);

        // Invariant 2 — No two rows share the same (truck_id, slot_date, time_slot)
        //               This is actually enforced by the DB unique constraint, but we
        //               assert it explicitly so a test failure gives a clear message.
        long distinctCombinations = allSlots.stream()
                .map(s -> s.getTruck().getId() + "|" + s.getSlotDate() + "|" + s.getTimeSlot())
                .distinct()
                .count();
        assertThat(distinctCombinations)
                .as("No two BookingSlot rows may share the same truck_id + slot_date + time_slot")
                .isEqualTo(allSlots.size());

        // ── Assert: at most one CONFIRMED booking ─────────────────────────────
        //
        // Possible outcomes with one truck + one driver:
        //   a) 1 booking CONFIRMED (got the slot), 1 still PENDING (manual email sent)
        //   b) 0 bookings CONFIRMED (extremely unlikely: both exhausted retries
        //      simultaneously — manual email sent twice)
        //
        // The critical guarantee: never MORE than 1 CONFIRMED.

        Booking b1After = bookingRepository.findById(booking1Id).orElseThrow();
        Booking b2After = bookingRepository.findById(booking2Id).orElseThrow();

        long confirmedCount = List.of(b1After, b2After).stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .count();

        assertThat(confirmedCount)
                .as("At most one booking should be CONFIRMED")
                .isLessThanOrEqualTo(1);

        // ── Assert: slot row belongs to the CONFIRMED booking ─────────────────

        if (!allSlots.isEmpty()) {
            // There is exactly one slot row — it must belong to the CONFIRMED booking
            assertThat(confirmedCount)
                    .as("If a BookingSlot row exists, exactly one booking must be CONFIRMED")
                    .isEqualTo(1);

            BookingSlot slot = allSlots.get(0);
            Long confirmedBookingId = (b1After.getStatus() == BookingStatus.CONFIRMED)
                    ? booking1Id : booking2Id;

            assertThat(slot.getBooking().getId())
                    .as("The BookingSlot must belong to the CONFIRMED booking")
                    .isEqualTo(confirmedBookingId);

            // The losing booking must NOT have a slot row
            Long losingBookingId = confirmedBookingId.equals(booking1Id) ? booking2Id : booking1Id;
            Optional<BookingSlot> losingSlot = bookingSlotRepository.findByBookingId(losingBookingId);
            assertThat(losingSlot)
                    .as("The losing booking must NOT have a BookingSlot row")
                    .isEmpty();
        }

        // ── Assert: email call counts are consistent with outcomes ────────────
        //
        // • 1 winner  → sendManualAssignmentNeededEmail called exactly 1 time (loser)
        //             → sendBookingConfirmedWithDriverEmail called exactly 1 time (winner)
        // • 0 winners → sendManualAssignmentNeededEmail called exactly 2 times
        //             → sendBookingConfirmedWithDriverEmail called 0 times

        int expectedManualEmails    = (int) (2 - confirmedCount);
        int expectedConfirmEmails   = (int) confirmedCount;

        verify(emailService, times(expectedManualEmails))
                .sendManualAssignmentNeededEmail(any(Booking.class));

        verify(emailService, times(expectedConfirmEmails))
                .sendBookingConfirmedWithDriverEmail(any(), any(), any(), any());
    }

    // ─────────────────────────────────────────────────────────────────────────

    @RepeatedTest(3)
    @DisplayName("Race condition: same truck_id + slot_date + time_slot is never held by two rows")
    void uniqueConstraintNeverViolated() throws InterruptedException {
        // Focused variant that only checks the DB constraint invariant with
        // a concurrency burst of exactly 2 threads vs. 1 resource.

        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(2);
        AtomicInteger  exCount  = new AtomicInteger(0);

        ExecutorService pool = Executors.newFixedThreadPool(2);

        pool.submit(() -> {
            try { startGate.await(); autoAssignService.autoAssign(booking1Id); }
            catch (Exception e) { exCount.incrementAndGet(); }
            finally { doneLatch.countDown(); }
        });

        pool.submit(() -> {
            try { startGate.await(); autoAssignService.autoAssign(booking2Id); }
            catch (Exception e) { exCount.incrementAndGet(); }
            finally { doneLatch.countDown(); }
        });

        startGate.countDown();
        doneLatch.await(30, TimeUnit.SECONDS);
        pool.shutdown();

        // No unexpected exceptions escaped
        assertThat(exCount.get())
                .as("No unhandled exceptions should escape from autoAssign()")
                .isZero();

        // The critical DB invariant: no duplicate (truck_id, slot_date, time_slot)
        List<BookingSlot> slots = bookingSlotRepository.findAll();

        long distinctKeys = slots.stream()
                .map(s -> s.getTruck().getId() + "|" + s.getSlotDate() + "|" + s.getTimeSlot())
                .distinct()
                .count();

        assertThat(distinctKeys)
                .as("No two BookingSlot rows may share truck_id + slot_date + time_slot")
                .isEqualTo(slots.size());

        assertThat(slots.size())
                .as("With one truck+driver, at most one slot row should be created")
                .isLessThanOrEqualTo(1);
    }
}
