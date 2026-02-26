package com.shifting.payload.request;

import lombok.Data;

@Data
public class CreateBookingRequest {

    private String pickupAddress;
    private String dropAddress;
}
