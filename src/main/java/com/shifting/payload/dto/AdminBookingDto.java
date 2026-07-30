package com.shifting.payload.dto;

import com.shifting.model.BookingStatus;
import com.shifting.model.TimeSlot;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminBookingDto {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String pickupAddress;
    private String dropAddress;
    private Double distanceKm;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private LocalDateTime createdAt;
    private List<BookingItemDto> items;

    // ── NEW FIELDS ─────────────────────────────────────────────────
    private LocalDate scheduledDate;
    private TimeSlot timeSlot;
    private String timeSlotTiming;

    // Truck + Driver (null until admin assigns)
    private Long truckId;
    private String truckRegNumber;
    private String truckSize;
    private Long driverId;
    private String driverName;
    private String driverPhone;

    // Is truck+driver assigned yet?
    private boolean assigned;
    // ──────────────────────────────────────────────────────────────
}