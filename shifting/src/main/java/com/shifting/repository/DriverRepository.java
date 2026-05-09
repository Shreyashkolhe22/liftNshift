package com.shifting.repository;

import com.shifting.model.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {

    // Get all active drivers
    List<Driver> findByIsActiveTrue();
}