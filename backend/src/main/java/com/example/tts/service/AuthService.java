package com.example.tts.service;

import com.example.tts.dto.*;
import com.example.tts.entity.User;
import com.example.tts.exception.InvalidRequestException;
import com.example.tts.repository.UserRepository;
import com.example.tts.security.JwtUtils;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @PostConstruct
    public void seedInitialUsers() {
        if (!userRepository.existsByEmail("admin@tts.com")) {
            User admin = new User("System Administrator", "admin@tts.com", passwordEncoder.encode("Admin@123"), "ROLE_ADMIN");
            userRepository.save(admin);
            logger.info("Seeded default admin user: admin@tts.com");
        }
        if (!userRepository.existsByEmail("demo@tts.com")) {
            User demo = new User("Demo User", "demo@tts.com", passwordEncoder.encode("Demo@123"), "ROLE_USER");
            userRepository.save(demo);
            logger.info("Seeded default demo user: demo@tts.com");
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new InvalidRequestException("An account with email '" + email + "' already exists.");
        }

        String role = "ROLE_USER";
        if (request.getRole() != null && request.getRole().equalsIgnoreCase("admin")) {
            role = "ROLE_ADMIN";
        }

        User user = new User(request.getName().trim(), email, passwordEncoder.encode(request.getPassword()), role);
        user = userRepository.save(user);

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole());
        UserDto userDto = new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getCreatedAt());

        return new AuthResponse(true, token, userDto, "Registration successful.");
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new InvalidRequestException("Invalid email or password."));

            String token = jwtUtils.generateToken(user.getEmail(), user.getRole());
            UserDto userDto = new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getCreatedAt());

            return new AuthResponse(true, token, userDto, "Login successful.");
        } catch (BadCredentialsException e) {
            throw new InvalidRequestException("Invalid email or password.");
        }
    }

    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidRequestException("User not found."));
        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getCreatedAt());
    }

    public User getAuthenticatedUserEntity(String email) {
        if (email == null) return null;
        return userRepository.findByEmail(email).orElse(null);
    }
}
