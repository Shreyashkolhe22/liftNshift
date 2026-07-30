package com.shifting.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "booking_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔹 Relation with Booking
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    // 🔹 Relation with PredefinedItem (nullable for custom item)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "predefined_item_id")
    private PredefinedItem predefinedItem;

    // 🔹 Custom item name (nullable for predefined)
    private String customName;

    // 🔹 Quantity
    @Column(nullable = false)
    private Integer quantity;

    // 🔹 Size (used for custom items)
    @Enumerated(EnumType.STRING)
    private ItemSize size;

    // 🔹 Final calculated price
    @Column(nullable = false)
    private BigDecimal price;
}