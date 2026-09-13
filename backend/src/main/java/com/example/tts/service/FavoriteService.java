package com.example.tts.service;

import com.example.tts.entity.Favorite;
import com.example.tts.entity.User;
import com.example.tts.repository.FavoriteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;

    public FavoriteService(FavoriteRepository favoriteRepository) {
        this.favoriteRepository = favoriteRepository;
    }

    public List<Favorite> getUserFavorites(User user) {
        return favoriteRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public Favorite addFavorite(User user, String targetType, String referenceId, String title, String metadataJson) {
        Optional<Favorite> existing = favoriteRepository.findByUserAndTargetTypeAndReferenceId(user, targetType, referenceId);
        if (existing.isPresent()) {
            return existing.get();
        }
        Favorite fav = new Favorite(user, targetType, referenceId, title, metadataJson);
        return favoriteRepository.save(fav);
    }

    @Transactional
    public boolean removeFavorite(Long id, User user) {
        Optional<Favorite> fav = favoriteRepository.findById(id);
        if (fav.isPresent() && fav.get().getUser().getId().equals(user.getId())) {
            favoriteRepository.delete(fav.get());
            return true;
        }
        return false;
    }

    @Transactional
    public boolean removeFavoriteByReference(User user, String targetType, String referenceId) {
        Optional<Favorite> fav = favoriteRepository.findByUserAndTargetTypeAndReferenceId(user, targetType, referenceId);
        if (fav.isPresent()) {
            favoriteRepository.delete(fav.get());
            return true;
        }
        return false;
    }
}
