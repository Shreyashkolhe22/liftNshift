package com.shifting.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class DistanceService {

    private static final Logger log = LoggerFactory.getLogger(DistanceService.class);

    @Value("${openrouteservice.api.key}")
    private String apiKey;

    private static final String ORS_URL =
            "https://api.openrouteservice.org/v2/directions/driving-car";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public double getRoadDistanceKm(double pickupLat, double pickupLng,
                                    double dropLat, double dropLng) {
        try {
            String body = String.format(
                    "{\"coordinates\":[[%f,%f],[%f,%f]]}",
                    pickupLng, pickupLat, dropLng, dropLat
            );

            log.info("[ORS] Sending request to ORS — body: {}", body);
            log.info("[ORS] Using API key starting with: {}...", apiKey.substring(0, Math.min(10, apiKey.length())));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ORS_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            log.info("[ORS] Response status: {}", response.statusCode());
            log.info("[ORS] Response body: {}", response.body());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                double meters = root
                        .path("routes").get(0)
                        .path("summary")
                        .path("distance")
                        .asDouble();
                double km = Math.round((meters / 1000.0) * 10.0) / 10.0;
                log.info("[ORS] Road distance: {} km", km);
                return km;
            } else {
                log.error("[ORS] Non-200 status: {} — body: {}", response.statusCode(), response.body());
            }

        } catch (Exception e) {
            log.error("[ORS] Exception during API call: {}", e.getMessage(), e);
        }

        log.warn("[ORS] Falling back to Haversine");
        return haversineWithRoadFactor(pickupLat, pickupLng, dropLat, dropLng);
    }

    private double haversineWithRoadFactor(double lat1, double lng1,
                                           double lat2, double lng2) {
        final int R = 6371;
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