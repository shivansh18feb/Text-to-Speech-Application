package com.example.tts.model;

public record Voice(
        String id,
        String name,
        String gender,
        String languageCode
) {}
