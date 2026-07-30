package com.shifting.payload.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DriverDto {
    private Long id;
    private String name;
    private String phone;
    private String licenseNo;
    private Boolean isActive;
}