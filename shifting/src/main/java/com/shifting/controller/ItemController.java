package com.shifting.controller;

import com.shifting.payload.dto.BookingItemDto;
import com.shifting.payload.dto.BookingDto;
import com.shifting.payload.request.AddBookingItemRequest;
import com.shifting.service.BookingItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class ItemController {

    private final BookingItemService bookingItemService;

    // Add Item
    @PostMapping("/items")
    public ResponseEntity<BookingDto> addItemToBooking(
            @RequestBody AddBookingItemRequest request) {

        return ResponseEntity.ok(
                bookingItemService.addItemToBooking(request)
        );
    }

    // 1️⃣ Get single item
    @GetMapping("/{bookingId}/items/{itemId}")
    public ResponseEntity<BookingItemDto> getItemById(
            @PathVariable Long bookingId,
            @PathVariable Long itemId) {

        return ResponseEntity.ok(
                bookingItemService.getItemById(bookingId, itemId)
        );
    }

    // 2️⃣ Get all items of particular booking
    @GetMapping("/{bookingId}/items")
    public ResponseEntity<List<BookingItemDto>> getItemsByBooking(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(
                bookingItemService.getItemsByBookingId(bookingId)
        );
    }

    // 3️⃣ Delete item
    @DeleteMapping("/{bookingId}/items/{itemId}")
    public ResponseEntity<String> deleteItem(
            @PathVariable Long bookingId,
            @PathVariable Long itemId) {

        bookingItemService.deleteItem(bookingId, itemId);
        return ResponseEntity.ok("Item deleted successfully");
    }

    // 4️⃣ Update quantity
    @PutMapping("/{bookingId}/items/{itemId}/quantity")
    public ResponseEntity<String> updateQuantity(
            @PathVariable Long bookingId,
            @PathVariable Long itemId,
            @RequestParam Integer quantity) {

        bookingItemService.updateQuantity(bookingId, itemId, quantity);
        return ResponseEntity.ok("Quantity updated successfully");
    }
}
