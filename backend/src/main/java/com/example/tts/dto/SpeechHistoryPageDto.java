package com.example.tts.dto;

import com.example.tts.entity.SpeechHistory;
import java.util.List;

public record SpeechHistoryPageDto(
        List<SpeechHistory> content,
        int totalElements,
        int totalPages,
        int page,
        int size
) {}
