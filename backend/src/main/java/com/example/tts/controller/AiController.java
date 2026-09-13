package com.example.tts.controller;

import com.example.tts.service.AiEnhancementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiEnhancementService aiService;

    public AiController(AiEnhancementService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/enhance")
    public ResponseEntity<Map<String, Object>> enhanceText(@RequestBody Map<String, String> payload) {
        String text = payload.get("text");
        String action = payload.getOrDefault("action", "rewrite");
        Map<String, Object> result = aiService.enhanceText(text, action);
        return ResponseEntity.ok(result);
    }
}
