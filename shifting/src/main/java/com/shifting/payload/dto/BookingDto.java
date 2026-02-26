package com.shifting.payload.dto;

import com.shifting.model.BookingStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BookingDto {
    private Long id;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private LocalDateTime createdAt;
}
