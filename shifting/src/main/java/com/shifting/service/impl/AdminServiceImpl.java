package com.shifting.service.impl;

import com.shifting.exception.ApiException;
import com.shifting.model.*;
import com.shifting.payload.dto.*;
import com.shifting.payload.request.AssignTruckRequest;
import com.shifting.payload.request.PredefinedItemRequest;
import com.shifting.repository.*;
import com.shifting.service.AdminService;
import com.shifting.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository           userRepository;
    private final BookingRepository        bookingRepository;
    private final PredefinedItemRepository predefinedItemRepository;
    private final PaymentRepository        paymentRepository;
    private final BookingItemRepository    bookingItemRepository;
    private final BookingSlotRepository    bookingSlotRepository;  // NEW
    private final TruckRepository          truckRepository;        // NEW
    private final DriverRepository         driverRepository;       // NEW
    private final EmailService             emailService;           // NEW

    // ── DASHBOARD ─────────────────────────────────────────────────
    @Override
    public AdminDashboardDto getDashboardStats() {
        List<Booking> allBookings = bookingRepository.findAll();

        long pending    = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.PENDING).count();
        long confirmed  = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.CONFIRMED).count();
        long inProgress = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.IN_PROGRESS).count();
        long completed  = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count();
        long cancelled  = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();

        BigDecimal revenue = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .map(Booking::getTotalAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return AdminDashboardDto.builder()
                .totalUsers(userRepository.count())
                .totalBookings(allBookings.size())
                .pendingBookings(pending)
                .confirmedBookings(confirmed)
                .inProgressBookings(inProgress)
                .completedBookings(completed)
                .cancelledBookings(cancelled)
                .totalRevenue(revenue)
                .totalPredefinedItems(predefinedItemRepository.count())
                .totalPayments(paymentRepository.count())
                .build();
    }

    // ── USERS ──────────────────────────────────────────────────────
    @Override
    public List<AdminUserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> AdminUserDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .role(user.getRole())
                        .totalBookings(bookingRepository.findByUserId(user.getId()).size())
                        .totalPayments(paymentRepository.findByBookingUserId(user.getId()).size())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public AdminUserDto getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found: " + userId));
        return AdminUserDto.builder()
                .id(user.getId()).name(user.getName())
                .email(user.getEmail()).phone(user.getPhone())
                .role(user.getRole())
                .totalBookings(bookingRepository.findByUserId(userId).size())
                .totalPayments(paymentRepository.findByBookingUserId(userId).size())
                .build();
    }

    @Override
    public AdminUserDto makeAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found: " + userId));
        user.setRole(Role.ADMIN);
        userRepository.save(user);
        return getUserById(userId);
    }

    @Override
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found: " + userId));
        if (user.getRole() == Role.ADMIN)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot delete an admin user");
        userRepository.delete(user);
    }

    // ── BOOKINGS ───────────────────────────────────────────────────
    @Override
    public List<AdminBookingDto> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::toAdminBookingDto)
                .collect(Collectors.toList());
    }

    @Override
    public AdminBookingDto getBookingById(Long bookingId) {
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found: " + bookingId));
        return toAdminBookingDto(b);
    }

    @Override
    public AdminBookingDto updateBookingStatus(Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found: " + bookingId));
        booking.setStatus(status);
        bookingRepository.save(booking);
        return toAdminBookingDto(booking);
    }

    @Override
    public void deleteBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found: " + bookingId));
        bookingRepository.delete(booking);
    }

    // ── ASSIGN TRUCK + DRIVER ──────────────────────────────────────
    @Override
    public AssignmentResponseDto assignTruckAndDriver(
            Long bookingId, AssignTruckRequest request) {

        // 1. Get booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Booking not found: " + bookingId));

        // 2. Booking must have a scheduled date + slot
        if (booking.getScheduledDate() == null || booking.getTimeSlot() == null)
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Booking does not have a scheduled date or time slot");

        // 3. Check if already assigned
        if (bookingSlotRepository.findByBookingId(bookingId).isPresent())
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "Truck and driver already assigned to this booking");

        // 4. Get truck
        Truck truck = truckRepository.findById(request.getTruckId())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Truck not found: " + request.getTruckId()));

        // 5. Check truck not already booked for this date+slot
        boolean truckBusy = bookingSlotRepository
                .existsByTruckIdAndSlotDateAndTimeSlot(
                        truck.getId(),
                        booking.getScheduledDate(),
                        booking.getTimeSlot()
                );
        if (truckBusy)
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "Truck " + truck.getRegNumber()
                            + " is already assigned on "
                            + booking.getScheduledDate()
                            + " " + booking.getTimeSlot());

        // 6. Get driver
        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Driver not found: " + request.getDriverId()));

        // 7. Check driver not already booked for this date+slot
        boolean driverBusy = bookingSlotRepository
                .existsByDriverIdAndSlotDateAndTimeSlot(
                        driver.getId(),
                        booking.getScheduledDate(),
                        booking.getTimeSlot()
                );
        if (driverBusy)
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "Driver " + driver.getName()
                            + " is already assigned on "
                            + booking.getScheduledDate()
                            + " " + booking.getTimeSlot());

        // 8. Save booking slot
        BookingSlot slot = BookingSlot.builder()
                .booking(booking)
                .truck(truck)
                .driver(driver)
                .slotDate(booking.getScheduledDate())
                .timeSlot(booking.getTimeSlot())
                .build();
        bookingSlotRepository.save(slot);

        // 9. Update booking status → CONFIRMED
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        // 10. Send email to user with truck + driver details
        emailService.sendBookingConfirmedWithDriverEmail(
                booking.getUser(), booking, truck, driver
        );

        // 11. Build response
        String timing = booking.getTimeSlot() == TimeSlot.MORNING
                ? "8 AM – 1 PM" : "2 PM – 7 PM";

        return AssignmentResponseDto.builder()
                .bookingId(booking.getId())
                .userName(booking.getUser().getName())
                .userEmail(booking.getUser().getEmail())
                .userPhone(booking.getUser().getPhone())
                .pickupAddress(booking.getPickupAddress())
                .dropAddress(booking.getDropAddress())
                .distanceKm(booking.getDistanceKm())
                .totalAmount(booking.getTotalAmount())
                .status(BookingStatus.CONFIRMED)
                .scheduledDate(booking.getScheduledDate())
                .timeSlot(booking.getTimeSlot())
                .timeSlotTiming(timing)
                .truckId(truck.getId())
                .truckRegNumber(truck.getRegNumber())
                .truckSize(truck.getSize().name())
                .driverId(driver.getId())
                .driverName(driver.getName())
                .driverPhone(driver.getPhone())
                .build();
    }

    // ── GET AVAILABLE TRUCKS for a booking's date+slot ─────────────
    @Override
    public List<TruckDto> getAvailableTrucks(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Booking not found: " + bookingId));

        if (booking.getScheduledDate() == null || booking.getTimeSlot() == null)
            throw new ApiException(
                    HttpStatus.BAD_REQUEST, "Booking has no scheduled date/slot");

        // Get all active trucks
        List<Truck> allTrucks = truckRepository.findByIsActiveTrue();

        // Filter out trucks already booked for this date+slot
        return allTrucks.stream()
                .filter(t -> !bookingSlotRepository
                        .existsByTruckIdAndSlotDateAndTimeSlot(
                                t.getId(),
                                booking.getScheduledDate(),
                                booking.getTimeSlot()
                        ))
                .map(this::toTruckDto)
                .collect(Collectors.toList());
    }

    // ── GET AVAILABLE DRIVERS for a booking's date+slot ────────────
    @Override
    public List<DriverDto> getAvailableDrivers(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Booking not found: " + bookingId));

        if (booking.getScheduledDate() == null || booking.getTimeSlot() == null)
            throw new ApiException(
                    HttpStatus.BAD_REQUEST, "Booking has no scheduled date/slot");

        // Get all active drivers
        List<Driver> allDrivers = driverRepository.findByIsActiveTrue();

        // Filter out drivers already booked for this date+slot
        return allDrivers.stream()
                .filter(d -> !bookingSlotRepository
                        .existsByDriverIdAndSlotDateAndTimeSlot(
                                d.getId(),
                                booking.getScheduledDate(),
                                booking.getTimeSlot()
                        ))
                .map(this::toDriverDto)
                .collect(Collectors.toList());
    }

    // ── TRUCK MANAGEMENT ───────────────────────────────────────────
    @Override
    public List<TruckDto> getAllTrucks() {
        return truckRepository.findAll().stream()
                .map(this::toTruckDto)
                .collect(Collectors.toList());
    }

    @Override
    public TruckDto addTruck(TruckDto dto) {
        Truck truck = Truck.builder()
                .regNumber(dto.getRegNumber())
                .size(dto.getSize())
                .capacityKg(dto.getCapacityKg())
                .isActive(true)
                .build();
        return toTruckDto(truckRepository.save(truck));
    }

    @Override
    public TruckDto updateTruck(Long id, TruckDto dto) {
        Truck truck = truckRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Truck not found: " + id));
        truck.setRegNumber(dto.getRegNumber());
        truck.setSize(dto.getSize());
        truck.setCapacityKg(dto.getCapacityKg());
        truck.setIsActive(dto.getIsActive());
        return toTruckDto(truckRepository.save(truck));
    }

    @Override
    public void deleteTruck(Long id) {
        Truck truck = truckRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Truck not found: " + id));
        truckRepository.delete(truck);
    }

    // ── DRIVER MANAGEMENT ──────────────────────────────────────────
    @Override
    public List<DriverDto> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(this::toDriverDto)
                .collect(Collectors.toList());
    }

    @Override
    public DriverDto addDriver(DriverDto dto) {
        Driver driver = Driver.builder()
                .name(dto.getName())
                .phone(dto.getPhone())
                .licenseNo(dto.getLicenseNo())
                .isActive(true)
                .build();
        return toDriverDto(driverRepository.save(driver));
    }

    @Override
    public DriverDto updateDriver(Long id, DriverDto dto) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Driver not found: " + id));
        driver.setName(dto.getName());
        driver.setPhone(dto.getPhone());
        driver.setLicenseNo(dto.getLicenseNo());
        driver.setIsActive(dto.getIsActive());
        return toDriverDto(driverRepository.save(driver));
    }

    @Override
    public void deleteDriver(Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Driver not found: " + id));
        driverRepository.delete(driver);
    }

    // ── PREDEFINED ITEMS ───────────────────────────────────────────
    @Override
    public List<PredefinedItem> getAllItems() {
        return predefinedItemRepository.findAll();
    }

    @Override
    public PredefinedItem addItem(PredefinedItemRequest request) {
        if (predefinedItemRepository.findByName(request.getName()).isPresent())
            throw new ApiException(HttpStatus.CONFLICT, "Item already exists: " + request.getName());
        PredefinedItem item = PredefinedItem.builder()
                .name(request.getName()).price(request.getPrice()).build();
        return predefinedItemRepository.save(item);
    }

    @Override
    public PredefinedItem updateItem(Long id, PredefinedItemRequest request) {
        PredefinedItem item = predefinedItemRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Item not found: " + id));
        item.setName(request.getName());
        item.setPrice(request.getPrice());
        return predefinedItemRepository.save(item);
    }

    @Override
    public void deleteItem(Long id) {
        PredefinedItem item = predefinedItemRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Item not found: " + id));
        predefinedItemRepository.delete(item);
    }

    // ── HELPERS ────────────────────────────────────────────────────
    private TruckDto toTruckDto(Truck t) {
        return TruckDto.builder()
                .id(t.getId()).regNumber(t.getRegNumber())
                .size(t.getSize()).capacityKg(t.getCapacityKg())
                .isActive(t.getIsActive()).build();
    }

    private DriverDto toDriverDto(Driver d) {
        return DriverDto.builder()
                .id(d.getId()).name(d.getName())
                .phone(d.getPhone()).licenseNo(d.getLicenseNo())
                .isActive(d.getIsActive()).build();
    }

    private AdminBookingDto toAdminBookingDto(Booking b) {
        List<BookingItemDto> items = b.getItems() == null ? List.of() :
                b.getItems().stream().map(i -> BookingItemDto.builder()
                                               .id(i.getId())
                                               .predefinedItemId(i.getPredefinedItem() != null ? i.getPredefinedItem().getId() : null)
                                               .predefinedItemName(i.getPredefinedItem() != null ? i.getPredefinedItem().getName() : null)
                                               .customName(i.getCustomName())
                                               .quantity(i.getQuantity())
                                               .size(i.getSize() != null ? i.getSize().name() : null)
                                               .price(i.getPrice())
                                               .build())
                .collect(Collectors.toList());

        // Slot info
        String timing   = null;
        Long truckId    = null; String truckReg = null; String truckSize = null;
        Long driverId   = null; String driverName = null; String driverPhone = null;
        boolean assigned = false;

        if (b.getTimeSlot() != null)
            timing = b.getTimeSlot() == TimeSlot.MORNING ? "8 AM – 1 PM" : "2 PM – 7 PM";

        if (b.getBookingSlot() != null) {
            assigned    = true;
            truckId     = b.getBookingSlot().getTruck().getId();
            truckReg    = b.getBookingSlot().getTruck().getRegNumber();
            truckSize   = b.getBookingSlot().getTruck().getSize().name();
            driverId    = b.getBookingSlot().getDriver().getId();
            driverName  = b.getBookingSlot().getDriver().getName();
            driverPhone = b.getBookingSlot().getDriver().getPhone();
        }

        return AdminBookingDto.builder()
                .id(b.getId())
                .userId(b.getUser().getId())
                .userName(b.getUser().getName())
                .userEmail(b.getUser().getEmail())
                .userPhone(b.getUser().getPhone())
                .pickupAddress(b.getPickupAddress())
                .dropAddress(b.getDropAddress())
                .distanceKm(b.getDistanceKm())
                .totalAmount(b.getTotalAmount())
                .status(b.getStatus())
                .createdAt(b.getCreatedAt())
                .items(items)
                .scheduledDate(b.getScheduledDate())
                .timeSlot(b.getTimeSlot())
                .timeSlotTiming(timing)
                .truckId(truckId).truckRegNumber(truckReg).truckSize(truckSize)
                .driverId(driverId).driverName(driverName).driverPhone(driverPhone)
                .assigned(assigned)
                .build();
    }
}