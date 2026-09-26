package com.botcab.ride;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.Optional;

public interface RideRepository extends JpaRepository<Ride, Long> {

    Optional<Ride> findFirstByDriverIdAndStatusIn(Long driverId, Collection<RideStatus> statuses);
}
