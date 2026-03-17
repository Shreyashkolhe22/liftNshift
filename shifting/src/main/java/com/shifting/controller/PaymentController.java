package com.shifting.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.shifting.exception.ApiException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@Tag(name = "Payment", description = "Razorpay payment integration")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    // ── 1. Create Razorpay Order ─────────────────────────────────────────────
    // Frontend calls this first to get an orderId before opening the popup
    @PostMapping("/create-order")
    @Operation(summary = "Create Razorpay order", description = "Creates a payment order. Amount in paise (1 INR = 100 paise).")
    public ResponseEntity<Map<String, Object>> createOrder(
            @RequestBody Map<String, Object> request) {

        try {
            // Amount comes in rupees from frontend, convert to paise
            BigDecimal amountInRupees = new BigDecimal(request.get("amount").toString());
            long amountInPaise = amountInRupees.multiply(BigDecimal.valueOf(100)).longValue();

            String bookingId = request.get("bookingId").toString();

            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount",   amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt",  "booking_" + bookingId);
            orderRequest.put("notes", new JSONObject()
                    .put("bookingId", bookingId)
            );

            Order order = client.orders.create(orderRequest);

            return ResponseEntity.ok(Map.of(
                    "orderId",  order.get("id"),
                    "amount",   amountInPaise,
                    "currency", "INR",
                    "keyId",    keyId           // frontend needs this to open popup
            ));

        } catch (RazorpayException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to create payment order: " + e.getMessage());
        }
    }

    // ── 2. Verify Payment Signature ──────────────────────────────────────────
    // After user pays, Razorpay returns 3 values.
    // We verify the signature to confirm the payment is genuine.
    @PostMapping("/verify")
    @Operation(summary = "Verify Razorpay payment signature")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @RequestBody Map<String, String> request) {

        String razorpayOrderId   = request.get("razorpayOrderId");
        String razorpayPaymentId = request.get("razorpayPaymentId");
        String razorpaySignature = request.get("razorpaySignature");

        if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Missing payment verification fields");
        }

        try {
            // Razorpay signature = HMAC-SHA256(orderId + "|" + paymentId, keySecret)
            String payload  = razorpayOrderId + "|" + razorpayPaymentId;
            String computed = hmacSha256(payload, keySecret);

            boolean valid = computed.equals(razorpaySignature);

            if (!valid) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "Payment verification failed — invalid signature");
            }

            return ResponseEntity.ok(Map.of(
                    "verified",   true,
                    "paymentId",  razorpayPaymentId,
                    "message",    "Payment verified successfully"
            ));

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Signature verification error: " + e.getMessage());
        }
    }

    // ── HMAC-SHA256 helper ───────────────────────────────────────────────────
    private String hmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"
        );
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }
}