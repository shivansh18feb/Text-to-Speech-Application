package com.example.tts.dto;

import jakarta.validation.constraints.NotBlank;

public class FavoriteRequest {

    @NotBlank(message = "Target type is required (VOICE or SPEECH)")
    private String targetType;

    @NotBlank(message = "Reference ID is required")
    private String referenceId;

    @NotBlank(message = "Title is required")
    private String title;

    private String metadataJson;

    public FavoriteRequest() {}

    public FavoriteRequest(String targetType, String referenceId, String title, String metadataJson) {
        this.targetType = targetType;
        this.referenceId = referenceId;
        this.title = title;
        this.metadataJson = metadataJson;
    }

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMetadataJson() {
        return metadataJson;
    }

    public void setMetadataJson(String metadataJson) {
        this.metadataJson = metadataJson;
    }
}
