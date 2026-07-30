package com.shifting.payload.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SlotAvailabilityDto {

    private String date;          // "2025-04-15"

    private SlotInfo morning;     // Morning slot info
    private SlotInfo evening;     // Evening slot info

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SlotInfo {
        private boolean available;  // true = slots free
        private int slotsLeft;      // how many trucks free
        private String timing;      // "8 AM – 1 PM"
    }
}