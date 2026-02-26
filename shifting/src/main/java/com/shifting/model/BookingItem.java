package com.shifting.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class BookingItem {
    @Id
    private long itemId;
    @ManyToOne
    private Booking booking;

    private String itemName;

    private int quantity;

    private double price;
}
