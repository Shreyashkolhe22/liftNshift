package com.shifting.model;

public enum PaymentStatus {
    CREATED,   // order created, user hasn't paid yet
    SUCCESS,   // payment verified successfully
    FAILED     // payment failed or was cancelled
}