package com.eTFMS.eTFMS.service;

import com.eTFMS.eTFMS.dto.AuthRequest;
import com.eTFMS.eTFMS.dto.AuthResponse;
import com.eTFMS.eTFMS.dto.RegisterRequest;
import com.eTFMS.eTFMS.model.Role;
import com.eTFMS.eTFMS.model.User;
import com.eTFMS.eTFMS.repository.UserRepository;
import com.eTFMS.eTFMS.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
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

        var user = User.builder()
                .id(userId)
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();
                
        userRepository.save(user);
        
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();
                
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }
}
