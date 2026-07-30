package com.shifting.service;

import com.shifting.model.*;
import com.shifting.payload.dto.TruckRecommendationDto;
import com.shifting.repository.*;
import jakarta.persistence.EntityManager;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.core.task.SyncTaskExecutor;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@TestConfiguration
class NPlusOneTestConfig implements AsyncConfigurer {
    @Override
    public java.util.concurrent.Executor getAsyncExecutor() {
        return new SyncTaskExecutor();
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (ex, method, params) -> System.err.println("Async error: " + ex.getMessage());
    }
}

@SpringBootTest
@Import(NPlusOneTestConfig.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class NPlusOneQueryOptimizationTest {

    @Autowired
    private AutoAssignService autoAssignService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TruckRepository truckRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingItemRepository bookingItemRepository;

    @Autowired
    private PredefinedItemRepository predefinedItemRepository;

    @Autowired
    private EntityManager entityManager;

    @MockitoBean
    private EmailService emailService;

    @MockitoBean
    private TruckRecommendationService truckRecommendationService;

    @BeforeEach
    void setUp() {
        TruckRecommendationDto mediumRec = TruckRecommendationDto.builder()
                .recommendedTruckSize("MEDIUM")
                .confidence("HIGH")
                .estimatedLoadPercent(60)
                .reason("Test stub")
                .build();
        when(truckRecommendationService.recommend(anyLong())).thenReturn(mediumRec);
    }

    @Test
    @DisplayName("Fix #1 Verification: AutoAssign executes batched GROUP BY queries instead of N+1 per truck/driver")
    void testAutoAssignQueryCountOptimization() {
        // Seed 5 active trucks and 5 active drivers
        for (int i = 1; i <= 5; i++) {
            truckRepository.save(Truck.builder()
                    .regNumber("TRK-00" + i)
                    .size(TruckSize.MEDIUM)
                    .capacityKg(1000)
                    .isActive(true)
                    .build());

            driverRepository.save(Driver.builder()
                    .name("Driver " + i)
                    .phone("900000000" + i)
                    .licenseNo("LIC-00" + i)
                    .isActive(true)
                    .build());
        }

        User user = userRepository.save(new User(null, "Test User", "testopt@test.com", "pw", "9999999999", Role.USER));

        Booking booking = bookingRepository.save(Booking.builder()
                .user(user)
                .pickupAddress("A")
                .dropAddress("B")
                .scheduledDate(LocalDate.of(2030, 9, 1))
                .timeSlot(TimeSlot.MORNING)
                .status(BookingStatus.PENDING)
                .build());

        SessionFactory sessionFactory = entityManager.getEntityManagerFactory().unwrap(SessionFactory.class);
        Statistics stats = sessionFactory.getStatistics();
        stats.setStatisticsEnabled(true);
        stats.clear();

        long startQueryCount = stats.getPrepareStatementCount();

        // Run autoAssign
        autoAssignService.autoAssign(booking.getId());

        long totalQueries = stats.getPrepareStatementCount() - startQueryCount;

        // Verify assignment succeeded
        Booking updatedBooking = bookingRepository.findById(booking.getId()).orElseThrow();
        assertThat(updatedBooking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);

        // Print query statistics for verification
        System.out.println("=== AutoAssign Total SQL Query Statements Executed: " + totalQueries + " ===");
        assertThat(totalQueries).isLessThanOrEqualTo(10);
    }

    @Test
    @Transactional
    @DisplayName("Fix #2 Verification: findByBookingId eagerly fetches predefinedItem using JOIN FETCH")
    void testBookingItemJoinFetchOptimization() {
        User user = userRepository.save(new User(null, "User2", "user2@test.com", "pw", "8888888888", Role.USER));

        Booking booking = bookingRepository.save(Booking.builder()
                .user(user)
                .pickupAddress("A")
                .dropAddress("B")
                .scheduledDate(LocalDate.of(2030, 9, 1))
                .timeSlot(TimeSlot.MORNING)
                .status(BookingStatus.PENDING)
                .build());

        // Create 5 predefined items
        for (int i = 1; i <= 5; i++) {
            PredefinedItem item = predefinedItemRepository.save(PredefinedItem.builder()
                    .name("Item " + i)
                    .price(BigDecimal.valueOf(100 * i))
                    .build());

            bookingItemRepository.save(BookingItem.builder()
                    .booking(booking)
                    .predefinedItem(item)
                    .quantity(2)
                    .price(BigDecimal.valueOf(200 * i))
                    .build());
        }

        entityManager.flush();
        entityManager.clear(); // Clear L1 cache to force DB queries

        SessionFactory sessionFactory = entityManager.getEntityManagerFactory().unwrap(SessionFactory.class);
        Statistics stats = sessionFactory.getStatistics();
        stats.setStatisticsEnabled(true);
        stats.clear();

        long startQueryCount = stats.getPrepareStatementCount();

        // Fetch all items for booking
        List<BookingItem> items = bookingItemRepository.findByBookingId(booking.getId());

        // Access predefinedItem properties on all 5 items
        for (BookingItem item : items) {
            assertThat(item.getPredefinedItem()).isNotNull();
            assertThat(item.getPredefinedItem().getName()).startsWith("Item ");
        }

        long totalQueries = stats.getPrepareStatementCount() - startQueryCount;

        System.out.println("=== findByBookingId SQL Query Statements Executed: " + totalQueries + " ===");
        // Should be exactly 1 SELECT query with JOIN FETCH, instead of 1 + 5 = 6 queries
        assertThat(totalQueries).isEqualTo(1);
    }
}
