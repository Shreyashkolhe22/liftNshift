package com.shifting.controller;

import com.shifting.payload.dto.BookingDto;
import com.shifting.payload.request.CreateBookingRequest;
import com.shifting.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/{id}")
    public ResponseEntity<BookingDto> getBookingById(@PathVariable Long id)
    {
        BookingDto response = bookingService.getBookingById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBookingById(@PathVariable Long id)
    {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok("Deleted booking successfully");
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingDto>> getAllBooking()
    {
        List<BookingDto> response = bookingService.getMyBookings();
        return ResponseEntity.ok(response);
    }
}
