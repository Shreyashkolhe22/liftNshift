package com.shifting.payload.dto;

import com.shifting.model.BookingStatus;
import com.shifting.model.TimeSlot;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingDto {

    private Long id;
    private String pickupAddress;
    private String dropAddress;
    private Double distanceKm;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private LocalDateTime createdAt;

    // ── NEW FIELDS ─────────────────────────────────────────────────
    private LocalDate scheduledDate;   // date user chose
    private TimeSlot timeSlot;         // MORNING or EVENING
    private String timeSlotTiming;     // "8 AM – 1 PM" or "2 PM – 7 PM"

    // Truck + Driver info (filled after admin assigns)
    private String truckRegNumber;
    private String truckSize;
    private String driverName;
    private String driverPhone;
    // ──────────────────────────────────────────────────────────────
}