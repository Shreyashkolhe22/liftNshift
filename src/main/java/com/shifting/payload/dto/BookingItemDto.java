package com.shifting.payload.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BookingItemDto {

    private Long id;

    private Long bookingId;

    // For predefined item
    private Long predefinedItemId;
    private String predefinedItemName;

    // For custom item
    private String customName;
    private String size;

    private Integer quantity;

    private BigDecimal price;
}
