package com.example.tts.dto;

import java.util.List;

public class LanguageDto {
    private String code;
    private String name;
    private String nativeName;
    private List<VoiceDto> voices;

    public LanguageDto() {}

    public LanguageDto(String code, String name, String nativeName, List<VoiceDto> voices) {
        this.code = code;
        this.name = name;
        this.nativeName = nativeName;
        this.voices = voices;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNativeName() {
        return nativeName;
    }

    public void setNativeName(String nativeName) {
        this.nativeName = nativeName;
    }

    public List<VoiceDto> getVoices() {
        return voices;
    }

    public void setVoices(List<VoiceDto> voices) {
        this.voices = voices;
    }
}
