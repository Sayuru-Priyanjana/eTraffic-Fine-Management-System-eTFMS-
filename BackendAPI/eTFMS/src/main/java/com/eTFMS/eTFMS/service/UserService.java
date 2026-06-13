package com.eTFMS.eTFMS.service;

import com.eTFMS.eTFMS.dto.RegisterRequest;
import com.eTFMS.eTFMS.dto.UserResponse;
import com.eTFMS.eTFMS.dto.UserUpdateRequest;
import com.eTFMS.eTFMS.model.Role;
import com.eTFMS.eTFMS.model.User;
import com.eTFMS.eTFMS.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return mapToResponse(user);
    }

    public UserResponse createUser(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }

        String userId = request.getId();
        if (request.getRole() == Role.ADMIN) {
            userId = (userId != null && !userId.isBlank()) ? userId : UUID.randomUUID().toString();
        } else {
            if (userId == null || userId.isBlank()) {
                throw new IllegalArgumentException("ID must be provided manually for DRIVER or POLICE_OFFICER roles.");
            }
        }

        if (userRepository.findById(userId).isPresent()) {
            throw new IllegalArgumentException("User with this ID already exists.");
        }

        User user = User.builder()
                .id(userId)
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        user = userRepository.save(user);
        return mapToResponse(user);
    }

    public UserResponse updateUser(String id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            // Check if username is taken by another user
            userRepository.findByUsername(request.getUsername()).ifPresent(u -> {
                if (!u.getId().equals(id)) {
                    throw new IllegalArgumentException("Username already exists");
                }
            });
            user.setUsername(request.getUsername());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        user = userRepository.save(user);
        return mapToResponse(user);
    }

    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found");
        }
        userRepository.deleteById(id);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .role(user.getRole())
            .build();
    }
}
