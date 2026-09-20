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

    @Autowired
    private com.example.tts.security.JwtUtils jwtUtils;

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

    @Test
    void testLogoutEndpoint() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testTtsVoiceLanguageMismatch() throws Exception {
        String payload = """
                {
                    "text": "Testing voice and language mismatch detection.",
                    "language": "en-US",
                    "voice": "hi-IN-Standard"
                }
                """;

        mockMvc.perform(post("/api/tts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void testTtsInvalidLanguage() throws Exception {
        String payload = """
                {
                    "text": "Hello world.",
                    "language": "invalid-LANG",
                    "voice": "en-US-Standard"
                }
                """;

        mockMvc.perform(post("/api/tts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void testFavoritesCheckEndpointAnonymous() throws Exception {
        mockMvc.perform(get("/api/favorites/check")
                        .param("targetType", "VOICE")
                        .param("referenceId", "en-US-Standard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isFavorite").value(false));
    }

    @Test
    void testProtectedFavoritesUnauthorizedWithoutToken() throws Exception {
        mockMvc.perform(get("/api/favorites"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testRegisterNewUserSuccess() throws Exception {
        String uniqueEmail = "testuser_" + System.currentTimeMillis() + "@tts.com";
        String payload = String.format("""
                {
                    "name": "Test Runner",
                    "email": "%s",
                    "password": "Password@123"
                }
                """, uniqueEmail);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.email").value(uniqueEmail));
    }

    @Test
    void testRegisterDuplicateEmailFails() throws Exception {
        String payload = """
                {
                    "name": "Demo Duplicate",
                    "email": "demo@tts.com",
                    "password": "Demo@123"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void testGraphQlLanguagesQueryPublic() throws Exception {
        String query = """
                {"query": "query { languages { code name nativeName voices { id name } } }"}
                """;

        mockMvc.perform(post("/graphql")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(query))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.languages").isArray())
                .andExpect(jsonPath("$.data.languages[0].code").exists())
                .andExpect(jsonPath("$.errors").doesNotExist());
    }

    @Test
    void testGraphQlVoicesQueryWithArgument() throws Exception {
        String query = """
                {"query": "query { voices(language: \\\"en-US\\\") { id name gender languageCode } }"}
                """;

        mockMvc.perform(post("/graphql")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(query))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.voices").isArray())
                .andExpect(jsonPath("$.data.voices[0].languageCode").value("en-US"));
    }

    @Test
    void testGraphQlMeQueryUnauthenticatedFails() throws Exception {
        String query = """
                {"query": "query { me { id name email } }"}
                """;

        mockMvc.perform(post("/graphql")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(query))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errors").isArray())
                .andExpect(jsonPath("$.errors[0].extensions.classification").value("FORBIDDEN"));
    }

    @Test
    void testGraphQlMeQueryAuthenticatedSuccess() throws Exception {
        String token = jwtUtils.generateToken("demo@tts.com", "ROLE_USER");
        String query = """
                {"query": "query { me { email name role } }"}
                """;

        mockMvc.perform(post("/graphql")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(query))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.me.email").value("demo@tts.com"))
                .andExpect(jsonPath("$.errors").doesNotExist());
    }

    @Test
    void testGraphQlHistoryAndFavoritesAuthenticated() throws Exception {
        String token = jwtUtils.generateToken("demo@tts.com", "ROLE_USER");
        String query = """
                {"query": "query { mySpeechHistory(page: 0, size: 5) { totalElements page size } myFavorites { id targetType referenceId } myAnalytics { totalGenerations totalFavorites } }"}
                """;

        mockMvc.perform(post("/graphql")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(query))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.mySpeechHistory.page").value(0))
                .andExpect(jsonPath("$.data.myFavorites").isArray())
                .andExpect(jsonPath("$.data.myAnalytics.totalGenerations").isNumber())
                .andExpect(jsonPath("$.errors").doesNotExist());
    }

    @Test
    void testGraphQlFavoriteMutationsAndCrossUserIsolation() throws Exception {
        String tokenA = jwtUtils.generateToken("demo@tts.com", "ROLE_USER");
        String tokenB = jwtUtils.generateToken("admin@tts.com", "ROLE_ADMIN");

        // User A adds a favorite via GraphQL mutation
        String addMutation = """
                {"query": "mutation { addFavorite(input: { targetType: \\\"VOICE\\\", referenceId: \\\"hi-IN-Female\\\", title: \\\"Hindi Female Voice\\\" }) { id targetType referenceId } }"}
                """;

        mockMvc.perform(post("/graphql")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addMutation))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.addFavorite.referenceId").value("hi-IN-Female"));

        // User B checks isFavorite for the same voice -> must be FALSE because favorites are user-isolated!
        String checkBQuery = """
                {"query": "query { isFavorite(targetType: \\\"VOICE\\\", referenceId: \\\"hi-IN-Female\\\") }"}
                """;

        mockMvc.perform(post("/graphql")
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkBQuery))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isFavorite").value(false));
    }
}
