package com.example.tts.model;

import java.util.List;

public record Language(
        String code,
        String name,
        String nativeName,
        List<Voice> voices
) {}
