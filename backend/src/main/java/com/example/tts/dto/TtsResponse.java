package com.example.tts.dto;

public class TtsResponse {
    private boolean success;
    private String audioId;
    private String audioUrl;
    private String audioData;
    private String text;
    private String language;
    private String voice;
    private Double speed;
    private Double pitch;
    private String voiceStyle;
    private int characterCount;
    private int wordCount;
    private long audioSizeBytes;
    private String format;
    private String message;

    public TtsResponse() {
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final TtsResponse response = new TtsResponse();

        public Builder success(boolean success) {
            response.success = success;
            return this;
        }

        public Builder audioId(String audioId) {
            response.audioId = audioId;
            return this;
        }

        public Builder audioUrl(String audioUrl) {
            response.audioUrl = audioUrl;
            return this;
        }

        public Builder audioData(String audioData) {
            response.audioData = audioData;
            return this;
        }

        public Builder text(String text) {
            response.text = text;
            return this;
        }

        public Builder language(String language) {
            response.language = language;
            return this;
        }

        public Builder voice(String voice) {
            response.voice = voice;
            return this;
        }

        public Builder speed(Double speed) {
            response.speed = speed;
            return this;
        }

        public Builder pitch(Double pitch) {
            response.pitch = pitch;
            return this;
        }

        public Builder voiceStyle(String voiceStyle) {
            response.voiceStyle = voiceStyle;
            return this;
        }

        public Builder characterCount(int characterCount) {
            response.characterCount = characterCount;
            return this;
        }

        public Builder wordCount(int wordCount) {
            response.wordCount = wordCount;
            return this;
        }

        public Builder audioSizeBytes(long audioSizeBytes) {
            response.audioSizeBytes = audioSizeBytes;
            return this;
        }

        public Builder format(String format) {
            response.format = format;
            return this;
        }

        public Builder message(String message) {
            response.message = message;
            return this;
        }

        public TtsResponse build() {
            return response;
        }
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getAudioId() {
        return audioId;
    }

    public void setAudioId(String audioId) {
        this.audioId = audioId;
    }

    public String getAudioUrl() {
        return audioUrl;
    }

    public void setAudioUrl(String audioUrl) {
        this.audioUrl = audioUrl;
    }

    public String getAudioData() {
        return audioData;
    }

    public void setAudioData(String audioData) {
        this.audioData = audioData;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getVoice() {
        return voice;
    }

    public void setVoice(String voice) {
        this.voice = voice;
    }

    public Double getSpeed() {
        return speed;
    }

    public void setSpeed(Double speed) {
        this.speed = speed;
    }

    public Double getPitch() {
        return pitch;
    }

    public void setPitch(Double pitch) {
        this.pitch = pitch;
    }

    public String getVoiceStyle() {
        return voiceStyle;
    }

    public void setVoiceStyle(String voiceStyle) {
        this.voiceStyle = voiceStyle;
    }

    public int getCharacterCount() {
        return characterCount;
    }

    public void setCharacterCount(int characterCount) {
        this.characterCount = characterCount;
    }

    public int getWordCount() {
        return wordCount;
    }

    public void setWordCount(int wordCount) {
        this.wordCount = wordCount;
    }

    public long getAudioSizeBytes() {
        return audioSizeBytes;
    }

    public void setAudioSizeBytes(long audioSizeBytes) {
        this.audioSizeBytes = audioSizeBytes;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
