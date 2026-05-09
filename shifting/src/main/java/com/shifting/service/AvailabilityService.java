package com.shifting.service;

import com.shifting.payload.dto.SlotAvailabilityDto;
import java.time.LocalDate;
import java.util.List;

public interface AvailabilityService {

    // Get blocked dates (fully booked) for next 60 days
    List<String> getBlockedDates();

    // Get slot availability for a specific date
    SlotAvailabilityDto getSlotAvailability(LocalDate date);
}