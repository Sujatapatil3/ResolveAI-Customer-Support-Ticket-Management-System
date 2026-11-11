
package com.resolveai.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.resolveai.service.GeminiService;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final GeminiService geminiService;

    public AIController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/classify")
    public Map<String, String> classifyTicket(
            @RequestBody Map<String, String> request) {

        String title = request.get("title");
        String description = request.get("description");

        String result = geminiService.classifyTicket(title, description);

        return Map.of("result", result);
    }
}
