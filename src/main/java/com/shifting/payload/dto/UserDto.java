package com.shifting.payload.dto;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String password;
    private String phone;
}
