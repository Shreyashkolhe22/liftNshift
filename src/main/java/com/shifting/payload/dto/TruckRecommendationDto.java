package com.shifting.payload.dto;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TruckRecommendationDto {

    // AI recommendation
    private String recommendedTruckSize;   // SMALL / MEDIUM / LARGE
    private String confidence;             // HIGH / MEDIUM / LOW
    private int    estimatedLoadPercent;   // 0-100
    private String reason;                 // AI explanation
    private String warning;               // nullable

    // Available trucks of recommended size
    private List<TruckDto>  availableTrucks;
    private List<DriverDto> availableDrivers;
}