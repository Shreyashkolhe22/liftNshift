package com.shifting.payload.dto;

import com.shifting.model.PaymentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentDto {
    private Long          id;
    private String        razorpayOrderId;
    private String        razorpayPaymentId;
    private BigDecimal    amount;
    private String        currency;
    private PaymentStatus status;
    private String        paymentMethod;
    private Long          bookingId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}