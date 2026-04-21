package com.shifting.service.impl;

import com.shifting.exception.ApiException;
import com.shifting.model.*;
import com.shifting.payload.dto.*;
import com.shifting.payload.request.PredefinedItemRequest;
import com.shifting.repository.*;
import com.shifting.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository           userRepository;
    private final BookingRepository        bookingRepository;
    private final PredefinedItemRepository predefinedItemRepository;
    private final PaymentRepository        paymentRepository;
    private final BookingItemRepository    bookingItemRepository;

    // ── DASHBOARD ──────────────────────────────────────────────────
    @Override
    public AdminDashboardDto getDashboardStats() {
        List<Booking> allBookings = bookingRepository.findAll();

        long pending    = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.PENDING).count();
        long confirmed  = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.CONFIRMED).count();
        long inProgress = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.IN_PROGRESS).count();
        long completed  = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count();
        long cancelled  = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();

        // Revenue = sum of all COMPLETED booking amounts
        BigDecimal revenue = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .map(Booking::getTotalAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return AdminDashboardDto.builder()
                .totalUsers(userRepository.count())
                .totalBookings(allBookings.size())
                .pendingBookings(pending)
                .confirmedBookings(confirmed)
                .inProgressBookings(inProgress)
                .completedBookings(completed)
                .cancelledBookings(cancelled)
                .totalRevenue(revenue)
                .totalPredefinedItems(predefinedItemRepository.count())
                .totalPayments(paymentRepository.count())
                .build();
    }

    // ── USERS ──────────────────────────────────────────────────────
    @Override
    public List<AdminUserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> AdminUserDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .role(user.getRole())
                        .totalBookings(bookingRepository.findByUserId(user.getId()).size())
                        .totalPayments(paymentRepository.findByBookingUserId(user.getId()).size())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public AdminUserDto getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "User not found: " + userId));
        return AdminUserDto.builder()
                .id(user.getId()).name(user.getName())
                .email(user.getEmail()).phone(user.getPhone())
                .role(user.getRole())
                .totalBookings(bookingRepository.findByUserId(userId).size())
                .totalPayments(paymentRepository.findByBookingUserId(userId).size())
                .build();
    }

    @Override
    public AdminUserDto makeAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "User not found: " + userId));
        user.setRole(Role.ADMIN);
        userRepository.save(user);
        return getUserById(userId);
    }

    @Override
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "User not found: " + userId));
        if (user.getRole() == Role.ADMIN)
            throw new ApiException(
                    HttpStatus.BAD_REQUEST, "Cannot delete an admin user");
        userRepository.delete(user);
    }

    // ── BOOKINGS ───────────────────────────────────────────────────
    @Override
    public List<AdminBookingDto> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::toAdminBookingDto)
                .collect(Collectors.toList());
    }

    @Override
    public AdminBookingDto getBookingById(Long bookingId) {
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Booking not found: " + bookingId));
        return toAdminBookingDto(b);
    }

    @Override
    public AdminBookingDto updateBookingStatus(Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Booking not found: " + bookingId));
        booking.setStatus(status);
        bookingRepository.save(booking);
        return toAdminBookingDto(booking);
    }

    @Override
    public void deleteBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Booking not found: " + bookingId));
        bookingRepository.delete(booking);
    }

    // ── PREDEFINED ITEMS ───────────────────────────────────────────
    @Override
    public List<PredefinedItem> getAllItems() {
        return predefinedItemRepository.findAll();
    }

    @Override
    public PredefinedItem addItem(PredefinedItemRequest request) {
        if (predefinedItemRepository.findByName(request.getName()).isPresent())
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "Item already exists: " + request.getName());

        PredefinedItem item = PredefinedItem.builder()
                .name(request.getName())
                .price(request.getPrice())
                .build();
        return predefinedItemRepository.save(item);
    }

    @Override
    public PredefinedItem updateItem(Long id, PredefinedItemRequest request) {
        PredefinedItem item = predefinedItemRepository.findById(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Item not found: " + id));
        item.setName(request.getName());
        item.setPrice(request.getPrice());
        return predefinedItemRepository.save(item);
    }

    @Override
    public void deleteItem(Long id) {
        PredefinedItem item = predefinedItemRepository.findById(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Item not found: " + id));
        predefinedItemRepository.delete(item);
    }

    // ── HELPER ─────────────────────────────────────────────────────
    private AdminBookingDto toAdminBookingDto(Booking b) {
        List<BookingItemDto> items = b.getItems() == null ? List.of() :
                b.getItems().stream().map(i -> BookingItemDto.builder()
                                               .id(i.getId())
                                               .predefinedItemId(i.getPredefinedItem() != null ? i.getPredefinedItem().getId() : null)
                                               .predefinedItemName(i.getPredefinedItem() != null ? i.getPredefinedItem().getName() : null)
                                               .customName(i.getCustomName())
                                               .quantity(i.getQuantity())
                                               .size(i.getSize() != null ? i.getSize().name() : null)
                                               .price(i.getPrice())
                                               .build())
                .collect(Collectors.toList());

        return AdminBookingDto.builder()
                .id(b.getId())
                .userId(b.getUser().getId())
                .userName(b.getUser().getName())
                .userEmail(b.getUser().getEmail())
                .userPhone(b.getUser().getPhone())
                .pickupAddress(b.getPickupAddress())
                .dropAddress(b.getDropAddress())
                .distanceKm(b.getDistanceKm())
                .totalAmount(b.getTotalAmount())
                .status(b.getStatus())
                .createdAt(b.getCreatedAt())
                .items(items)
                .build();
    }
}