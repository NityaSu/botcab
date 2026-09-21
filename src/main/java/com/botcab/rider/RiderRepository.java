package com.botcab.rider;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RiderRepository extends JpaRepository<Rider, Long> {

    Optional<Rider> findByPhone(String phone);

    boolean existsByPhone(String phone);
}
