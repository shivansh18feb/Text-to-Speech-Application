package com.example.tts.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TtsRequest {

    @NotBlank(message = "Text cannot be empty or whitespace only")
    @Size(max = 2500, message = "Text cannot exceed 2500 characters")
    private String text;

    @NotBlank(message = "Language code is required")
    private String language;

    @NotBlank(message = "Voice is required")
    private String voice;

    @DecimalMin(value = "0.5", message = "Speaking speed must be at least 0.5x")
    @DecimalMax(value = "2.0", message = "Speaking speed cannot exceed 2.0x")
    private Double speed = 1.0;

    @DecimalMin(value = "0.5", message = "Pitch must be at least 0.5")
    @DecimalMax(value = "1.5", message = "Pitch cannot exceed 1.5")
    private Double pitch = 1.0;

    private String voiceStyle = "Standard";

    public TtsRequest() {
    }

    public TtsRequest(String text, String language, String voice) {
        this.text = text;
        this.language = language;
        this.voice = voice;
        this.speed = 1.0;
        this.pitch = 1.0;
        this.voiceStyle = "Standard";
    }

    public TtsRequest(String text, String language, String voice, Double speed, Double pitch, String voiceStyle) {
        this.text = text;
        this.language = language;
        this.voice = voice;
        this.speed = speed != null ? speed : 1.0;
        this.pitch = pitch != null ? pitch : 1.0;
        this.voiceStyle = voiceStyle != null ? voiceStyle : "Standard";
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getVoice() {
        return voice;
    }

    public void setVoice(String voice) {
        this.voice = voice;
    }

    public Double getSpeed() {
        return speed;
    }

    public void setSpeed(Double speed) {
        this.speed = speed;
    }

    public Double getPitch() {
        return pitch;
    }

    public void setPitch(Double pitch) {
        this.pitch = pitch;
    }

    public String getVoiceStyle() {
        return voiceStyle;
    }

    public void setVoiceStyle(String voiceStyle) {
        this.voiceStyle = voiceStyle;
    }
}
