package com.example.tts.repository;

import com.example.tts.entity.Favorite;
import com.example.tts.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserOrderByCreatedAtDesc(User user);
    Optional<Favorite> findByUserAndTargetTypeAndReferenceId(User user, String targetType, String referenceId);
    boolean existsByUserAndTargetTypeAndReferenceId(User user, String targetType, String referenceId);
    void deleteByUser(User user);
}
