package com.example.tts.controller;

import com.example.tts.dto.*;
import com.example.tts.entity.Favorite;
import com.example.tts.entity.SpeechHistory;
import com.example.tts.entity.User;
import com.example.tts.exception.InvalidRequestException;
import com.example.tts.service.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
public class TtsGraphQlController {

    private final AuthService authService;
    private final VoiceCatalogService voiceCatalogService;
    private final SpeechHistoryService historyService;
    private final FavoriteService favoriteService;
    private final AnalyticsService analyticsService;

    public TtsGraphQlController(AuthService authService,
                                VoiceCatalogService voiceCatalogService,
                                SpeechHistoryService historyService,
                                FavoriteService favoriteService,
                                AnalyticsService analyticsService) {
        this.authService = authService;
        this.voiceCatalogService = voiceCatalogService;
        this.historyService = historyService;
        this.favoriteService = favoriteService;
        this.analyticsService = analyticsService;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new AccessDeniedException("Authentication required.");
        }
        User user = authService.getAuthenticatedUserEntity(authentication.getName());
        if (user == null) {
            throw new AccessDeniedException("User not found.");
        }
        return user;
    }

    private User getOptionalUser(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            return authService.getAuthenticatedUserEntity(authentication.getName());
        }
        return null;
    }

    @QueryMapping
    public UserDto me(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return authService.getCurrentUser(user.getEmail());
    }

    @QueryMapping
    public List<LanguageDto> languages() {
        return voiceCatalogService.getSupportedLanguages();
    }

    @QueryMapping
    public List<VoiceDto> voices(@Argument String language) {
        if (language != null && !language.isBlank()) {
            return voiceCatalogService.getVoicesByLanguage(language);
        }
        return voiceCatalogService.getAllVoices();
    }

    @QueryMapping
    public SpeechHistoryPageDto mySpeechHistory(@Argument Integer page, @Argument Integer size, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        int validPage = (page != null && page >= 0) ? page : 0;
        int validSize = (size != null && size > 0 && size <= 100) ? size : 20;
        Page<SpeechHistory> historyPage = historyService.getUserHistoryPage(user, PageRequest.of(validPage, validSize));
        return new SpeechHistoryPageDto(
                historyPage.getContent(),
                (int) historyPage.getTotalElements(),
                historyPage.getTotalPages(),
                validPage,
                validSize
        );
    }

    @QueryMapping
    public SpeechHistory speechHistoryItem(@Argument Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (id == null) {
            throw new InvalidRequestException("History ID is required.");
        }
        return historyService.getHistoryItemById(id, user).orElse(null);
    }

    @QueryMapping
    public List<Favorite> myFavorites(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return favoriteService.getUserFavorites(user);
    }

    @QueryMapping
    public boolean isFavorite(@Argument String targetType, @Argument String referenceId, Authentication authentication) {
        User user = getOptionalUser(authentication);
        if (user == null) {
            return false;
        }
        return favoriteService.isFavorite(user, targetType, referenceId);
    }

    @QueryMapping
    @SuppressWarnings("unchecked")
    public UserAnalyticsDto myAnalytics(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Map<String, Object> stats = analyticsService.getUserAnalytics(user);
        int totalGenerations = ((Number) stats.getOrDefault("totalGenerations", 0)).intValue();
        int totalCharacters = ((Number) stats.getOrDefault("totalCharacters", 0)).intValue();
        int totalWords = ((Number) stats.getOrDefault("totalWords", 0)).intValue();
        int totalFavorites = ((Number) stats.getOrDefault("totalFavorites", 0)).intValue();
        String topLanguage = "None";
        List<Map<String, Object>> popLangs = (List<Map<String, Object>>) stats.get("popularLanguages");
        if (popLangs != null && !popLangs.isEmpty()) {
            topLanguage = (String) popLangs.get(0).get("name");
        }
        String topVoice = "None";
        List<Map<String, Object>> popVoices = (List<Map<String, Object>>) stats.get("popularVoices");
        if (popVoices != null && !popVoices.isEmpty()) {
            topVoice = (String) popVoices.get(0).get("name");
        }
        return new UserAnalyticsDto(totalGenerations, totalCharacters, totalWords, totalFavorites, topLanguage, topVoice);
    }

    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public SystemAnalyticsDto systemAnalytics() {
        Map<String, Object> stats = analyticsService.getSystemAnalytics();
        return new SystemAnalyticsDto(
                ((Number) stats.getOrDefault("totalUsers", 0)).intValue(),
                ((Number) stats.getOrDefault("totalGenerations", 0)).intValue(),
                ((Number) stats.getOrDefault("totalCharactersConverted", 0)).intValue(),
                ((Number) stats.getOrDefault("activeProviders", 1)).intValue(),
                (String) stats.getOrDefault("systemStatus", "OPERATIONAL")
        );
    }

    @MutationMapping
    public boolean deleteSpeechHistory(@Argument Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (id == null) {
            throw new InvalidRequestException("History ID is required.");
        }
        return historyService.deleteHistory(id, user);
    }

    @MutationMapping
    public boolean clearSpeechHistory(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        historyService.clearUserHistory(user);
        return true;
    }

    @MutationMapping
    public Favorite addFavorite(@Argument FavoriteInput input, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (input == null || input.targetType() == null || input.referenceId() == null || input.title() == null) {
            throw new InvalidRequestException("targetType, referenceId, and title are required for adding a favorite.");
        }
        return favoriteService.addFavorite(user, input.targetType(), input.referenceId(), input.title(), input.metadataJson());
    }

    @MutationMapping
    public boolean removeFavorite(@Argument Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (id == null) {
            throw new InvalidRequestException("Favorite ID is required.");
        }
        return favoriteService.removeFavorite(id, user);
    }
}
