package com.shifting.service.impl;

import com.shifting.model.Booking;
import com.shifting.model.BookingStatus;
import com.shifting.model.User;
import com.shifting.payload.dto.BookingDto;
import com.shifting.payload.request.CreateBookingRequest;
import com.shifting.payload.request.UpdateBookingStatusRequest;
import com.shifting.repository.BookingRepository;
import com.shifting.repository.UserRepository;
import com.shifting.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.shifting.exception.ApiException;
import org.springframework.http.HttpStatus;
import com.shifting.service.EmailService;

import java.math.BigDecimal;
import java.util.List;


@Service
@RequiredArgsConstructor
public class BookingServiceImplement implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    public BookingDto createBooking(CreateBookingRequest request) {

        User user = getCurrentUser();

        Booking booking = new Booking();
        booking.setPickupAddress(request.getPickupAddress());
        booking.setDropAddress(request.getDropAddress());
        booking.setUser(user);
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalAmount(BigDecimal.ZERO);

        Booking saved = bookingRepository.save(booking);

        // Send booking created email (async)
        try {
            emailService.sendBookingCreatedEmail(user, saved);
        } catch (Exception ignored) {
            // don't fail booking creation because of email issues
        }

        return mapToDto(saved);
    }

    @Override
    public BookingDto getBookingById(Long id) {

        User currentUser = getCurrentUser();

        Booking booking = bookingRepository
                .findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

        return mapToDto(booking);
    }

    @Override
    public void deleteBooking(Long id) {

        User currentUser = getCurrentUser();

        Booking booking = bookingRepository
                .findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

        bookingRepository.delete(booking);
    }

    @Override
    public List<BookingDto> getMyBookings() {

        User user = getCurrentUser();

        List<Booking> bookings =
                bookingRepository.findByUserId(user.getId());

        return bookings.stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public BookingDto updateBookingStatus(Long bookingId, UpdateBookingStatusRequest request) {

        // 1. Get the logged-in user
        User currentUser = getCurrentUser();

        // 2. Find the booking — must belong to this user
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, currentUser.getId())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found with id: " + bookingId
                ));

        // 3. Guard: don't allow going backwards in status
        //    e.g. COMPLETED → PENDING is not allowed
        BookingStatus current = booking.getStatus();
        BookingStatus next = request.getStatus();

        if (current == BookingStatus.COMPLETED || current == BookingStatus.CANCELLED) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot change status of a " + current + " booking"
            );
        }

        // 4. Apply and save
        booking.setStatus(next);
        bookingRepository.save(booking);

        // Send cancellation email if booking was cancelled
        if (next == BookingStatus.CANCELLED) {
            try {
                emailService.sendBookingCancelledEmail(booking.getUser(), booking);
            } catch (Exception ignored) {
            }
        }

        return mapToDto(booking);
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
