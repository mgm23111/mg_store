package com.mgstore.domain.service;

import com.mgstore.application.dto.request.LoginRequest;
import com.mgstore.application.dto.response.LoginResponse;
import com.mgstore.domain.entity.Admin;
import com.mgstore.domain.repository.AdminRepository;
import com.mgstore.infrastructure.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;


    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate JWT token
        String token = tokenProvider.generateToken(authentication);

        // Get admin details
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        return LoginResponse.builder()
                .token(token)
                .type("Bearer")
                .email(admin.getEmail())
                .fullName(admin.getFullName())
                .build();
    }

}
