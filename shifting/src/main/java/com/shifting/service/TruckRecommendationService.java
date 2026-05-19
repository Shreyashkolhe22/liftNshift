package com.shifting.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shifting.exception.ApiException;
import com.shifting.model.*;
import com.shifting.payload.dto.*;
import com.shifting.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TruckRecommendationService {

    private final BookingRepository     bookingRepository;
    private final TruckRepository       truckRepository;
    private final DriverRepository      driverRepository;
    private final BookingSlotRepository bookingSlotRepository;
    private final GeminiService         geminiService;
    private final ObjectMapper          objectMapper = new ObjectMapper();

    // ── MAIN METHOD ───────────────────────────────────────────────
    public TruckRecommendationDto recommend(Long bookingId) {

        // 1. Get booking with items
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Booking not found: " + bookingId));

        if (booking.getItems() == null || booking.getItems().isEmpty())
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "No items in this booking. Add items before getting AI recommendation.");

        // 2. Build items description for Gemini
        StringBuilder itemsDesc = new StringBuilder();
        for (BookingItem item : booking.getItems()) {
            String name = item.getPredefinedItem() != null
                    ? item.getPredefinedItem().getName()
                    : item.getCustomName();
            String size = item.getSize() != null ? item.getSize().name() : "MEDIUM";
            itemsDesc.append(String.format("- %dx %s (%s size item)\n",
                    item.getQuantity(), name, size));
        }

        double distanceKm = booking.getDistanceKm() != null
                ? booking.getDistanceKm() : 0;

        // 3. Build prompt for Gemini
        String prompt = buildPrompt(itemsDesc.toString(), distanceKm);

        // 4. Call Gemini API
        String aiResponse = geminiService.ask(prompt);
        log.info("Raw Gemini response: {}", aiResponse);

        // 5. Parse JSON response from Gemini
        TruckRecommendationDto recommendation = parseAiResponse(aiResponse);

        // 6. Get available trucks of recommended size for this booking's slot
        List<Truck> allActiveTrucks = truckRepository.findByIsActiveTrue();

        List<TruckDto> availableTrucks = allActiveTrucks.stream()
                .filter(t -> {
                    // If booking has a slot, filter by availability
                    if (booking.getScheduledDate() != null && booking.getTimeSlot() != null) {
                        return !bookingSlotRepository
                                .existsByTruckIdAndSlotDateAndTimeSlot(
                                        t.getId(),
                                        booking.getScheduledDate(),
                                        booking.getTimeSlot()
                                );
                    }
                    return true;
                })
                .map(t -> TruckDto.builder()
                        .id(t.getId())
                        .regNumber(t.getRegNumber())
                        .size(t.getSize())
                        .capacityKg(t.getCapacityKg())
                        .isActive(t.getIsActive())
                        .build())
                .collect(Collectors.toList());

        // 7. Get available drivers for this booking's slot
        List<DriverDto> availableDrivers = driverRepository.findByIsActiveTrue()
                .stream()
                .filter(d -> {
                    if (booking.getScheduledDate() != null && booking.getTimeSlot() != null) {
                        return !bookingSlotRepository
                                .existsByDriverIdAndSlotDateAndTimeSlot(
                                        d.getId(),
                                        booking.getScheduledDate(),
                                        booking.getTimeSlot()
                                );
                    }
                    return true;
                })
                .map(d -> DriverDto.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .phone(d.getPhone())
                        .licenseNo(d.getLicenseNo())
                        .isActive(d.getIsActive())
                        .build())
                .collect(Collectors.toList());

        recommendation.setAvailableTrucks(availableTrucks);
        recommendation.setAvailableDrivers(availableDrivers);

        return recommendation;
    }

    // ── BUILD PROMPT ──────────────────────────────────────────────
    private String buildPrompt(String itemsList, double distanceKm) {
        return """
            You are a logistics expert for a home shifting company in India.
            
            A customer wants to move the following items:
            %s
            Moving distance: %.1f km
            
            Truck sizes available:
            - SMALL  → suitable for studio/1BHK, light items, up to 600 kg
            - MEDIUM → suitable for 2BHK with moderate furniture, up to 1200 kg
            - LARGE  → suitable for 3BHK or heavy furniture loads, up to 2000 kg
            
            Based on the items list, recommend the best truck size.
            
            Reply ONLY with this exact JSON format, no extra text, no markdown:
            {
              "recommendedTruckSize": "LARGE",
              "confidence": "HIGH",
              "estimatedLoadPercent": 85,
              "reason": "Your reason in 1-2 sentences.",
              "warning": null
            }
            
            confidence must be HIGH, MEDIUM, or LOW.
            warning is null or a short warning string.
            """.formatted(itemsList, distanceKm);
    }

    // ── PARSE AI RESPONSE ─────────────────────────────────────────
    private TruckRecommendationDto parseAiResponse(String response) {
        try {
            // Clean response — remove markdown code blocks if present
            String cleaned = response
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();

            // Find JSON object in response
            int start = cleaned.indexOf("{");
            int end   = cleaned.lastIndexOf("}");
            if (start == -1 || end == -1)
                throw new RuntimeException("No JSON found in AI response");

            String json = cleaned.substring(start, end + 1);
            JsonNode node = objectMapper.readTree(json);

            String size       = node.path("recommendedTruckSize").asText("MEDIUM");
            String confidence = node.path("confidence").asText("MEDIUM");
            int    load       = node.path("estimatedLoadPercent").asInt(70);
            String reason     = node.path("reason").asText("AI recommendation based on items.");
            String warning    = node.path("warning").isNull() ? null : node.path("warning").asText();

            // Validate size
            if (!List.of("SMALL","MEDIUM","LARGE").contains(size)) size = "MEDIUM";
            if (!List.of("HIGH","MEDIUM","LOW").contains(confidence)) confidence = "MEDIUM";

            return TruckRecommendationDto.builder()
                    .recommendedTruckSize(size)
                    .confidence(confidence)
                    .estimatedLoadPercent(Math.min(100, Math.max(0, load)))
                    .reason(reason)
                    .warning(warning)
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
            // Return safe fallback
            return TruckRecommendationDto.builder()
                    .recommendedTruckSize("MEDIUM")
                    .confidence("LOW")
                    .estimatedLoadPercent(50)
                    .reason("AI analysis unavailable. Please select truck manually based on items.")
                    .warning("Could not parse AI response. Manual selection recommended.")
                    .build();
        }
    }
}