package com.example.tts.controller;

import com.example.tts.service.DocumentExtractionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class DocumentController {

    private final DocumentExtractionService extractionService;

    public DocumentController(DocumentExtractionService extractionService) {
        this.extractionService = extractionService;
    }

    @PostMapping("/extract")
    public ResponseEntity<Map<String, Object>> extractTextFromFile(@RequestParam("file") MultipartFile file) {
        String extractedText = extractionService.extractText(file);
        int charCount = extractedText.length();
        int wordCount = extractedText.split("\\s+").length;

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String ext = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".") + 1).toLowerCase() : "unknown";

        return ResponseEntity.ok(Map.of(
                "success", true,
                "filename", originalName,
                "fileType", ext,
                "fileSize", file.getSize(),
                "text", extractedText,
                "characterCount", charCount,
                "wordCount", wordCount
        ));
    }
}
