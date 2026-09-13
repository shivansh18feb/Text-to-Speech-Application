package com.example.tts;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TtsApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.supportedLanguages").isNumber())
                .andExpect(jsonPath("$.supportedVoices").isNumber());
    }

    @Test
    void testVoicesEndpoint() throws Exception {
        mockMvc.perform(get("/api/voices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").exists());
    }

    @Test
    void testLanguagesEndpoint() throws Exception {
        mockMvc.perform(get("/api/languages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].code").exists());
    }

    @Test
    void testTtsValidationErrorEmptyText() throws Exception {
        String invalidPayload = """
                {
                    "text": "",
                    "language": "en-US",
                    "voice": "en-US-Standard"
                }
                """;

        mockMvc.perform(post("/api/tts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation Error"));
    }

    @Test
    void testAuthLoginSuccess() throws Exception {
        String loginPayload = """
                {
                    "email": "demo@tts.com",
                    "password": "Demo@123"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.email").value("demo@tts.com"));
    }

    @Test
    void testAuthLoginBadCredentials() throws Exception {
        String invalidLogin = """
                {
                    "email": "demo@tts.com",
                    "password": "WrongPassword!"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidLogin))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testTxtDocumentExtraction() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.txt",
                "text/plain",
                "This is a test speech document for speech synthesis.".getBytes()
        );

        mockMvc.perform(multipart("/api/files/extract").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.fileType").value("txt"))
                .andExpect(jsonPath("$.text").value("This is a test speech document for speech synthesis."));
    }

    @Test
    void testAiEnhanceEndpoint() throws Exception {
        String aiPayload = """
                {
                    "text": "i cannot go there because it is very late",
                    "action": "conversational"
                }
                """;

        mockMvc.perform(post("/api/ai/enhance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(aiPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.enhancedText").exists());
    }

    @Test
    void testAnalyticsEndpoint() throws Exception {
        mockMvc.perform(get("/api/analytics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").isNumber())
                .andExpect(jsonPath("$.totalGenerations").isNumber());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testAdminStatsEndpointWithAdminRole() throws Exception {
        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").isNumber());
    }

    @Test
    @WithMockUser(roles = "USER")
    void testAdminStatsForbiddenForNormalUser() throws Exception {
        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isForbidden());
    }
}
