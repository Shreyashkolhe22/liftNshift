package com.shifting.repository;

import com.shifting.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    Optional<Booking> findByIdAndUserId(Long id, Long userId);

    // LEFT JOIN on items: a booking with zero items must still be returned
    // (an inner join would silently exclude it), while user is a mandatory
    // (NOT NULL) association so an inner join there is safe. DISTINCT is
    // required because the fetch-joined items collection multiplies result
    // rows (one per item) — without it, a booking with 2+ items would make
    // this "single result" query blow up with a non-unique-result error.
    @Query("SELECT DISTINCT b FROM Booking b LEFT JOIN FETCH b.items JOIN FETCH b.user WHERE b.id = :id")
    Optional<Booking> findByIdWithItemsAndUser(@Param("id") Long id);
}