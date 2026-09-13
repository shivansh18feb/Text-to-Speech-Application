package com.example.tts.controller;

import com.example.tts.entity.User;
import com.example.tts.service.AnalyticsService;
import com.example.tts.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final AuthService authService;

    public AnalyticsController(AnalyticsService analyticsService, AuthService authService) {
        this.analyticsService = analyticsService;
        this.authService = authService;
    }

    /**
     * User-Specific Analytics: Only accessible to the authenticated user.
     * Returns personal generation stats, character counts, and personal favorites.
     */
    @GetMapping({"/me", "/user"})
    public ResponseEntity<Map<String, Object>> getUserAnalytics(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = authService.getAuthenticatedUserEntity(authentication.getName());
        return ResponseEntity.ok(analyticsService.getUserAnalytics(user));
    }

    /**
     * System-Wide Analytics: Exclusively restricted to Administrators.
     * Returns overall platform usage, system uptime, and registered user counts.
     */
    @GetMapping("/system")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSystemAnalytics() {
        return ResponseEntity.ok(analyticsService.getSystemAnalytics());
    }

    /**
     * Default Analytics:
     * - Returns System Analytics if caller is an Admin
     * - Returns User Analytics if caller is a standard authenticated User
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAnalytics(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
            if (isAdmin) {
                return ResponseEntity.ok(analyticsService.getSystemAnalytics());
            } else {
                User user = authService.getAuthenticatedUserEntity(authentication.getName());
                return ResponseEntity.ok(analyticsService.getUserAnalytics(user));
            }
        }
        return ResponseEntity.ok(analyticsService.getSystemAnalytics());
    }
}
