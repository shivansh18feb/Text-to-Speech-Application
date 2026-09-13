package com.example.tts.service;

import com.example.tts.dto.LanguageDto;
import com.example.tts.dto.VoiceDto;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class VoiceCatalogService {

    private final Map<String, LanguageDto> languages = new LinkedHashMap<>();
    private final Map<String, VoiceDto> voicesById = new LinkedHashMap<>();

    public VoiceCatalogService() {
        initCatalog();
    }

    private void initCatalog() {
        // 1. English (US)
        List<VoiceDto> enUsVoices = List.of(
                new VoiceDto("en-US-Standard", "English (US) - Natural", "Neutral", "en-US"),
                new VoiceDto("en-US-Female", "English (US) - Female", "Female", "en-US"),
                new VoiceDto("en-US-Male", "English (US) - Male", "Male", "en-US")
        );
        addLanguage(new LanguageDto("en-US", "English (United States)", "English", enUsVoices));

        // 2. English (UK)
        List<VoiceDto> enGbVoices = List.of(
                new VoiceDto("en-GB-Standard", "English (UK) - Natural", "Neutral", "en-GB"),
                new VoiceDto("en-GB-Female", "English (UK) - Female", "Female", "en-GB")
        );
        addLanguage(new LanguageDto("en-GB", "English (Great Britain)", "English", enGbVoices));

        // 3. Hindi
        List<VoiceDto> hiVoices = List.of(
                new VoiceDto("hi-IN-Standard", "Hindi - Natural (मानक)", "Neutral", "hi-IN"),
                new VoiceDto("hi-IN-Female", "Hindi - Female (महिला)", "Female", "hi-IN")
        );
        addLanguage(new LanguageDto("hi-IN", "Hindi", "हिन्दी", hiVoices));

        // 4. Gujarati
        List<VoiceDto> guVoices = List.of(
                new VoiceDto("gu-IN-Standard", "Gujarati - Natural (સામાન્ય)", "Neutral", "gu-IN"),
                new VoiceDto("gu-IN-Female", "Gujarati - Female (મહિલા)", "Female", "gu-IN")
        );
        addLanguage(new LanguageDto("gu-IN", "Gujarati", "ગુજરાતી", guVoices));

        // 5. Marathi
        List<VoiceDto> mrVoices = List.of(
                new VoiceDto("mr-IN-Standard", "Marathi - Natural (मानक)", "Neutral", "mr-IN"),
                new VoiceDto("mr-IN-Female", "Marathi - Female (स्त्री)", "Female", "mr-IN")
        );
        addLanguage(new LanguageDto("mr-IN", "Marathi", "मराठी", mrVoices));

        // 6. Spanish
        List<VoiceDto> esVoices = List.of(
                new VoiceDto("es-ES-Standard", "Spanish - Natural", "Neutral", "es-ES"),
                new VoiceDto("es-ES-Female", "Spanish - Female", "Female", "es-ES")
        );
        addLanguage(new LanguageDto("es-ES", "Spanish", "Español", esVoices));

        // 7. French
        List<VoiceDto> frVoices = List.of(
                new VoiceDto("fr-FR-Standard", "French - Natural", "Neutral", "fr-FR"),
                new VoiceDto("fr-FR-Female", "French - Female", "Female", "fr-FR")
        );
        addLanguage(new LanguageDto("fr-FR", "French", "Français", frVoices));

        // 8. German
        List<VoiceDto> deVoices = List.of(
                new VoiceDto("de-DE-Standard", "German - Natural", "Neutral", "de-DE"),
                new VoiceDto("de-DE-Female", "German - Female", "Female", "de-DE")
        );
        addLanguage(new LanguageDto("de-DE", "German", "Deutsch", deVoices));

        // 9. Italian
        List<VoiceDto> itVoices = List.of(
                new VoiceDto("it-IT-Standard", "Italian - Natural", "Neutral", "it-IT")
        );
        addLanguage(new LanguageDto("it-IT", "Italian", "Italiano", itVoices));

        // 10. Japanese
        List<VoiceDto> jaVoices = List.of(
                new VoiceDto("ja-JP-Standard", "Japanese - Natural (標準)", "Neutral", "ja-JP")
        );
        addLanguage(new LanguageDto("ja-JP", "Japanese", "日本語", jaVoices));
    }

    private void addLanguage(LanguageDto lang) {
        languages.put(lang.getCode(), lang);
        for (VoiceDto v : lang.getVoices()) {
            voicesById.put(v.getId(), v);
        }
    }

    public List<LanguageDto> getSupportedLanguages() {
        return new ArrayList<>(languages.values());
    }

    public List<VoiceDto> getAllVoices() {
        return new ArrayList<>(voicesById.values());
    }

    public List<VoiceDto> getVoicesByLanguage(String langCode) {
        LanguageDto lang = languages.get(langCode);
        if (lang != null) {
            return lang.getVoices();
        }
        return Collections.emptyList();
    }

    public boolean isValidLanguage(String langCode) {
        return languages.containsKey(langCode);
    }

    public boolean isValidVoice(String voiceId, String langCode) {
        VoiceDto voice = voicesById.get(voiceId);
        if (voice == null) {
            return false;
        }
        return voice.getLanguageCode().equalsIgnoreCase(langCode);
    }

    public String mapToTtsLanguageCode(String languageCode) {
        if (languageCode == null) return "en";
        // Convert language tags e.g. en-US -> en, hi-IN -> hi, etc.
        if (languageCode.equalsIgnoreCase("en-GB")) return "en-uk";
        String[] parts = languageCode.split("-");
        return parts[0].toLowerCase();
    }
}
