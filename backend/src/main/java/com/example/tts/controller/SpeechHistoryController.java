package com.example.tts.controller;

import com.example.tts.entity.SpeechHistory;
import com.example.tts.entity.User;
import com.example.tts.service.AuthService;
import com.example.tts.service.SpeechHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/history")
public class SpeechHistoryController {

    private final SpeechHistoryService historyService;
    private final AuthService authService;

    public SpeechHistoryController(SpeechHistoryService historyService, AuthService authService) {
        this.historyService = historyService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<SpeechHistory>> getHistory(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            Authentication authentication) {
        User user = null;
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            user = authService.getAuthenticatedUserEntity(authentication.getName());
        }
        if (page != null && size != null && size > 0) {
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(Math.max(0, page), size);
            return ResponseEntity.ok(historyService.getUserHistory(user, pageable));
        }
        List<SpeechHistory> history = historyService.getUserHistory(user);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SpeechHistory> getHistoryById(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(401).build();
        }
        User user = authService.getAuthenticatedUserEntity(authentication.getName());
        return historyService.getHistoryItemById(id, user)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteHistoryItem(@PathVariable Long id, Authentication authentication) {
        User user = null;
        if (authentication != null && authentication.isAuthenticated()) {
            user = authService.getAuthenticatedUserEntity(authentication.getName());
        }
        boolean deleted = historyService.deleteHistory(id, user);
        if (deleted) {
            return ResponseEntity.ok(Map.of("success", true, "message", "History entry deleted successfully."));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> clearHistory(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            User user = authService.getAuthenticatedUserEntity(authentication.getName());
            if (user != null) {
                historyService.clearUserHistory(user);
                return ResponseEntity.ok(Map.of("success", true, "message", "User history cleared."));
            }
        }
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Authentication required to clear history."));
    }
}
