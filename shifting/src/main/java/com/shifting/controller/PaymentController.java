package com.shifting.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.shifting.exception.ApiException;
import com.shifting.model.*;
import com.shifting.payload.dto.PaymentDto;
import com.shifting.repository.BookingRepository;
import com.shifting.repository.PaymentRepository;
import com.shifting.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "Razorpay payment integration")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final PaymentRepository  paymentRepository;
    private final BookingRepository  bookingRepository;
    private final UserService        userService;

    // ── 1. Create Order ───────────────────────────────────────────────────────
    // Creates a Razorpay order AND saves a CREATED payment record to DB
    @PostMapping("/create-order")
    @Operation(summary = "Create Razorpay order and save payment record")
    public ResponseEntity<Map<String, Object>> createOrder(
            @RequestBody Map<String, Object> request) {

        Long bookingId = Long.parseLong(request.get("bookingId").toString());

        // ── Validate booking belongs to current user ──
        User currentUser = userService.getCurrentUser();
        Booking booking  = bookingRepository.findByIdAndUserId(bookingId, currentUser.getId())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Booking not found"));

        // ── Guard: only PENDING bookings can be paid ──
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Only PENDING bookings can be paid. Current status: " + booking.getStatus());
        }

        // ── Guard: booking must have items ──
        if (booking.getItems() == null || booking.getItems().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Cannot pay for a booking with no items");
        }

        // ── Guard: prevent duplicate payment — check if SUCCESS already exists ──
        if (paymentRepository.existsByBookingIdAndStatus(bookingId, PaymentStatus.SUCCESS)) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Payment already completed for this booking");
        }

        try {
            BigDecimal amountInRupees = new BigDecimal(request.get("amount").toString());
            long       amountInPaise  = amountInRupees
                    .multiply(BigDecimal.valueOf(100))
                    .longValue();

            // ── Create order in Razorpay ──
            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount",   amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt",  "booking_" + bookingId);
            orderRequest.put("notes", new JSONObject()
                    .put("bookingId", bookingId.toString())
                    .put("userId",    currentUser.getId().toString())
            );

            Order razorpayOrder = client.orders.create(orderRequest);
            String razorpayOrderId = razorpayOrder.get("id");

            // ── Save CREATED payment record to DB ──
            Payment payment = Payment.builder()
                    .razorpayOrderId(razorpayOrderId)
                    .amount(amountInRupees)
                    .currency("INR")
                    .status(PaymentStatus.CREATED)
                    .booking(booking)
                    .build();

            paymentRepository.save(payment);

            return ResponseEntity.ok(Map.of(
                    "orderId",  razorpayOrderId,
                    "amount",   amountInPaise,
                    "currency", "INR",
                    "keyId",    keyId
            ));

        } catch (RazorpayException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to create payment order: " + e.getMessage());
        }
    }

    // ── 2. Verify Payment ─────────────────────────────────────────────────────
    // Verifies HMAC signature, updates payment record to SUCCESS,
    // then marks booking as CONFIRMED — all in one atomic flow
    @PostMapping("/verify")
    @Operation(summary = "Verify payment and confirm booking")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @RequestBody Map<String, String> request) {

        String razorpayOrderId   = request.get("razorpayOrderId");
        String razorpayPaymentId = request.get("razorpayPaymentId");
        String razorpaySignature = request.get("razorpaySignature");
        String paymentMethod     = request.getOrDefault("paymentMethod", "unknown");

        if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Missing payment verification fields");
        }

        // ── Find the payment record we saved during create-order ──
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "No payment record found for order: " + razorpayOrderId));

        // ── Guard: already verified ──
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return ResponseEntity.ok(Map.of(
                    "verified",   true,
                    "paymentId",  payment.getRazorpayPaymentId(),
                    "message",    "Payment already verified"
            ));
        }

        try {
            // ── Verify HMAC-SHA256 signature ──
            String payload  = razorpayOrderId + "|" + razorpayPaymentId;
            String computed = hmacSha256(payload, keySecret);

            if (!computed.equals(razorpaySignature)) {
                // Mark payment as FAILED in DB
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);

                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "Payment verification failed — invalid signature");
            }

            // ── Signature valid → update payment record to SUCCESS ──
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setRazorpaySignature(razorpaySignature);
            payment.setPaymentMethod(paymentMethod);
            payment.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(payment);

            // ── Update booking status to CONFIRMED ──
            Booking booking = payment.getBooking();
            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

            return ResponseEntity.ok(Map.of(
                    "verified",   true,
                    "paymentId",  razorpayPaymentId,
                    "bookingId",  booking.getId(),
                    "message",    "Payment verified and booking confirmed"
            ));

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            // Mark payment as FAILED on any unexpected error
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);

            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Payment verification error: " + e.getMessage());
        }
    }

    // ── 3. Get payment history for a booking ─────────────────────────────────
    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get payment history for a booking")
    public ResponseEntity<List<PaymentDto>> getPaymentsByBooking(
            @PathVariable Long bookingId) {

        User currentUser = userService.getCurrentUser();
        bookingRepository.findByIdAndUserId(bookingId, currentUser.getId())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Booking not found"));

        List<Payment> payments = paymentRepository.findByBookingId(bookingId);
        List<PaymentDto> dtos  = payments.stream().map(this::toDto).toList();

        return ResponseEntity.ok(dtos);
    }

    // ── HMAC-SHA256 helper ────────────────────────────────────────────────────
    private String hmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(
                mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
    }

    // ── DTO mapper ────────────────────────────────────────────────────────────
    private PaymentDto toDto(Payment p) {
        PaymentDto dto = new PaymentDto();
        dto.setId(p.getId());
        dto.setRazorpayOrderId(p.getRazorpayOrderId());
        dto.setRazorpayPaymentId(p.getRazorpayPaymentId());
        dto.setAmount(p.getAmount());
        dto.setCurrency(p.getCurrency());
        dto.setStatus(p.getStatus());
        dto.setPaymentMethod(p.getPaymentMethod());
        dto.setBookingId(p.getBooking().getId());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }
}