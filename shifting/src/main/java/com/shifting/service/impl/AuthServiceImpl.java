package com.shifting.service.impl;

import com.shifting.model.User;
import com.shifting.payload.request.LoginRequest;
import com.shifting.payload.request.RegisterRequest;
import com.shifting.payload.response.AuthResponse;
import com.shifting.repository.UserRepository;
import com.shifting.security.JwtProvider;
import com.shifting.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {

        // Prevent duplicate registrations
        if (userRepository.findByEmail(request.getEmail()) != null) {
            throw new RuntimeException("Email already in use: " + request.getEmail());
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        // Hash the password before persisting
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);

        String token = jwtProvider.generateToken(user.getEmail());
        return new AuthResponse(token, "User registered successfully");
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtProvider.generateToken(request.getEmail());
        return new AuthResponse(token, "Login successful");
    }
}
