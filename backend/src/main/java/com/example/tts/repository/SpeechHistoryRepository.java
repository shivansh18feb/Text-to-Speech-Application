package com.example.tts.repository;

import com.example.tts.entity.SpeechHistory;
import com.example.tts.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpeechHistoryRepository extends JpaRepository<SpeechHistory, Long> {
    List<SpeechHistory> findByUserOrderByCreatedAtDesc(User user);
    Page<SpeechHistory> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    List<SpeechHistory> findAllByOrderByCreatedAtDesc();
    void deleteByUser(User user);

    // System-wide analytics (Admin only)
    @Query("SELECT COUNT(s) FROM SpeechHistory s")
    long getTotalGenerations();

    @Query("SELECT COALESCE(SUM(s.characterCount), 0) FROM SpeechHistory s")
    long getTotalCharactersConverted();

    @Query("SELECT s.language, COUNT(s) FROM SpeechHistory s GROUP BY s.language ORDER BY COUNT(s) DESC")
    List<Object[]> getPopularLanguages();

    @Query("SELECT s.voice, COUNT(s) FROM SpeechHistory s GROUP BY s.voice ORDER BY COUNT(s) DESC")
    List<Object[]> getPopularVoices();

    // User-specific analytics (Personal stats)
    @Query("SELECT COUNT(s) FROM SpeechHistory s WHERE s.user = :user")
    long countByUser(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(s.characterCount), 0) FROM SpeechHistory s WHERE s.user = :user")
    long getTotalCharactersByUser(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(s.wordCount), 0) FROM SpeechHistory s WHERE s.user = :user")
    long getTotalWordsByUser(@Param("user") User user);

    @Query("SELECT s.language, COUNT(s) FROM SpeechHistory s WHERE s.user = :user GROUP BY s.language ORDER BY COUNT(s) DESC")
    List<Object[]> getPopularLanguagesByUser(@Param("user") User user);

    @Query("SELECT s.voice, COUNT(s) FROM SpeechHistory s WHERE s.user = :user GROUP BY s.voice ORDER BY COUNT(s) DESC")
    List<Object[]> getPopularVoicesByUser(@Param("user") User user);
}
