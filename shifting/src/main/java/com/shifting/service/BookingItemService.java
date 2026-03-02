package com.shifting.service;

import com.shifting.payload.dto.BookingDto;
import com.shifting.payload.request.AddBookingItemRequest;

public interface BookingItemService {
    BookingDto addItemToBooking(AddBookingItemRequest request);
}
