package com.botcab.driver;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverRepository extends JpaRepository<Driver, Long> {

    long countByStatus(DriverStatus status);
}
