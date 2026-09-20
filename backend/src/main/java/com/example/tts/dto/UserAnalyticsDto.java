package com.example.tts.dto;

public record UserAnalyticsDto(
        int totalGenerations,
        int totalCharacters,
        int totalWords,
        int totalFavorites,
        String topLanguage,
        String topVoice
) {}
