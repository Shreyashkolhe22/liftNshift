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


@Service
@RequiredArgsConstructor
public class BookingServiceImplement implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Override
    public BookingDto createBooking(CreateBookingRequest request) {

        // 1. Get logged-in user
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // 2. Create booking
        Booking booking = new Booking();
        booking.setPickupAddress(request.getPickupAddress());
        booking.setDropAddress(request.getDropAddress());
        booking.setUser(user);
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalAmount(BigDecimal.ZERO);

        Booking saved = bookingRepository.save(booking);

        // 3. Convert to DTO
        return mapToDto(saved);
    }

    private BookingDto mapToDto(Booking booking) {

        BookingDto dto = new BookingDto();
        dto.setId(booking.getId());
        dto.setStatus(booking.getStatus());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setCreatedAt(booking.getCreatedAt());

        return dto;
    }

    @Override
    public BookingDto getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return mapToDto(booking);
    }

    @Override
    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }
}
