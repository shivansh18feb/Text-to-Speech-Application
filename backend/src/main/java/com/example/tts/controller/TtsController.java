package com.example.tts.controller;

import com.example.tts.dto.LanguageDto;
import com.example.tts.dto.TtsRequest;
import com.example.tts.dto.TtsResponse;
import com.example.tts.dto.VoiceDto;
import com.example.tts.entity.User;
import com.example.tts.exception.InvalidRequestException;
import com.example.tts.service.AudioStorageService;
import com.example.tts.service.AuthService;
import com.example.tts.service.SpeechHistoryService;
import com.example.tts.service.TtsService;
import com.example.tts.service.VoiceCatalogService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api")
public class TtsController {

    private static final Logger logger = LoggerFactory.getLogger(TtsController.class);

    private final TtsService ttsService;
    private final VoiceCatalogService voiceCatalogService;
    private final AudioStorageService audioStorageService;
    private final AuthService authService;
    private final SpeechHistoryService historyService;

    @Value("${app.tts.max-text-length:2500}")
    private int maxTextLength;

    public TtsController(TtsService ttsService,
                         VoiceCatalogService voiceCatalogService,
                         AudioStorageService audioStorageService,
                         AuthService authService,
                         SpeechHistoryService historyService) {
        this.ttsService = ttsService;
        this.voiceCatalogService = voiceCatalogService;
        this.audioStorageService = audioStorageService;
        this.authService = authService;
        this.historyService = historyService;
    }

    @GetMapping("/languages")
    public ResponseEntity<List<LanguageDto>> getLanguages() {
        return ResponseEntity.ok(voiceCatalogService.getSupportedLanguages());
    }

    @GetMapping("/voices")
    public ResponseEntity<List<VoiceDto>> getVoices(@RequestParam(value = "language", required = false) String language) {
        if (language != null && !language.isBlank()) {
            return ResponseEntity.ok(voiceCatalogService.getVoicesByLanguage(language));
        }
        return ResponseEntity.ok(voiceCatalogService.getAllVoices());
    }

    @PostMapping("/tts")
    public ResponseEntity<TtsResponse> generateSpeech(@Valid @RequestBody TtsRequest request,
                                                     Authentication authentication) {
        String trimmedText = request.getText() != null ? request.getText().trim() : "";
        if (trimmedText.isEmpty()) {
            throw new InvalidRequestException("Text cannot be empty or only spaces.");
        }
        if (trimmedText.length() > maxTextLength) {
            throw new InvalidRequestException("Text exceeds the maximum allowed length of " + maxTextLength + " characters.");
        }

        if (!voiceCatalogService.isValidLanguage(request.getLanguage())) {
            throw new InvalidRequestException("Invalid language code: '" + request.getLanguage() + "'. Please select a supported language.");
        }

        if (!voiceCatalogService.isValidVoice(request.getVoice(), request.getLanguage())) {
            throw new InvalidRequestException("Invalid voice identifier '" + request.getVoice() + "' for language '" + request.getLanguage() + "'.");
        }

        Double speed = request.getSpeed() != null ? request.getSpeed() : 1.0;
        Double pitch = request.getPitch() != null ? request.getPitch() : 1.0;
        String voiceStyle = request.getVoiceStyle() != null ? request.getVoiceStyle() : "Standard";

        logger.info("Generating TTS for language '{}', voice '{}', speed {}, pitch {}, chars {}",
                request.getLanguage(), request.getVoice(), speed, pitch, trimmedText.length());

        byte[] audioBytes = ttsService.generateSpeech(trimmedText, request.getLanguage(), request.getVoice());

        String filename;
        try {
            filename = audioStorageService.saveAudio(audioBytes);
        } catch (IOException e) {
            logger.error("Failed to save audio file to disk", e);
            filename = "speech_stream.mp3";
        }

        int wordCount = trimmedText.split("\\s+").length;
        String base64Audio = "data:audio/mp3;base64," + Base64.getEncoder().encodeToString(audioBytes);
        String audioUrl = "/api/tts/audio/" + filename;

        // Persist generation to history
        User currentUser = null;
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            currentUser = authService.getAuthenticatedUserEntity(authentication.getName());
        }

        try {
            historyService.recordGeneration(
                    currentUser,
                    trimmedText,
                    request.getLanguage(),
                    request.getVoice(),
                    speed,
                    pitch,
                    voiceStyle,
                    audioUrl,
                    (long) audioBytes.length,
                    trimmedText.length(),
                    wordCount
            );
        } catch (Exception e) {
            logger.warn("Could not persist speech history: {}", e.getMessage());
        }

        TtsResponse response = TtsResponse.builder()
                .success(true)
                .audioId(filename.replace(".mp3", ""))
                .audioUrl(audioUrl)
                .audioData(base64Audio)
                .text(trimmedText)
                .language(request.getLanguage())
                .voice(request.getVoice())
                .speed(speed)
                .pitch(pitch)
                .voiceStyle(voiceStyle)
                .characterCount(trimmedText.length())
                .wordCount(wordCount)
                .audioSizeBytes(audioBytes.length)
                .format("audio/mpeg")
                .message("Audio generated successfully.")
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/tts/audio/{filename}")
    public ResponseEntity<Resource> getAudio(@PathVariable String filename,
                                             @RequestParam(value = "download", defaultValue = "false") boolean download,
                                             @RequestParam(value = "format", defaultValue = "mp3") String format) {
        Resource audioResource = audioStorageService.loadAudioAsResource(filename);
        if (audioResource == null || !audioResource.exists()) {
            return ResponseEntity.notFound().build();
        }

        String targetFilename = filename;
        String contentType = "audio/mpeg";

        if ("wav".equalsIgnoreCase(format)) {
            targetFilename = filename.replaceAll("(?i)\\.mp3$", ".wav");
            contentType = "audio/wav";
        } else if ("ogg".equalsIgnoreCase(format)) {
            targetFilename = filename.replaceAll("(?i)\\.mp3$", ".ogg");
            contentType = "audio/ogg";
        }

        String dispositionType = download ? "attachment" : "inline";
        ContentDisposition disposition = ContentDisposition.builder(dispositionType)
                .filename(targetFilename)
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600")
                .body(audioResource);
    }
}
