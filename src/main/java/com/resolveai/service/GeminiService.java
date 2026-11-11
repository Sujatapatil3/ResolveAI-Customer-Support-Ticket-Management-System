
package com.resolveai.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import tools.jackson.databind.JsonNode;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestClient restClient = RestClient.create();

    public String classifyTicket(String title, String description) {

        String prompt = """
                Analyze this customer support ticket.

                Title: %s
                Description: %s

                Return only valid JSON in this format:
                {
                  "category": "TECHNICAL",
                  "priority": "HIGH"
                }

                Category must be one of:
                TECHNICAL, BILLING, ACCOUNT, GENERAL.

                Priority must be one of:
                LOW, MEDIUM, HIGH.
                """.formatted(title, description);

        Map<String, Object> requestBody = Map.of(
            "contents", new Object[] {
                Map.of("parts", new Object[] {
                    Map.of("text", prompt)
                })
            }
        );

        JsonNode response = restClient.post()
                .uri(apiUrl)
                .header("x-goog-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(JsonNode.class);

        return response.path("candidates")
                .path(0)
                .path("content")
                .path("parts")
                .path(0)
                .path("text")
                .asText();
    }
}
