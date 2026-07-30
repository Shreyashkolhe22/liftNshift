package com.shifting.repository;

import com.shifting.model.BookingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingItemRepository
        extends JpaRepository<BookingItem, Long> {

    @Query("SELECT bi FROM BookingItem bi LEFT JOIN FETCH bi.predefinedItem WHERE bi.booking.id = :bookingId")
    List<BookingItem> findByBookingId(@Param("bookingId") Long bookingId);
}
