package com.shifting.service;

import com.shifting.payload.dto.BookingDto;
import com.shifting.payload.request.CreateBookingRequest;
import com.shifting.payload.request.UpdateBookingStatusRequest;

import java.util.List;

public interface BookingService {

    BookingDto createBooking(CreateBookingRequest request);

    BookingDto getBookingById(Long id);

    void deleteBooking(Long id);

    List<BookingDto> getMyBookings();
    BookingDto updateBookingStatus(Long bookingId, UpdateBookingStatusRequest request);
}
