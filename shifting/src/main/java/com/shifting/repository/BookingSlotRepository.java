package com.shifting.repository;

import com.shifting.model.BookingSlot;
import com.shifting.model.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingSlotRepository extends JpaRepository<BookingSlot, Long> {

    // Find slot by booking
    Optional<BookingSlot> findByBookingId(Long bookingId);

    // Find all slots on a specific date
    List<BookingSlot> findBySlotDate(LocalDate slotDate);

    // Find slots on a date and time slot
    List<BookingSlot> findBySlotDateAndTimeSlot(
            LocalDate slotDate, TimeSlot timeSlot
    );

    // Check if a truck is already booked for a date+slot
    boolean existsByTruckIdAndSlotDateAndTimeSlot(
            Long truckId, LocalDate slotDate, TimeSlot timeSlot
    );

    // Check if a driver is already booked for a date+slot
    boolean existsByDriverIdAndSlotDateAndTimeSlot(
            Long driverId, LocalDate slotDate, TimeSlot timeSlot
    );

    // Count how many slots are taken on a date+slot
    // (to check availability against total trucks)
    long countBySlotDateAndTimeSlot(
            LocalDate slotDate, TimeSlot timeSlot
    );

    // Get all dates that are fully booked
    // (used to block dates on frontend calendar)
    @Query("""
        SELECT bs.slotDate FROM BookingSlot bs
        GROUP BY bs.slotDate
        HAVING COUNT(bs.id) >= :totalSlots
        """)
    List<LocalDate> findFullyBookedDates(
            @Param("totalSlots") long totalSlots
    );
}