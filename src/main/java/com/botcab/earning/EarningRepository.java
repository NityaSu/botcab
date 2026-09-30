package com.botcab.earning;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EarningRepository extends JpaRepository<DriverEarning, Long> {

    boolean existsByRideId(long rideId);

    Optional<DriverEarning> findByRideId(long rideId);

    List<DriverEarning> findByDriverIdOrderByCreatedAtDesc(long driverId, Pageable pageable);

    List<DriverEarning> findByDriverId(long driverId);
}
