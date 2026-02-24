package com.shifting.service;

import com.shifting.payload.request.LoginRequest;
import com.shifting.payload.request.RegisterRequest;
import com.shifting.payload.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
