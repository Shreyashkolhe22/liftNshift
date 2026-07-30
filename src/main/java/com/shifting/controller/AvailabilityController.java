package com.shifting.controller;

import com.shifting.payload.dto.SlotAvailabilityDto;
import com.shifting.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    // GET /api/availability/blocked-dates
    // Returns list of fully booked dates
    // Frontend uses this to show RED dates on calendar
    @GetMapping("/blocked-dates")
    public ResponseEntity<List<String>> getBlockedDates() {
        return ResponseEntity.ok(
                availabilityService.getBlockedDates()
        );
    }

    // GET /api/availability/slots?date=2025-04-15
    // Returns morning + evening slot availability for a date
    // Frontend uses this when user clicks a date on calendar
    @GetMapping("/slots")
    public ResponseEntity<SlotAvailabilityDto> getSlotAvailability(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {

        return ResponseEntity.ok(
                availabilityService.getSlotAvailability(date)
        );
    }
}