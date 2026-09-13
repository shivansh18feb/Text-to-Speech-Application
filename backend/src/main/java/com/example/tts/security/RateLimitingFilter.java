package com.example.tts.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    @Value("${app.ratelimit.enabled:true}")
    private boolean rateLimitEnabled;

    @Value("${app.ratelimit.requests-per-minute:30}")
    private int maxRequestsPerMinute;

    private final Map<String, TokenBucket> ipBuckets = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static class TokenBucket {
        int tokens;
        long lastRefillTimestamp;

        TokenBucket(int maxTokens) {
            this.tokens = maxTokens;
            this.lastRefillTimestamp = Instant.now().getEpochSecond();
        }

        synchronized boolean tryConsume(int maxTokens) {
            long now = Instant.now().getEpochSecond();
            long secondsPassed = now - lastRefillTimestamp;
            if (secondsPassed >= 60) {
                tokens = maxTokens;
                lastRefillTimestamp = now;
            } else {
                int refill = (int) (secondsPassed * maxTokens / 60);
                if (refill > 0) {
                    tokens = Math.min(maxTokens, tokens + refill);
                    lastRefillTimestamp = now;
                }
            }

            if (tokens > 0) {
                tokens--;
                return true;
            }
            return false;
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Apply rate limits primarily to resource-intensive generation/upload endpoints
        String path = request.getRequestURI();
        if (rateLimitEnabled && (path.startsWith("/api/tts") || path.startsWith("/api/files/extract") || path.startsWith("/api/ai/enhance"))) {
            String clientIp = getClientIp(request);
            TokenBucket bucket = ipBuckets.computeIfAbsent(clientIp, k -> new TokenBucket(maxRequestsPerMinute));

            if (!bucket.tryConsume(maxRequestsPerMinute)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                Map<String, Object> errorDetails = Map.of(
                        "success", false,
                        "status", 429,
                        "error", "Too Many Requests",
                        "message", "Rate limit exceeded. Maximum " + maxRequestsPerMinute + " requests per minute allowed.",
                        "retryAfterSeconds", 30
                );
                response.getWriter().write(objectMapper.writeValueAsString(errorDetails));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || !xfHeader.contains(",")) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
