package com.shifting.service.impl;

import com.shifting.model.*;
import com.shifting.payload.dto.BookingDto;
import com.shifting.payload.dto.BookingItemDto;
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
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingItemServiceImplementation implements BookingItemService {

    private final BookingRepository bookingRepository;
    private final BookingItemRepository bookingItemRepository;
    private final PredefinedItemRepository predefinedItemRepository;
    private final UserRepository userRepository;

    // ADD ITEM
    @Override
    public BookingDto addItemToBooking(AddBookingItemRequest request) {

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        User currentUser = getCurrentUser();

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot modify completed booking");
        }

        BookingItem bookingItem = new BookingItem();
        bookingItem.setBooking(booking);
        bookingItem.setQuantity(request.getQuantity());

        BigDecimal totalPrice;

        if (request.getPredefinedItemId() != null) {

            PredefinedItem predefinedItem = predefinedItemRepository
                    .findById(request.getPredefinedItemId())
                    .orElseThrow(() -> new RuntimeException("Predefined item not found"));

            bookingItem.setPredefinedItem(predefinedItem);

            totalPrice = predefinedItem.getPrice()
                    .multiply(BigDecimal.valueOf(request.getQuantity()));

        } else if (request.getSize() != null) {

            bookingItem.setCustomName(request.getCustomName());
            bookingItem.setSize(request.getSize());

            BigDecimal basePrice = calculateCustomPrice(request.getSize());

            totalPrice = basePrice
                    .multiply(BigDecimal.valueOf(request.getQuantity()));

        } else {
            throw new RuntimeException("Invalid item request");
        }

        bookingItem.setPrice(totalPrice);
        bookingItemRepository.save(bookingItem);

        updateBookingTotal(booking);

        return mapToBookingDto(booking);
    }

    @Override
    public BookingItemDto getItemById(Long bookingId, Long itemId) {

        User currentUser = getCurrentUser();

        BookingItem item = bookingItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (!item.getBooking().getId().equals(bookingId)) {
            throw new RuntimeException("Item does not belong to this booking");
        }

        if (!item.getBooking().getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        return mapToItemDto(item);
    }


    // GET ALL ITEMS BY BOOKING
    @Override
    public List<BookingItemDto> getItemsByBookingId(Long bookingId) {

        User currentUser = getCurrentUser();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        return bookingItemRepository.findByBookingId(bookingId)
                .stream()
                .map(this::mapToItemDto)
                .toList();
    }


    // DELETE ITEM
    @Override
    public void deleteItem(Long bookingId, Long itemId) {

        User currentUser = getCurrentUser();

        BookingItem item = bookingItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        Booking booking = item.getBooking();

        if (!booking.getId().equals(bookingId)) {
            throw new RuntimeException("Invalid booking");
        }

        if (!booking.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot modify completed booking");
        }

        bookingItemRepository.delete(item);

        updateBookingTotal(booking);
    }



    // UPDATE QUANTITY
    @Override
    public void updateQuantity(Long bookingId, Long itemId, Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        User currentUser = getCurrentUser();

        BookingItem item = bookingItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        Booking booking = item.getBooking();

        if (!booking.getId().equals(bookingId)) {
            throw new RuntimeException("Invalid booking");
        }

        if (!booking.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot modify completed booking");
        }

        BigDecimal unitPrice = item.getPrice()
                .divide(BigDecimal.valueOf(item.getQuantity()));

        BigDecimal newTotal =
                unitPrice.multiply(BigDecimal.valueOf(quantity));

        item.setQuantity(quantity);
        item.setPrice(newTotal);

        bookingItemRepository.save(item);

        updateBookingTotal(booking);
    }


    // CUSTOM PRICE
    private BigDecimal calculateCustomPrice(ItemSize size) {
        return switch (size) {
            case SMALL -> BigDecimal.valueOf(1000);
            case MEDIUM -> BigDecimal.valueOf(2000);
            case LARGE -> BigDecimal.valueOf(3000);
        };
    }

    // UPDATE BOOKING TOTAL
    private void updateBookingTotal(Booking booking) {

        BigDecimal total = bookingItemRepository
                .findByBookingId(booking.getId())
                .stream()
                .map(BookingItem::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        booking.setTotalAmount(total);

        bookingRepository.save(booking);
    }

    // MAPPERS
    private BookingItemDto mapToItemDto(BookingItem item) {

        return BookingItemDto.builder()
                .id(item.getId())
                .bookingId(item.getBooking().getId())
                .predefinedItemId(
                        item.getPredefinedItem() != null ?
                                item.getPredefinedItem().getId() : null)
                .predefinedItemName(
                        item.getPredefinedItem() != null ?
                                item.getPredefinedItem().getName() : null)
                .customName(item.getCustomName())
                .size(item.getSize() != null ?
                        item.getSize().name() : null)
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .build();
    }

    private BookingDto mapToBookingDto(Booking booking) {

        return BookingDto.builder()
                .id(booking.getId())
                .pickupAddress(booking.getPickupAddress())
                .dropAddress(booking.getDropAddress())
                .status(booking.getStatus())
                .totalAmount(booking.getTotalAmount())
                .createdAt(booking.getCreatedAt())
                .build();
    }

    // GET CURRENT USER
    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        if(email == null) {
            throw new RuntimeException("Authentication error: email not found");
        }

        return userRepository.findByEmail(email);
    }
}
