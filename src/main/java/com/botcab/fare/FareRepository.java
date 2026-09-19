package com.botcab.fare;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FareRepository extends JpaRepository<Fare, Long> {

    Optional<Fare> findByRideId(long rideId);

    boolean existsByRideId(long rideId);
}
