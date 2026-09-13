package com.example.tts.controller;

import com.example.tts.dto.UserDto;
import com.example.tts.entity.SpeechHistory;
import com.example.tts.entity.User;
import com.example.tts.repository.UserRepository;
import com.example.tts.service.AnalyticsService;
import com.example.tts.service.SpeechHistoryService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final SpeechHistoryService historyService;
    private final AnalyticsService analyticsService;

    @Value("${app.ratelimit.requests-per-minute:30}")
    private int maxRequestsPerMinute;

    @Value("${app.tts.max-text-length:2500}")
    private int maxTextLength;

    public AdminController(UserRepository userRepository,
                           SpeechHistoryService historyService,
                           AnalyticsService analyticsService) {
        this.userRepository = userRepository;
        this.historyService = historyService;
        this.analyticsService = analyticsService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        return ResponseEntity.ok(analyticsService.getSystemAnalytics());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> listUsers() {
        List<UserDto> users = userRepository.findAll().stream()
                .map(u -> new UserDto(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getCreatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/history")
    public ResponseEntity<List<SpeechHistory>> listAllHistory() {
        return ResponseEntity.ok(historyService.getAllHistory());
    }

    @GetMapping("/limits")
    public ResponseEntity<Map<String, Object>> getLimits() {
        return ResponseEntity.ok(Map.of(
                "maxRequestsPerMinute", maxRequestsPerMinute,
                "maxCharactersPerRequest", maxTextLength,
                "maxFileUploadSizeMb", 15
        ));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, Object>> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newRole = body.get("role");
        if (newRole == null || (!newRole.equals("ROLE_ADMIN") && !newRole.equals("ROLE_USER"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role. Must be ROLE_USER or ROLE_ADMIN"));
        }

        return userRepository.findById(id).map(u -> {
            u.setRole(newRole);
            userRepository.save(u);
            Map<String, Object> resp = new java.util.HashMap<>();
            resp.put("success", true);
            resp.put("message", "User role updated to " + newRole);
            return ResponseEntity.ok(resp);
        }).orElse(ResponseEntity.notFound().build());
    }
}
