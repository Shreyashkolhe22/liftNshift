package com.shifting.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "booking_slots",
        uniqueConstraints = {
                // One truck cannot have two bookings on same date+slot
                @UniqueConstraint(
                        name  = "uq_truck_slot",
                        columnNames = {"truck_id", "slot_date", "time_slot"}
                ),
                // One driver cannot have two bookings on same date+slot
                @UniqueConstraint(
                        name  = "uq_driver_slot",
                        columnNames = {"driver_id", "slot_date", "time_slot"}
                )
        }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One booking has one slot
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    // Which truck is assigned
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "truck_id", nullable = false)
    private Truck truck;

    // Which driver is assigned
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    // Moving date
    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    // MORNING or EVENING
    @Enumerated(EnumType.STRING)
    @Column(name = "time_slot", nullable = false)
    private TimeSlot timeSlot;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}