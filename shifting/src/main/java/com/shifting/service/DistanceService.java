package com.shifting.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class DistanceService {

    @Value("${openrouteservice.api.key}")
    private String apiKey;

    private static final String ORS_URL =
            "https://api.openrouteservice.org/v2/directions/driving-car";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Calls OpenRouteService API and returns road distance in km.
     * Falls back to Haversine if the API call fails.
     */
    public double getRoadDistanceKm(double pickupLat, double pickupLng,
                                    double dropLat, double dropLng) {
        try {
            // ORS expects: [longitude, latitude] order
            String body = String.format(
                    "{\"coordinates\":[[%f,%f],[%f,%f]]}",
                    pickupLng, pickupLat, dropLng, dropLat
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ORS_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                // distance is in meters — convert to km
                double meters = root
                        .path("routes").get(0)
                        .path("summary")
                        .path("distance")
                        .asDouble();
                return Math.round((meters / 1000.0) * 10.0) / 10.0; // 1 decimal place
            }

        } catch (Exception e) {
            System.err.println("[DistanceService] ORS call failed, falling back to Haversine: " + e.getMessage());
        }

        // Fallback: Haversine straight-line * 1.3 road factor
        return haversineWithRoadFactor(pickupLat, pickupLng, dropLat, dropLng);
    }

    /**
     * Haversine formula — straight-line distance * 1.3 road correction factor.
     * Used as fallback when ORS API is unavailable.
     */
    private double haversineWithRoadFactor(double lat1, double lng1,
                                           double lat2, double lng2) {
        final int R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double straightLine = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double withRoadFactor = straightLine * 1.3;
        return Math.round(withRoadFactor * 10.0) / 10.0;
    }
}