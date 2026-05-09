package com.shifting.payload.dto;

import com.shifting.model.BookingStatus;
import com.shifting.model.TimeSlot;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AssignmentResponseDto {

    // Booking info
    private Long bookingId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String pickupAddress;
    private String dropAddress;
    private Double distanceKm;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private LocalDate scheduledDate;
    private TimeSlot timeSlot;
    private String timeSlotTiming;

    // Assigned truck
    private Long truckId;
    private String truckRegNumber;
    private String truckSize;

    // Assigned driver
    private Long driverId;
    private String driverName;
    private String driverPhone;
}