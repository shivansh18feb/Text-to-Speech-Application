package com.example.tts.dto;

public record SystemAnalyticsDto(
        int totalUsers,
        int totalGenerations,
        int totalCharactersConverted,
        int activeProviders,
        String systemStatus
) {}
