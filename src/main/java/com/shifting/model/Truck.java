package com.shifting.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trucks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Truck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reg_number", unique = true, nullable = false)
    private String regNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TruckSize size;

    @Column(name = "capacity_kg", nullable = false)
    private Integer capacityKg;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
}