package com.shifting.repository;

import com.shifting.model.Payment;
import com.shifting.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    boolean existsByBookingIdAndStatus(Long bookingId, PaymentStatus status);
    List<Payment> findByBookingId(Long bookingId);

    // NEW — needed for admin user stats
    List<Payment> findByBookingUserId(Long userId);
}