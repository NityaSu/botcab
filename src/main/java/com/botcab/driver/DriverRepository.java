package com.botcab.driver;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverRepository extends JpaRepository<Driver, Long> {

    long countByStatus(DriverStatus status);

    Optional<Driver> findByPhone(String phone);

    boolean existsByPhone(String phone);
}
