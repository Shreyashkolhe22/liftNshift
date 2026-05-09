package com.shifting.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class PricingService {

    private static final BigDecimal BASE_PRICE = new BigDecimal("200.00");  // flat base charge
    private static final BigDecimal RATE_PER_KM = new BigDecimal("12.00"); // Rs 12 per km

    /**
     * Total = Base price + (distance * 12)
     * Example: 15 km → 200 + (15 * 12) = Rs 380
     */
    public BigDecimal calculateTotalAmount(double distanceKm) {
        BigDecimal distance = BigDecimal.valueOf(distanceKm);
        BigDecimal distanceCharge = distance.multiply(RATE_PER_KM);
        return BASE_PRICE.add(distanceCharge).setScale(2, RoundingMode.HALF_UP);
    }
}