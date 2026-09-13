package com.example.tts.controller;

import com.example.tts.dto.HealthResponse;
import com.example.tts.service.TtsService;
import com.example.tts.service.VoiceCatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final TtsService ttsService;
    private final VoiceCatalogService voiceCatalogService;

    public HealthController(TtsService ttsService, VoiceCatalogService voiceCatalogService) {
        this.ttsService = ttsService;
        this.voiceCatalogService = voiceCatalogService;
    }

    @GetMapping
    public ResponseEntity<HealthResponse> getHealth() {
        HealthResponse response = new HealthResponse(
                "UP",
                ttsService.getProviderName(),
                voiceCatalogService.getSupportedLanguages().size(),
                voiceCatalogService.getAllVoices().size(),
                "Text-to-Speech service is running and ready to process requests."
        );
        return ResponseEntity.ok(response);
    }
}
