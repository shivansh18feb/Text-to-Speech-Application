package com.example.tts.service;

import com.example.tts.entity.SpeechHistory;
import com.example.tts.entity.User;
import com.example.tts.repository.SpeechHistoryRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class SpeechHistoryService {

    private final SpeechHistoryRepository historyRepository;

    public SpeechHistoryService(SpeechHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    @Transactional
    public SpeechHistory recordGeneration(User user, String text, String language, String voice,
                                         Double speed, Double pitch, String voiceStyle,
                                         String audioUrl, Long audioSizeBytes,
                                         Integer characterCount, Integer wordCount) {
        SpeechHistory history = new SpeechHistory();
        history.setUser(user);
        history.setText(text);
        history.setLanguage(language);
        history.setVoice(voice);
        history.setSpeed(speed != null ? speed : 1.0);
        history.setPitch(pitch != null ? pitch : 1.0);
        history.setVoiceStyle(voiceStyle != null ? voiceStyle : "Standard");
        history.setAudioUrl(audioUrl);
        history.setAudioSizeBytes(audioSizeBytes);
        history.setCharacterCount(characterCount);
        history.setWordCount(wordCount);

        return historyRepository.save(history);
    }

    public List<SpeechHistory> getUserHistory(User user) {
        if (user != null) {
            return historyRepository.findByUserOrderByCreatedAtDesc(user);
        }
        return Collections.emptyList();
    }

    public List<SpeechHistory> getUserHistory(User user, Pageable pageable) {
        if (user != null) {
            return historyRepository.findByUserOrderByCreatedAtDesc(user, pageable).getContent();
        }
        return Collections.emptyList();
    }

    public org.springframework.data.domain.Page<SpeechHistory> getUserHistoryPage(User user, Pageable pageable) {
        if (user != null) {
            return historyRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        }
        return org.springframework.data.domain.Page.empty();
    }

    public List<SpeechHistory> getAllHistory() {
        return historyRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<SpeechHistory> getHistoryById(Long id) {
        return historyRepository.findById(id);
    }

    public Optional<SpeechHistory> getHistoryItemById(Long id, User user) {
        Optional<SpeechHistory> itemOpt = historyRepository.findById(id);
        if (itemOpt.isPresent()) {
            SpeechHistory item = itemOpt.get();
            if (user != null && (user.getRole().equals("ROLE_ADMIN")
                    || (item.getUser() != null && item.getUser().getId().equals(user.getId())))) {
                return itemOpt;
            }
        }
        return Optional.empty();
    }

    @Transactional
    public boolean deleteHistory(Long id, User user) {
        Optional<SpeechHistory> opt = historyRepository.findById(id);
        if (opt.isPresent()) {
            SpeechHistory item = opt.get();
            // If linked to user, only the owner or admin can delete
            if (user == null || item.getUser() == null || item.getUser().getId().equals(user.getId())
                    || "ROLE_ADMIN".equals(user.getRole())) {
                historyRepository.delete(item);
                return true;
            }
        }
        return false;
    }

    @Transactional
    public void clearUserHistory(User user) {
        if (user != null) {
            historyRepository.deleteByUser(user);
        }
    }
}
