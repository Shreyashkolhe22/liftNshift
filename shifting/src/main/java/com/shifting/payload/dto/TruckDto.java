package com.shifting.payload.dto;

import com.shifting.model.TruckSize;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TruckDto {
    private Long id;
    private String regNumber;
    private TruckSize size;
    private Integer capacityKg;
    private Boolean isActive;
}