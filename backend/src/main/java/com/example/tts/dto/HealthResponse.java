package com.example.tts.dto;

import java.time.LocalDateTime;

public class HealthResponse {
    private String status;
    private String provider;
    private int supportedLanguages;
    private int supportedVoices;
    private String timestamp;
    private String message;

    public HealthResponse() {}

    public HealthResponse(String status, String provider, int supportedLanguages, int supportedVoices, String message) {
        this.status = status;
        this.provider = provider;
        this.supportedLanguages = supportedLanguages;
        this.supportedVoices = supportedVoices;
        this.timestamp = LocalDateTime.now().toString();
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public int getSupportedLanguages() {
        return supportedLanguages;
    }

    public void setSupportedLanguages(int supportedLanguages) {
        this.supportedLanguages = supportedLanguages;
    }

    public int getSupportedVoices() {
        return supportedVoices;
    }

    public void setSupportedVoices(int supportedVoices) {
        this.supportedVoices = supportedVoices;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
