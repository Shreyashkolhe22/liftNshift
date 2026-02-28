package com.shifting.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "predefined_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredefinedItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private BigDecimal price;
}
