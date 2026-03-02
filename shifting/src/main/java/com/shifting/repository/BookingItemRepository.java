package com.shifting.repository;

import com.shifting.model.BookingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingItemRepository
        extends JpaRepository<BookingItem, Long> {

    List<BookingItem> findByBookingId(Long bookingId);
}
