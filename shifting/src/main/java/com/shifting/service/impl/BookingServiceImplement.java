package com.shifting.service.impl;

import com.shifting.exception.ApiException;
import com.shifting.model.Booking;
import com.shifting.model.BookingStatus;
import com.shifting.model.User;
import com.shifting.payload.dto.BookingDto;
import com.shifting.payload.request.CreateBookingRequest;
import com.shifting.payload.request.UpdateBookingStatusRequest;
import com.shifting.repository.BookingRepository;
import com.shifting.repository.UserRepository;
import com.shifting.service.BookingService;
import com.shifting.service.DistanceService;
import com.shifting.service.EmailService;
import com.shifting.service.PricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImplement implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final DistanceService distanceService;   // NEW
    private final PricingService pricingService;     // NEW

    @Override
    public BookingDto createBooking(CreateBookingRequest request) {

        User currentUser = getCurrentUser();

        // 1. Calculate real road distance via OpenRouteService (falls back to Haversine)
        double distanceKm = distanceService.getRoadDistanceKm(
                request.getPickupLat(), request.getPickupLng(),
                request.getDropLat(), request.getDropLng()
        );

        // 2. Calculate price: Rs 200 base + Rs 12/km
        BigDecimal totalAmount = pricingService.calculateTotalAmount(distanceKm);

        // 3. Build and save booking
        Booking booking = Booking.builder()
                .user(currentUser)
                .pickupAddress(request.getPickupAddress())
                .dropAddress(request.getDropAddress())
                .distanceKm(distanceKm)
                .totalAmount(totalAmount)
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);

        // 4. Send confirmation email
        emailService.sendBookingCreatedEmail(currentUser.getEmail(), saved);

        return mapToDto(saved);
    }

    @Override
    public BookingDto getBookingById(Long id) {
        Booking booking = bookingRepository.findByIdAndUserId(id, getCurrentUser().getId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Booking not found with id: " + id));
        return mapToDto(booking);
    }

    @Override
    public List<BookingDto> getMyBookings() {
        return bookingRepository.findByUserId(getCurrentUser().getId())
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public BookingDto updateBookingStatus(Long id, UpdateBookingStatusRequest request) {
        Booking booking = bookingRepository.findByIdAndUserId(id, getCurrentUser().getId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Booking not found"));

        booking.setStatus(request.getStatus());
        Booking updated = bookingRepository.save(booking);
        return mapToDto(updated);
    }

    @Override
    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findByIdAndUserId(id, getCurrentUser().getId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Booking not found"));
        bookingRepository.delete(booking);
        emailService.sendBookingCancelledEmail(getCurrentUser().getEmail(), booking);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "User not found"));
    }

    private BookingDto mapToDto(Booking booking) {
        return BookingDto.builder()
                .id(booking.getId())
                .pickupAddress(booking.getPickupAddress())
                .dropAddress(booking.getDropAddress())
                .distanceKm(booking.getDistanceKm())     // NEW
                .totalAmount(booking.getTotalAmount())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}