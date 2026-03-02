package com.shifting.payload.request;

import com.shifting.model.ItemSize;
import lombok.Data;

@Data
public class AddBookingItemRequest {

    private Long bookingId;

    private Long predefinedItemId;  // nullable

    private String customName;      // nullable

    private Integer quantity;

    private ItemSize size;          // required for custom
}
