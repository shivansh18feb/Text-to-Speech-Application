package com.example.tts.dto;

public class VoiceDto {
    private String id;
    private String name;
    private String gender;
    private String languageCode;

    public VoiceDto() {}

    public VoiceDto(String id, String name, String gender, String languageCode) {
        this.id = id;
        this.name = name;
        this.gender = gender;
        this.languageCode = languageCode;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getLanguageCode() {
        return languageCode;
    }

    public void setLanguageCode(String languageCode) {
        this.languageCode = languageCode;
    }
}
