package com.shifting.service.impl;

import com.shifting.model.Role;
import com.shifting.model.User;
import com.shifting.payload.request.LoginRequest;
import com.shifting.payload.request.RegisterRequest;
import com.shifting.payload.response.AuthResponse;
import com.shifting.repository.UserRepository;
import com.shifting.security.JwtProvider;
import com.shifting.service.AuthService;
import com.shifting.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()) != null)
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Email already in use");

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(Role.USER);  // new users always USER
        userRepository.save(user);
        emailService.sendWelcomeEmail(user);

        String token = jwtProvider.generateToken(user.getEmail());
        return new AuthResponse(token, "Registered successfully", Role.USER);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        User user = userRepository.findByEmail(request.getEmail());
        String token = jwtProvider.generateToken(request.getEmail());
        return new AuthResponse(token, "Login successful", user.getRole());
    }
}