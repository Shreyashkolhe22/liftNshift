package com.shifting.service;

import com.shifting.model.*;
import com.shifting.repository.BookingSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * SlotAssignmentWriter — owns the single @Transactional write path that
 * persists a {@link BookingSlot} row.
 *
 * <p><b>Why a separate class?</b><br>
 * Spring's {@code @Transactional} works through a proxy: only calls that enter
 * a bean <em>from outside</em> (through the proxy) get transactional behaviour.
 * If {@code tryPersistSlot} lived in {@code AutoAssignService} and was called
 * as {@code this.tryPersistSlot(...)}, the call would bypass the proxy entirely
 * and {@code @Transactional} would have no effect.  Extracting the method here
 * ensures the call from {@code AutoAssignService} goes through the Spring proxy
 * for {@code SlotAssignmentWriter}, so the transaction semantics are honoured.
 *
 * <p><b>Why {@code REQUIRES_NEW}?</b><br>
 * {@code autoAssign()} is {@code @Async} and runs with no surrounding
 * transaction.  {@code REQUIRED} (the default) would therefore also work here,
 * but {@code REQUIRES_NEW} is the more explicit and correct choice: it
 * guarantees a <em>fresh</em> transaction every time, even if some future
 * refactor accidentally adds a surrounding transaction.  That isolation also
 * means a {@link DataIntegrityViolationException} rolls back only this write,
 * never any outer unit of work.
 */
@Service
@RequiredArgsConstructor
public class SlotAssignmentWriter {

    private final BookingSlotRepository bookingSlotRepository;

    /**
     * Builds and persists a {@link BookingSlot} inside a dedicated transaction.
     *
     * <p>{@code saveAndFlush} (not just {@code save}) is used deliberately:
     * without an explicit flush, Hibernate defers the INSERT until commit, so
     * the {@link DataIntegrityViolationException} raised by the unique constraint
     * would surface at commit time — <em>outside</em> the try/catch in
     * {@code AutoAssignService}.  Flushing immediately ensures the exception is
     * thrown and caught exactly where the caller expects it.
     *
     * @throws DataIntegrityViolationException if a concurrent request has already
     *         claimed the same truck or driver for this date + time-slot.
     */
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void tryPersistSlot(Booking booking, Truck truck, Driver driver) {
        BookingSlot slot = BookingSlot.builder()
                .booking(booking)
                .truck(truck)
                .driver(driver)
                .slotDate(booking.getScheduledDate())
                .timeSlot(booking.getTimeSlot())
                .build();
        bookingSlotRepository.saveAndFlush(slot); // flush = constraint fires NOW, inside this TX
    }
}
