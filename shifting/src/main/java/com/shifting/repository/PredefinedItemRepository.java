package com.shifting.repository;

import com.shifting.model.PredefinedItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PredefinedItemRepository
        extends JpaRepository<PredefinedItem, Long> {
}
