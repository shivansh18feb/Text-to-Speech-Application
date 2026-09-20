package com.example.tts.dto;

public record FavoriteInput(
        String targetType,
        String referenceId,
        String title,
        String metadataJson
) {}
