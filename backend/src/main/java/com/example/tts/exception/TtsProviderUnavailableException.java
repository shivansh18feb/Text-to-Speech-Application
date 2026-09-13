package com.example.tts.exception;

public class TtsProviderUnavailableException extends TtsException {
    public TtsProviderUnavailableException(String message) {
        super(message);
    }

    public TtsProviderUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
