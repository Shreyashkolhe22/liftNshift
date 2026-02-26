package com.shifting.service;

import com.shifting.payload.dto.BookingDto;
import com.shifting.payload.request.CreateBookingRequest;

public interface BookingService {

    BookingDto createBooking(CreateBookingRequest request);

    BookingDto getBookingById(Long id);

    void deleteBooking(Long id);
}
