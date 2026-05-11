package com.shifting.payload.request;

import com.shifting.model.TimeSlot;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class CreateBookingRequest {

    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;

    @NotBlank(message = "Drop address is required")
    private String dropAddress;

    @NotNull(message = "Pickup latitude is required")
    private Double pickupLat;

    @NotNull(message = "Pickup longitude is required")
    private Double pickupLng;

    @NotNull(message = "Drop latitude is required")
    private Double dropLat;

    @NotNull(message = "Drop longitude is required")
    private Double dropLng;

    // ── NEW FIELDS ─────────────────────────────────────────────────
    @NotNull(message = "Scheduled date is required")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate scheduledDate;

    @NotNull(message = "Time slot is required")
    private TimeSlot timeSlot;   // MORNING or EVENING
    // ──────────────────────────────────────────────────────────────
}