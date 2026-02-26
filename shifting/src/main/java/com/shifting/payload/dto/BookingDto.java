package com.shifting.payload.dto;

import com.shifting.model.BookingStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDto {
    private Long id;
    private String pickupAddress;

    private String dropAddress;

    private BigDecimal totalAmount;

    private BookingStatus status;

    private LocalDateTime createdAt;
}
