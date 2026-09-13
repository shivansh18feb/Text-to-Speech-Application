package com.example.tts.service;

import com.example.tts.exception.TtsProviderUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class GoogleTtsService implements TtsService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleTtsService.class);
    private static final String GOOGLE_TTS_ENDPOINT = "https://translate.google.com/translate_tts";
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    private static final int MAX_CHUNK_LENGTH = 150;

    private final HttpClient httpClient;
    private final VoiceCatalogService voiceCatalogService;

    @Value("${app.tts.voicerss.api-key:}")
    private String voiceRssApiKey;

    public GoogleTtsService(VoiceCatalogService voiceCatalogService) {
        this.voiceCatalogService = voiceCatalogService;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    @Override
    public String getProviderName() {
        if (voiceRssApiKey != null && !voiceRssApiKey.isBlank()) {
            return "VoiceRSS / Google TTS";
        }
        return "Google Natural Speech";
    }

    @Override
    public byte[] generateSpeech(String text, String language, String voice) {
        if (voiceRssApiKey != null && !voiceRssApiKey.isBlank()) {
            try {
                return generateSpeechWithVoiceRss(text, language, voice);
            } catch (Exception e) {
                logger.warn("VoiceRSS request failed, falling back to Google TTS: {}", e.getMessage());
            }
        }
        return generateSpeechWithGoogle(text, language, voice);
    }

    private byte[] generateSpeechWithGoogle(String text, String language, String voice) {
        String langCode = voiceCatalogService.mapToTtsLanguageCode(language);
        List<String> chunks = splitTextIntoChunks(text, MAX_CHUNK_LENGTH);

        ByteArrayOutputStream combinedAudio = new ByteArrayOutputStream();

        try {
            for (String chunk : chunks) {
                if (chunk.isBlank()) continue;
                byte[] chunkAudio = fetchGoogleAudioChunk(chunk, langCode);
                if (chunkAudio != null && chunkAudio.length > 0) {
                    combinedAudio.write(chunkAudio);
                }
            }

            byte[] result = combinedAudio.toByteArray();
            if (result.length == 0) {
                throw new TtsProviderUnavailableException("TTS service returned an empty audio response.");
            }
            return result;
        } catch (IOException e) {
            logger.error("Failed to assemble audio chunks", e);
            throw new TtsProviderUnavailableException("Failed to assemble audio output: " + e.getMessage(), e);
        }
    }

    private byte[] fetchGoogleAudioChunk(String chunk, String langCode) {
        try {
            String encodedQuery = URLEncoder.encode(chunk, StandardCharsets.UTF_8);
            String url = String.format("%s?ie=UTF-8&tl=%s&client=tw-ob&q=%s",
                    GOOGLE_TTS_ENDPOINT, langCode, encodedQuery);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", USER_AGENT)
                    .header("Accept", "audio/mpeg, audio/*;q=0.9, */*;q=0.8")
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();

            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());

            if (response.statusCode() != 200) {
                logger.error("Google TTS HTTP status {}: length {}", response.statusCode(), response.body().length);
                throw new TtsProviderUnavailableException("TTS provider returned HTTP " + response.statusCode());
            }

            return response.body();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new TtsProviderUnavailableException("TTS request was interrupted", e);
        } catch (IOException e) {
            logger.error("Network error contacting TTS provider", e);
            throw new TtsProviderUnavailableException("Failed to reach TTS provider: " + e.getMessage(), e);
        }
    }

    private byte[] generateSpeechWithVoiceRss(String text, String language, String voice) {
        try {
            String encodedText = URLEncoder.encode(text, StandardCharsets.UTF_8);
            String url = String.format("https://api.voicerss.org/?key=%s&hl=%s&src=%s&c=MP3&f=44khz_16bit_stereo",
                    voiceRssApiKey.trim(), language.toLowerCase(), encodedText);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", USER_AGENT)
                    .timeout(Duration.ofSeconds(20))
                    .GET()
                    .build();

            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() == 200) {
                byte[] body = response.body();
                // VoiceRSS returns error strings starting with "ERROR:" even with 200 OK
                if (body.length < 200) {
                    String preview = new String(body, StandardCharsets.UTF_8);
                    if (preview.startsWith("ERROR:")) {
                        throw new TtsProviderUnavailableException("VoiceRSS error: " + preview);
                    }
                }
                return body;
            }
            throw new TtsProviderUnavailableException("VoiceRSS returned HTTP " + response.statusCode());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new TtsProviderUnavailableException("VoiceRSS request interrupted", e);
        } catch (IOException e) {
            throw new TtsProviderUnavailableException("VoiceRSS network error: " + e.getMessage(), e);
        }
    }

    protected List<String> splitTextIntoChunks(String text, int maxLen) {
        List<String> chunks = new ArrayList<>();
        String normalized = text.trim().replaceAll("\\s+", " ");
        if (normalized.length() <= maxLen) {
            chunks.add(normalized);
            return chunks;
        }

        // Split on sentence boundaries, or commas, or spaces
        String[] sentences = normalized.split("(?<=[.?!,\\n])\\s+");
        StringBuilder current = new StringBuilder();

        for (String sentence : sentences) {
            if (current.length() + sentence.length() + 1 <= maxLen) {
                if (current.length() > 0) current.append(" ");
                current.append(sentence);
            } else {
                if (current.length() > 0) {
                    chunks.add(current.toString());
                    current.setLength(0);
                }
                // If single sentence is larger than maxLen, split by words
                if (sentence.length() > maxLen) {
                    String[] words = sentence.split(" ");
                    for (String word : words) {
                        if (word.length() > maxLen) {
                            if (current.length() > 0) {
                                chunks.add(current.toString());
                                current.setLength(0);
                            }
                            for (int i = 0; i < word.length(); i += maxLen) {
                                chunks.add(word.substring(i, Math.min(i + maxLen, word.length())));
                            }
                        } else if (current.length() + word.length() + 1 <= maxLen) {
                            if (current.length() > 0) current.append(" ");
                            current.append(word);
                        } else {
                            if (current.length() > 0) {
                                chunks.add(current.toString());
                                current.setLength(0);
                            }
                            current.append(word);
                        }
                    }
                } else {
                    current.append(sentence);
                }
            }
        }

        if (current.length() > 0) {
            chunks.add(current.toString());
        }

        return chunks;
    }
}
