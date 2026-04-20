package com.shifting.payload.response;

import com.shifting.model.Role;
import lombok.*;

@Data @AllArgsConstructor @NoArgsConstructor
public class AuthResponse {
    private String token;
    private String message;
    private Role role;  // ← frontend needs this to show/hide admin menu
}