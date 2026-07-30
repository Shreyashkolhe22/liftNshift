package com.shifting.payload.request;

import com.shifting.model.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateBookingStatusRequest {

    @NotNull(message = "Status must not be null")
    private BookingStatus status;
}