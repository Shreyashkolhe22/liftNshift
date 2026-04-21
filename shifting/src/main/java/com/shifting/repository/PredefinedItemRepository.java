package com.shifting.repository;

import com.shifting.model.PredefinedItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PredefinedItemRepository
        extends JpaRepository<PredefinedItem, Long> {
    Optional<PredefinedItem> findByName(String name);
}