package com.shifting.service.impl;

import com.shifting.model.Booking;
import com.shifting.model.BookingStatus;
import com.shifting.model.User;
import com.shifting.payload.dto.BookingDto;
import com.shifting.payload.request.CreateBookingRequest;
import com.shifting.repository.BookingRepository;
import com.shifting.repository.UserRepository;
import com.shifting.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;


@Service
@RequiredArgsConstructor
public class BookingServiceImplement implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

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

        return mapToDto(saved);
    }

    @Override
    public BookingDto getBookingById(Long id) {

        User currentUser = getCurrentUser();

        Booking booking = bookingRepository
                .findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        return mapToDto(booking);
    }

    @Override
    public void deleteBooking(Long id) {

        User currentUser = getCurrentUser();

        Booking booking = bookingRepository
                .findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

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
