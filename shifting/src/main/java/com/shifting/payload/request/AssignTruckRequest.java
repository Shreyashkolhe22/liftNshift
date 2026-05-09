package com.shifting.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignTruckRequest {

    @NotNull(message = "Truck ID is required")
    private Long truckId;

    @NotNull(message = "Driver ID is required")
    private Long driverId;
}