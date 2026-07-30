package com.shifting.service;

import com.shifting.exception.ApiException;
import com.shifting.model.Booking;
import com.shifting.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * BookingLoader — owns the single read path that returns a Booking with
 * {@code items} and {@code user} already initialized.
 *
 * <p><b>Why a separate class?</b><br>
 * Same reasoning as {@link SlotAssignmentWriter}: {@code @Transactional} only
 * takes effect on calls that come through the Spring proxy. Callers such as
 * {@code AutoAssignService#autoAssign} and {@code TruckRecommendationService#recommend}
 * run outside any transaction (the former is {@code @Async}, the latter spans an
 * outbound AI call and shouldn't hold a DB connection open for it) — a plain
 * {@code bookingRepository.findById(...)} there returns a Booking whose
 * {@code items} collection and {@code user} proxy can no longer be lazily
 * initialized once that method returns, since there is no Hibernate session left
 * to service them. Fetching both eagerly in one query, inside a dedicated
 * transaction, means the returned entity is fully usable afterward regardless of
 * session state.
 */
@Service
@RequiredArgsConstructor
public class BookingLoader {

    private final BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public Booking loadWithItemsAndUser(Long bookingId) {
        return bookingRepository.findByIdWithItemsAndUser(bookingId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Booking not found: " + bookingId));
    }
}
