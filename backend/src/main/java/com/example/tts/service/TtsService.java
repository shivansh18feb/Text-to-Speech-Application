package com.example.tts.service;

public interface TtsService {
    byte[] generateSpeech(String text, String language, String voice);
    String getProviderName();
}
