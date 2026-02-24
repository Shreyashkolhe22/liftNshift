package com.shifting.controller;

import com.shifting.mapper.UserMapper;
import com.shifting.model.User;
import com.shifting.payload.dto.UserDto;
import com.shifting.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Secured user endpoints.
 * All routes here require a valid JWT (enforced by JwtAuthFilter +
 * SecurityConfig).
 * Pass the token as: Authorization: Bearer <your_token>
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Get the profile of the currently authenticated user.
     * The user is resolved from the JWT via the SecurityContext — no need to
     * manually parse the JWT header here.
     */
    @GetMapping("/profile")
    public ResponseEntity<UserDto> getMyProfile() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(UserMapper.toDto(user));
    }

    /**
     * Get any user's profile by ID.
     * (Still protected – only authenticated users can call this.)
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable("id") Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(UserMapper.toDto(user));
    }

    /**
     * Get all users.
     */
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers()
                .stream()
                .map(UserMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}
