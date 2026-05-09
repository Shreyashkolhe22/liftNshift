package com.shifting.payload.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PredefinedItemRequest {
    private String name;
    private BigDecimal price;
}