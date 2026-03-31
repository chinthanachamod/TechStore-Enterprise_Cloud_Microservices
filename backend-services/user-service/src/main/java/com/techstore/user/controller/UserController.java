package com.techstore.user.controller;

import com.techstore.user.dto.UserDTO;
import com.techstore.user.model.User;
import com.techstore.user.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET /users — get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // GET /users/{id} — get user by id
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // POST /users/register — register a new user
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO.RegisterRequest request) {
        try {
            User user = userService.registerUser(request);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // POST /users/login — login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO.LoginRequest request) {
        try {
            UserDTO.LoginResponse response = userService.loginUser(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // PUT /users/{id} — update the user
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @RequestBody UserDTO.RegisterRequest request) {
        try {
            User user = userService.updateUser(id, request);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // DELETE /users/{id} — delete the user
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(java.util.Map.of("message", "User deleted successfully"));
    }

    // GET /users/health — health check
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(java.util.Map.of("status", "User Service is running"));
    }
}
