package com.shifting.service;

import com.shifting.model.BookingStatus;
import com.shifting.model.PredefinedItem;
import com.shifting.payload.dto.*;
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

    // Predefined Items
    List<PredefinedItem> getAllItems();
    PredefinedItem addItem(PredefinedItemRequest request);
    PredefinedItem updateItem(Long id, PredefinedItemRequest request);
    void deleteItem(Long id);
}