package com.shifting.service.impl;

import com.shifting.model.TimeSlot;
import com.shifting.payload.dto.SlotAvailabilityDto;
import com.shifting.repository.BookingSlotRepository;
import com.shifting.repository.TruckRepository;
import com.shifting.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService {

    private final BookingSlotRepository bookingSlotRepository;
    private final TruckRepository       truckRepository;

    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // ── GET BLOCKED DATES ──────────────────────────────────────────
    // Returns list of fully booked dates for next 60 days
    // Frontend uses this to show red dates on calendar
    @Override
    public List<String> getBlockedDates() {

        // Total slots per day = total active trucks × 2 slots
        long totalTrucks = truckRepository.findByIsActiveTrue().size();
        long totalSlotsPerDay = totalTrucks * 2; // MORNING + EVENING

        List<String> blockedDates = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // Check next 60 days
        for (int i = 0; i < 60; i++) {
            LocalDate date = today.plusDays(i);

            // Count how many slots are booked on this date
            long morningBooked = bookingSlotRepository
                    .countBySlotDateAndTimeSlot(date, TimeSlot.MORNING);
            long eveningBooked = bookingSlotRepository
                    .countBySlotDateAndTimeSlot(date, TimeSlot.EVENING);

            long totalBooked = morningBooked + eveningBooked;

            // If all slots filled → date is blocked
            if (totalBooked >= totalSlotsPerDay) {
                blockedDates.add(date.format(FMT));
            }
        }

        return blockedDates;
    }

    // ── GET SLOT AVAILABILITY FOR A DATE ──────────────────────────
    // Returns how many slots are free for Morning and Evening
    // on a specific date
    @Override
    public SlotAvailabilityDto getSlotAvailability(LocalDate date) {

        // Total active trucks = max slots per time slot
        long totalTrucks = truckRepository.findByIsActiveTrue().size();

        // How many trucks already booked for each slot
        long morningBooked = bookingSlotRepository
                .countBySlotDateAndTimeSlot(date, TimeSlot.MORNING);
        long eveningBooked = bookingSlotRepository
                .countBySlotDateAndTimeSlot(date, TimeSlot.EVENING);

        // Free slots = total trucks - already booked
        int morningSlotsLeft = (int)(totalTrucks - morningBooked);
        int eveningSlotsLeft = (int)(totalTrucks - eveningBooked);

        return SlotAvailabilityDto.builder()
                .date(date.format(FMT))
                .morning(SlotAvailabilityDto.SlotInfo.builder()
                        .available(morningSlotsLeft > 0)
                        .slotsLeft(Math.max(0, morningSlotsLeft))
                        .timing("8 AM – 1 PM")
                        .build())
                .evening(SlotAvailabilityDto.SlotInfo.builder()
                        .available(eveningSlotsLeft > 0)
                        .slotsLeft(Math.max(0, eveningSlotsLeft))
                        .timing("2 PM – 7 PM")
                        .build())
                .build();
    }
}