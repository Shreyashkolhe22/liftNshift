package com.shifting.payload.dto;

import com.shifting.model.Role;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminUserDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private long totalBookings;
    private long totalPayments;
}