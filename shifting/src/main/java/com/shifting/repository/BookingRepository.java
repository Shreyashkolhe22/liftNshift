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

    // bookingSlot is @OneToOne and truck/driver are @ManyToOne — all
    // single-valued, so unlike the items collection below, this fetch
    // chain can't multiply result rows and needs no DISTINCT. Avoids the
    // N+1 in BookingServiceImplement#mapToDto, which previously fired one
    // query per booking for bookingSlot plus two more for any booking with
    // an assigned slot (truck + driver).
    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.bookingSlot bs " +
            "LEFT JOIN FETCH bs.truck " +
            "LEFT JOIN FETCH bs.driver " +
            "WHERE b.user.id = :userId")
    List<Booking> findByUserIdWithSlotTruckDriver(@Param("userId") Long userId);

    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.bookingSlot bs " +
            "LEFT JOIN FETCH bs.truck " +
            "LEFT JOIN FETCH bs.driver " +
            "WHERE b.id = :id AND b.user.id = :userId")
    Optional<Booking> findByIdAndUserIdWithSlotTruckDriver(@Param("id") Long id, @Param("userId") Long userId);

    // LEFT JOIN on items: a booking with zero items must still be returned
    // (an inner join would silently exclude it), while user is a mandatory
    // (NOT NULL) association so an inner join there is safe. DISTINCT is
    // required because the fetch-joined items collection multiplies result
    // rows (one per item) — without it, a booking with 2+ items would make
    // this "single result" query blow up with a non-unique-result error.
    // Also fetches each item's predefinedItem: TruckRecommendationService
    // calls item.getPredefinedItem().getName() when building the AI prompt,
    // which is a second lazy proxy one level below the items collection —
    // missing this caused "Could not initialize proxy [PredefinedItem#N] -
    // no session" on the same async path this query exists to fix.
    @Query("SELECT DISTINCT b FROM Booking b " +
            "LEFT JOIN FETCH b.items i " +
            "LEFT JOIN FETCH i.predefinedItem " +
            "JOIN FETCH b.user " +
            "WHERE b.id = :id")
    Optional<Booking> findByIdWithItemsAndUser(@Param("id") Long id);
}