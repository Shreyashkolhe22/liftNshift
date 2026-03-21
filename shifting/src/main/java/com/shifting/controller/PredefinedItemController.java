package com.shifting.controller;

import com.shifting.model.PredefinedItem;
import com.shifting.service.PredefinedItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/predefined-items")
@RequiredArgsConstructor
@Tag(name = "Predefined Items", description = "Browse available items for a booking")
@SecurityRequirement(name = "bearerAuth")
public class PredefinedItemController {

    private final PredefinedItemService predefinedItemService;

    @GetMapping
    @Operation(summary = "Get all predefined items", description = "Returns the full catalog of items a user can add to their booking")
    public ResponseEntity<List<PredefinedItem>> getAllItems() {
        return ResponseEntity.ok(predefinedItemService.getAllItems());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get predefined item by ID")
    public ResponseEntity<PredefinedItem> getItemById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(predefinedItemService.getItemById(id));
    }
}