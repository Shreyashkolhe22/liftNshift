package com.shifting.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Razorpay fields ───────────────────────────────────────────────────────

    @Column(name = "razorpay_order_id", nullable = false, unique = true)
    private String razorpayOrderId;      // created when order is initiated

    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;    // set after successful payment

    @Column(name = "razorpay_signature")
    private String razorpaySignature;    // set after verification

    // ── Payment details ───────────────────────────────────────────────────────

    @Column(nullable = false)
    private BigDecimal amount;           // in INR (not paise)

    @Column(nullable = false)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;        // CREATED → SUCCESS or FAILED

    @Column(name = "payment_method")
    private String paymentMethod;        // upi / card / netbanking (set on success)

    // ── Relation ──────────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    // ── Audit ─────────────────────────────────────────────────────────────────

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}