package com.shifting.repository;

import com.shifting.model.Truck;
import com.shifting.model.TruckSize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TruckRepository extends JpaRepository<Truck, Long> {

    // Get all active trucks
    List<Truck> findByIsActiveTrue();

    // Get active trucks by size
    List<Truck> findBySizeAndIsActiveTrue(TruckSize size);
}