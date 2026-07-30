package com.shifting.service.impl;

import com.shifting.exception.ApiException;
import com.shifting.model.*;
import com.shifting.payload.dto.BookingDto;
import com.shifting.payload.request.CreateBookingRequest;
import com.shifting.payload.request.UpdateBookingStatusRequest;
import com.shifting.repository.*;
import com.shifting.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImplement implements BookingService {

    private final BookingRepository     bookingRepository;
    private final UserRepository        userRepository;
    private final EmailService          emailService;
    private final DistanceService       distanceService;
    private final PricingService        pricingService;
    private final BookingSlotRepository bookingSlotRepository;  // NEW
    private final TruckRepository       truckRepository;        // NEW

    @Override
    public BookingDto createBooking(CreateBookingRequest request) {

        User currentUser = getCurrentUser();

        // ── 1. Validate date is not in the past ───────────────────
        if (request.getScheduledDate().isBefore(java.time.LocalDate.now())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Scheduled date cannot be in the past"
            );
        }

        // ── 2. Check slot availability ────────────────────────────
        long totalTrucks = truckRepository.findByIsActiveTrue().size();
        long bookedForSlot = bookingSlotRepository
                .countBySlotDateAndTimeSlot(
                        request.getScheduledDate(),
                        request.getTimeSlot()
                );

        if (bookedForSlot >= totalTrucks) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "Sorry, the " + request.getTimeSlot().name().toLowerCase()
                            + " slot on " + request.getScheduledDate()
                            + " is fully booked. Please choose another date or slot."
            );
        }

        // ── 3. Calculate distance ─────────────────────────────────
        double distanceKm = distanceService.getRoadDistanceKm(
                request.getPickupLat(), request.getPickupLng(),
                request.getDropLat(),   request.getDropLng()
        );

        // ── 4. Calculate price ────────────────────────────────────
        BigDecimal totalAmount = pricingService.calculateTotalAmount(distanceKm);

        // ── 5. Save booking with date + slot ──────────────────────
        Booking booking = Booking.builder()
                .user(currentUser)
                .pickupAddress(request.getPickupAddress())
                .dropAddress(request.getDropAddress())
                .distanceKm(distanceKm)
                .totalAmount(totalAmount)
                .status(BookingStatus.PENDING)
                .scheduledDate(request.getScheduledDate())   // NEW
                .timeSlot(request.getTimeSlot())             // NEW
                .build();

        Booking saved = bookingRepository.save(booking);

        // ── 6. Send confirmation email ────────────────────────────
        emailService.sendBookingCreatedEmail(currentUser, saved);

        return mapToDto(saved);
    }

    @Override
    public BookingDto getBookingById(Long id) {
        Booking booking = bookingRepository
                .findByIdAndUserId(id, getCurrentUser().getId())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.BAD_REQUEST, "Booking not found with id: " + id
                ));
        return mapToDto(booking);
    }

    @Override
    public List<BookingDto> getMyBookings() {
        return bookingRepository
                .findByUserId(getCurrentUser().getId())
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public BookingDto updateBookingStatus(Long id, UpdateBookingStatusRequest request) {
        Booking booking = bookingRepository
                .findByIdAndUserId(id, getCurrentUser().getId())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.BAD_REQUEST, "Booking not found"
                ));
        booking.setStatus(request.getStatus());
        Booking updated = bookingRepository.save(booking);
        return mapToDto(updated);
    }

    @Override
    public void deleteBooking(Long id) {
        User currentUser = getCurrentUser();
        Booking booking = bookingRepository
                .findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.BAD_REQUEST, "Booking not found"
                ));
        bookingRepository.delete(booking);
        emailService.sendBookingCancelledEmail(currentUser, booking);
    }

    // ── HELPERS ───────────────────────────────────────────────────

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByEmail(email);
        if (user == null)
            throw new ApiException(HttpStatus.BAD_REQUEST, "User not found");
        return user;
    }

    private BookingDto mapToDto(Booking b) {

        // Slot timing label
        String timing = null;
        if (b.getTimeSlot() != null) {
            timing = b.getTimeSlot() == TimeSlot.MORNING
                    ? "8 AM – 1 PM"
                    : "2 PM – 7 PM";
        }

        // Truck + Driver info (only if admin has assigned)
        String truckReg   = null;
        String truckSize  = null;
        String driverName = null;
        String driverPhone= null;

        if (b.getBookingSlot() != null) {
            truckReg    = b.getBookingSlot().getTruck().getRegNumber();
            truckSize   = b.getBookingSlot().getTruck().getSize().name();
            driverName  = b.getBookingSlot().getDriver().getName();
            driverPhone = b.getBookingSlot().getDriver().getPhone();
        }

        return BookingDto.builder()
                .id(b.getId())
                .pickupAddress(b.getPickupAddress())
                .dropAddress(b.getDropAddress())
                .distanceKm(b.getDistanceKm())
                .totalAmount(b.getTotalAmount())
                .status(b.getStatus())
                .createdAt(b.getCreatedAt())
                .scheduledDate(b.getScheduledDate())
                .timeSlot(b.getTimeSlot())
                .timeSlotTiming(timing)
                .truckRegNumber(truckReg)
                .truckSize(truckSize)
                .driverName(driverName)
                .driverPhone(driverPhone)
                .build();
    }
}