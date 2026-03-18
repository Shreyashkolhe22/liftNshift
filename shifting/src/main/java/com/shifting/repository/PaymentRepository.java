package com.shifting.repository;

import com.shifting.model.Payment;
import com.shifting.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Find by Razorpay order ID — used during verification
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    // Check if a booking has a successful payment — used before confirming
    boolean existsByBookingIdAndStatus(Long bookingId, PaymentStatus status);

    // Get all payments for a booking — useful for admin/history
    List<Payment> findByBookingId(Long bookingId);
}