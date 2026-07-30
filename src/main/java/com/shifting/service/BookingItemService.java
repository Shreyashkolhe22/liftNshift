package com.shifting.service;

import com.shifting.payload.dto.BookingItemDto;
import com.shifting.payload.dto.BookingDto;
import com.shifting.payload.request.AddBookingItemRequest;

import java.util.List;

public interface BookingItemService {
    BookingDto addItemToBooking(AddBookingItemRequest request);


    List<BookingItemDto> getItemsByBookingId(Long bookingId);

    BookingItemDto getItemById(Long bookingId, Long itemId);

    void updateQuantity(Long bookingId, Long itemId, Integer quantity);

    void deleteItem(Long bookingId, Long itemId);
}
