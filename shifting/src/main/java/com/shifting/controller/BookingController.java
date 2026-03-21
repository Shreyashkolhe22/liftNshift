package com.shifting.controller;

import com.shifting.payload.dto.BookingDto;
import com.shifting.payload.request.CreateBookingRequest;
import com.shifting.payload.request.UpdateBookingStatusRequest;
import com.shifting.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
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
            @RequestBody CreateBookingRequest request) {

        BookingDto response = bookingService.createBooking(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDto> getBookingById(@PathVariable("id") Long id) {
        BookingDto response = bookingService.getBookingById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBookingById(@PathVariable("id") Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok("Deleted booking successfully");
    }

    @GetMapping
    public ResponseEntity<List<BookingDto>> getAllBooking() {
        List<BookingDto> response = bookingService.getMyBookings();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{bookingId}/status")
    @Operation(summary = "Update booking status", description = "Allowed transitions: PENDING → CONFIRMED → IN_PROGRESS → COMPLETED. Can also cancel anytime.")
    public ResponseEntity<BookingDto> updateBookingStatus(
            @PathVariable("bookingId") Long bookingId,
            @Valid @RequestBody UpdateBookingStatusRequest request) {

        BookingDto updated = bookingService.updateBookingStatus(bookingId, request);
        return ResponseEntity.ok(updated);
    }

}
