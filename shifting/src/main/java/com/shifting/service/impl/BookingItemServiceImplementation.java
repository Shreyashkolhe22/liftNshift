package com.shifting.service.impl;

import com.shifting.model.*;
import com.shifting.payload.dto.BookingDto;
import com.shifting.payload.request.AddBookingItemRequest;
import com.shifting.repository.BookingItemRepository;
import com.shifting.repository.BookingRepository;
import com.shifting.repository.PredefinedItemRepository;
import com.shifting.repository.UserRepository;
import com.shifting.service.BookingItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingItemServiceImplementation implements BookingItemService {

    private final BookingRepository bookingRepository;
    private final BookingItemRepository bookingItemRepository;
    private final PredefinedItemRepository predefinedItemRepository;
    private final UserRepository userRepository;

    @Override
    public BookingDto addItemToBooking(AddBookingItemRequest request) {
        User currentUser = getCurrentUser();

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Security check
        if (!booking.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        BookingItem bookingItem = new BookingItem();
        bookingItem.setBooking(booking);
        bookingItem.setQuantity(request.getQuantity());

        BigDecimal price;

        // 🔹 Case 1: Predefined Item
        if (request.getPredefinedItemId() != null) {

            PredefinedItem predefinedItem =
                    predefinedItemRepository.findById(request.getPredefinedItemId())
                            .orElseThrow(() -> new RuntimeException("Item not found"));

            bookingItem.setPredefinedItem(predefinedItem);

            price = predefinedItem.getPrice()
                    .multiply(BigDecimal.valueOf(request.getQuantity()));

        } else {
            // 🔹 Case 2: Custom Item

            bookingItem.setCustomName(request.getCustomName());
            bookingItem.setSize(request.getSize());

            BigDecimal basePrice = calculateCustomPrice(request.getSize());

            price = basePrice.multiply(BigDecimal.valueOf(request.getQuantity()));
        }

        bookingItem.setPrice(price);

        bookingItemRepository.save(bookingItem);

        // Update total booking amount
        updateBookingTotal(booking);

        return mapToDto(booking);
    }

    private BigDecimal calculateCustomPrice(ItemSize size) {
        return switch (size) {
            case SMALL -> BigDecimal.valueOf(1000);
            case MEDIUM -> BigDecimal.valueOf(2000);
            case LARGE -> BigDecimal.valueOf(3000);
        };
    }

    private void updateBookingTotal(Booking booking) {

        List<BookingItem> items =
                bookingItemRepository.findByBookingId(booking.getId());

        BigDecimal total = items.stream()
                .map(BookingItem::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        booking.setTotalAmount(total);

        bookingRepository.save(booking);
    }

    private BookingDto mapToDto(Booking booking) {

        return BookingDto.builder()
                .id(booking.getId())
                .pickupAddress(booking.getPickupAddress())
                .dropAddress(booking.getDropAddress())
                .status(booking.getStatus())
                .totalAmount(booking.getTotalAmount())
                .createdAt(booking.getCreatedAt())
                .build();
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return userRepository.findByEmail(email);
    }


}
