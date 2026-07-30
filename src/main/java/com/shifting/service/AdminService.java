package com.shifting.service;

import com.shifting.model.BookingStatus;
import com.shifting.model.PredefinedItem;
import com.shifting.payload.dto.*;
import com.shifting.payload.request.AssignTruckRequest;
import com.shifting.payload.request.PredefinedItemRequest;
import java.util.List;

public interface AdminService {

    // Dashboard
    AdminDashboardDto getDashboardStats();

    // Users
    List<AdminUserDto> getAllUsers();
    AdminUserDto getUserById(Long userId);
    AdminUserDto makeAdmin(Long userId);
    void deleteUser(Long userId);

    // Bookings
    List<AdminBookingDto> getAllBookings();
    AdminBookingDto getBookingById(Long bookingId);
    AdminBookingDto updateBookingStatus(Long bookingId, BookingStatus status);
    void deleteBooking(Long bookingId);

    // ── NEW — Truck + Driver assignment ───────────────────────────
    AssignmentResponseDto assignTruckAndDriver(
            Long bookingId, AssignTruckRequest request
    );

    // Get available trucks for a booking's date + slot
    List<TruckDto> getAvailableTrucks(Long bookingId);

    // Get available drivers for a booking's date + slot
    List<DriverDto> getAvailableDrivers(Long bookingId);

    // Truck management
    List<TruckDto> getAllTrucks();
    TruckDto addTruck(TruckDto dto);
    TruckDto updateTruck(Long id, TruckDto dto);
    void deleteTruck(Long id);

    // Driver management
    List<DriverDto> getAllDrivers();
    DriverDto addDriver(DriverDto dto);
    DriverDto updateDriver(Long id, DriverDto dto);
    void deleteDriver(Long id);

    // Predefined Items
    List<PredefinedItem> getAllItems();
    PredefinedItem addItem(PredefinedItemRequest request);
    PredefinedItem updateItem(Long id, PredefinedItemRequest request);
    void deleteItem(Long id);
}