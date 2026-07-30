package com.shifting.service;

import com.shifting.model.User;
import java.util.List;

public interface UserService {
    User getUserFromJwtToken(String jwtToken);
    User getCurrentUser();
    User getUserByEmail(String email);
    User getUserById(Long id);
    List<User> getAllUsers();
}