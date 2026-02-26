package com.shifting.controller;

import com.shifting.payload.dto.BookingDto;
import com.shifting.payload.request.CreateBookingRequest;
import com.shifting.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingDto> createBooking(
            @RequestBody CreateBookingRequest request)
    {

        BookingDto response = bookingService.createBooking(request);
        return ResponseEntity.ok(response);
    }
}
