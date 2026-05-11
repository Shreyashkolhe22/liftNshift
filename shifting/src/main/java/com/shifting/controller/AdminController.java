package com.shifting.controller;

import com.shifting.model.BookingStatus;
import com.shifting.model.PredefinedItem;
import com.shifting.payload.dto.*;
import com.shifting.payload.request.AssignTruckRequest;
import com.shifting.payload.request.PredefinedItemRequest;
import com.shifting.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // ── DASHBOARD ─────────────────────────────────────────────────
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDto> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ── USERS ─────────────────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<AdminUserDto> getUserById(
            @PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getUserById(userId));
    }

    @PatchMapping("/users/{userId}/make-admin")
    public ResponseEntity<AdminUserDto> makeAdmin(
            @PathVariable Long userId) {
        return ResponseEntity.ok(adminService.makeAdmin(userId));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }

    // ── BOOKINGS ──────────────────────────────────────────────────
    @GetMapping("/bookings")
    public ResponseEntity<List<AdminBookingDto>> getAllBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }

    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<AdminBookingDto> getBookingById(
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(adminService.getBookingById(bookingId));
    }

    @PatchMapping("/bookings/{bookingId}/status")
    public ResponseEntity<AdminBookingDto> updateStatus(
            @PathVariable Long bookingId,
            @RequestParam BookingStatus status) {
        return ResponseEntity.ok(
                adminService.updateBookingStatus(bookingId, status));
    }

    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<String> deleteBooking(
            @PathVariable Long bookingId) {
        adminService.deleteBooking(bookingId);
        return ResponseEntity.ok("Booking deleted successfully");
    }

    // ── PREDEFINED ITEMS ──────────────────────────────────────────
    @GetMapping("/items")
    public ResponseEntity<List<PredefinedItem>> getAllItems() {
        return ResponseEntity.ok(adminService.getAllItems());
    }

    @PostMapping("/items")
    public ResponseEntity<PredefinedItem> addItem(
            @RequestBody PredefinedItemRequest request) {
        return ResponseEntity.ok(adminService.addItem(request));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<PredefinedItem> updateItem(
            @PathVariable Long id,
            @RequestBody PredefinedItemRequest request) {
        return ResponseEntity.ok(adminService.updateItem(id, request));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<String> deleteItem(@PathVariable Long id) {
        adminService.deleteItem(id);
        return ResponseEntity.ok("Item deleted successfully");
    }

    // ── TRUCK + DRIVER ASSIGNMENT ─────────────────────────────────────

    // Get available trucks for a specific booking
    @GetMapping("/bookings/{bookingId}/available-trucks")
    public ResponseEntity<List<TruckDto>> getAvailableTrucks(
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(adminService.getAvailableTrucks(bookingId));
    }

    // Get available drivers for a specific booking
    @GetMapping("/bookings/{bookingId}/available-drivers")
    public ResponseEntity<List<DriverDto>> getAvailableDrivers(
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(adminService.getAvailableDrivers(bookingId));
    }

    // Assign truck + driver → booking becomes CONFIRMED
    @PostMapping("/bookings/{bookingId}/assign")
    public ResponseEntity<AssignmentResponseDto> assignTruckAndDriver(
            @PathVariable Long bookingId,
            @RequestBody AssignTruckRequest request) {
        return ResponseEntity.ok(
                adminService.assignTruckAndDriver(bookingId, request)
        );
    }

    // ── TRUCK MANAGEMENT ──────────────────────────────────────────────
    @GetMapping("/trucks")
    public ResponseEntity<List<TruckDto>> getAllTrucks() {
        return ResponseEntity.ok(adminService.getAllTrucks());
    }

    @PostMapping("/trucks")
    public ResponseEntity<TruckDto> addTruck(@RequestBody TruckDto dto) {
        return ResponseEntity.ok(adminService.addTruck(dto));
    }

    @PutMapping("/trucks/{id}")
    public ResponseEntity<TruckDto> updateTruck(
            @PathVariable Long id, @RequestBody TruckDto dto) {
        return ResponseEntity.ok(adminService.updateTruck(id, dto));
    }

    @DeleteMapping("/trucks/{id}")
    public ResponseEntity<String> deleteTruck(@PathVariable Long id) {
        adminService.deleteTruck(id);
        return ResponseEntity.ok("Truck deleted successfully");
    }

    // ── DRIVER MANAGEMENT ─────────────────────────────────────────────
    @GetMapping("/drivers")
    public ResponseEntity<List<DriverDto>> getAllDrivers() {
        return ResponseEntity.ok(adminService.getAllDrivers());
    }

    @PostMapping("/drivers")
    public ResponseEntity<DriverDto> addDriver(@RequestBody DriverDto dto) {
        return ResponseEntity.ok(adminService.addDriver(dto));
    }

    @PutMapping("/drivers/{id}")
    public ResponseEntity<DriverDto> updateDriver(
            @PathVariable Long id, @RequestBody DriverDto dto) {
        return ResponseEntity.ok(adminService.updateDriver(id, dto));
    }

    @DeleteMapping("/drivers/{id}")
    public ResponseEntity<String> deleteDriver(@PathVariable Long id) {
        adminService.deleteDriver(id);
        return ResponseEntity.ok("Driver deleted successfully");
    }
}