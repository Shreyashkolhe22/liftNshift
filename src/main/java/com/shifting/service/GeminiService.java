package com.shifting.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    // ✅ Updated to gemini-2.5-flash
    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/" +
                    "models/gemini-2.5-flash:generateContent";

    private final WebClient    webClient    = WebClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String ask(String prompt) {
        int maxRetries = 3;
        int delayMs    = 2000;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                String safePrompt = prompt
                        .replace("\\", "\\\\")
                        .replace("\"", "\\\"")
                        .replace("\n", "\\n");

                String requestBody = """
                    {
                      "contents": [{
                        "parts": [{"text": "%s"}]
                      }],
                      "generationConfig": {
                        "temperature": 0.1,
                        "maxOutputTokens": 500
                      }
                    }
                    """.formatted(safePrompt);

                String response = webClient.post()
                        .uri(GEMINI_URL)
                        .header("Content-Type", "application/json")
                        .header("x-goog-api-key", apiKey)   // ✅ header not query param
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();

                JsonNode root = objectMapper.readTree(response);
                String text   = root
                        .path("candidates").get(0)
                        .path("content")
                        .path("parts").get(0)
                        .path("text").asText();

                log.info("Gemini responded on attempt {}", attempt);
                return text.trim();

            } catch (Exception e) {
                log.warn("Gemini attempt {}/{} failed: {}",
                        attempt, maxRetries, e.getMessage());

                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(delayMs * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                } else {
                    log.error("Gemini API failed after {} attempts", maxRetries);
                    throw new RuntimeException(
                            "AI service unavailable. Please try again in a moment.");
                }
            }
        }
        throw new RuntimeException("AI service unavailable.");
    }
}