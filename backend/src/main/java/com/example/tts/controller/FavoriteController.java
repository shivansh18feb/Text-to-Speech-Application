package com.example.tts.controller;

import com.example.tts.dto.FavoriteRequest;
import com.example.tts.entity.Favorite;
import com.example.tts.entity.User;
import com.example.tts.exception.InvalidRequestException;
import com.example.tts.service.AuthService;
import com.example.tts.service.FavoriteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final AuthService authService;

    public FavoriteController(FavoriteService favoriteService, AuthService authService) {
        this.favoriteService = favoriteService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<Favorite>> getFavorites(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        User user = authService.getAuthenticatedUserEntity(authentication.getName());
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(favoriteService.getUserFavorites(user));
    }

    @PostMapping
    public ResponseEntity<Favorite> addFavorite(@Valid @RequestBody FavoriteRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        User user = authService.getAuthenticatedUserEntity(authentication.getName());
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        Favorite fav = favoriteService.addFavorite(user, request.getTargetType(), request.getReferenceId(),
                request.getTitle(), request.getMetadataJson());
        return ResponseEntity.ok(fav);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> removeFavorite(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        User user = authService.getAuthenticatedUserEntity(authentication.getName());
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        boolean removed = favoriteService.removeFavorite(id, user);
        if (removed) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Favorite removed successfully."));
        }
        return ResponseEntity.notFound().build();
    }
}
