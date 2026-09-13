package com.example.tts.service;

import com.example.tts.exception.InvalidRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiEnhancementService {

    private static final Logger logger = LoggerFactory.getLogger(AiEnhancementService.class);

    @Value("${app.ai.api-key:}")
    private String aiApiKey;

    @Value("${app.ai.provider:auto}")
    private String aiProvider;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public Map<String, Object> enhanceText(String text, String action) {
        if (text == null || text.trim().isEmpty()) {
            throw new InvalidRequestException("Text cannot be empty for AI enhancement.");
        }

        String normalizedAction = action != null ? action.trim().toLowerCase() : "rewrite";
        String enhanced;
        String usedProvider = "Built-in Speech AI Engine";

        // If an external key is configured and user configured external LLM
        if (aiApiKey != null && !aiApiKey.isBlank() && !"auto".equalsIgnoreCase(aiProvider)) {
            try {
                enhanced = callExternalLlm(text, normalizedAction);
                usedProvider = "External AI (" + aiProvider + ")";
            } catch (Exception e) {
                logger.warn("External AI call failed, falling back to built-in transformer: {}", e.getMessage());
                enhanced = processWithBuiltInEngine(text, normalizedAction);
            }
        } else {
            enhanced = processWithBuiltInEngine(text, normalizedAction);
        }

        return Map.of(
                "success", true,
                "originalText", text,
                "enhancedText", enhanced,
                "action", normalizedAction,
                "provider", usedProvider
        );
    }

    private String processWithBuiltInEngine(String text, String action) {
        String trimmed = text.trim();

        return switch (action) {
            case "summarize" -> summarizeText(trimmed);
            case "grammar" -> fixGrammarAndPunctuation(trimmed);
            case "conversational" -> makeConversational(trimmed);
            case "formal" -> makeFormal(trimmed);
            case "rewrite" -> rewriteForClarity(trimmed);
            default -> rewriteForClarity(trimmed);
        };
    }

    private String summarizeText(String text) {
        String[] sentences = text.split("(?<=[.?!])\\s+");
        if (sentences.length <= 2) {
            return text;
        }

        // Extract key thematic sentences (first sentence, longest informative sentence, last conclusion)
        List<String> keySentences = new ArrayList<>();
        keySentences.add(sentences[0]);

        int middleBestIdx = 1;
        int maxLen = 0;
        for (int i = 1; i < sentences.length - 1; i++) {
            if (sentences[i].length() > maxLen) {
                maxLen = sentences[i].length();
                middleBestIdx = i;
            }
        }
        if (middleBestIdx > 0 && middleBestIdx < sentences.length - 1) {
            keySentences.add(sentences[middleBestIdx]);
        }

        if (sentences.length > 2) {
            keySentences.add(sentences[sentences.length - 1]);
        }

        return String.join(" ", keySentences);
    }

    private String fixGrammarAndPunctuation(String text) {
        // 1. Capitalize first letter of every sentence
        // 2. Fix repeated punctuation
        // 3. Fix common grammar typos and contractions
        String res = text.replaceAll("\\s+", " ")
                .replaceAll("\\s*([,;:])\\s*", "$1 ")
                .replaceAll("\\s*([.?!])\\s*", "$1 ");

        // Capitalize first character of text
        if (!res.isEmpty()) {
            res = Character.toUpperCase(res.charAt(0)) + (res.length() > 1 ? res.substring(1) : "");
        }

        // Capitalize after periods
        Pattern pattern = Pattern.compile("([.?!]\\s+)([a-z])");
        Matcher matcher = pattern.matcher(res);
        StringBuilder sb = new StringBuilder();
        while (matcher.find()) {
            matcher.appendReplacement(sb, matcher.group(1) + matcher.group(2).toUpperCase());
        }
        matcher.appendTail(sb);
        res = sb.toString();

        // Ensure final punctuation
        if (!res.isEmpty() && !res.matches(".*[.?!]$")) {
            res = res + ".";
        }

        return res;
    }

    private String makeConversational(String text) {
        String res = fixGrammarAndPunctuation(text);
        // Replace stiff written phrasing with spoken cadence
        res = res.replaceAll("(?i)\\bdo not\\b", "don't")
                .replaceAll("(?i)\\bcannot\\b", "can't")
                .replaceAll("(?i)\\bwill not\\b", "won't")
                .replaceAll("(?i)\\bit is\\b", "it's")
                .replaceAll("(?i)\\bwe are\\b", "we're")
                .replaceAll("(?i)\\bthat is\\b", "that's")
                .replaceAll("(?i)\\butilize\\b", "use")
                .replaceAll("(?i)\\bfurthermore\\b", "also")
                .replaceAll("(?i)\\bconsequently\\b", "so")
                .replaceAll("(?i)\\bin order to\\b", "to");

        return res;
    }

    private String makeFormal(String text) {
        String res = fixGrammarAndPunctuation(text);
        // Expand contractions and elevate vocabulary
        res = res.replaceAll("(?i)\\bdon't\\b", "do not")
                .replaceAll("(?i)\\bcan't\\b", "cannot")
                .replaceAll("(?i)\\bwon't\\b", "will not")
                .replaceAll("(?i)\\bit's\\b", "it is")
                .replaceAll("(?i)\\bwe're\\b", "we are")
                .replaceAll("(?i)\\bthat's\\b", "that is");

        return res;
    }

    private String rewriteForClarity(String text) {
        String res = fixGrammarAndPunctuation(text);
        // Remove redundant filler phrases
        res = res.replaceAll("(?i)\\bas a matter of fact,?\\s*", "")
                .replaceAll("(?i)\\bat the end of the day,?\\s*", "")
                .replaceAll("(?i)\\bfor all intents and purposes,?\\s*", "")
                .replaceAll("(?i)\\bneedless to say,?\\s*", "")
                .replaceAll("\\s+", " ").trim();

        return res;
    }

    private String callExternalLlm(String text, String action) throws Exception {
        // Standard OpenAI-compatible format if key is configured
        String prompt = "Transform the following text for natural text-to-speech audio by performing " + action + ":\n\n" + text;
        String requestBody = "{\"model\":\"gpt-3.5-turbo\",\"messages\":[{\"role\":\"user\",\"content\":\"" + prompt.replace("\"", "\\\"").replace("\n", " ") + "\"}]}";

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + aiApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() == 200) {
            // Basic JSON extraction of choices[0].message.content
            String body = resp.body();
            int idx = body.indexOf("\"content\":");
            if (idx != -1) {
                int start = body.indexOf("\"", idx + 10) + 1;
                int end = body.indexOf("\"", start);
                if (start > 0 && end > start) {
                    return body.substring(start, end).replace("\\n", "\n").replace("\\\"", "\"");
                }
            }
        }
        throw new RuntimeException("External LLM response code: " + resp.statusCode());
    }
}
