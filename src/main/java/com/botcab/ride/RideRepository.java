package com.botcab.ride;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RideRepository extends JpaRepository<Ride, Long> {

    Optional<Ride> findFirstByDriverIdAndStatusIn(Long driverId, Collection<RideStatus> statuses);

    List<Ride> findByRiderIdAndStatusInOrderByEndedAtDesc(
            Long riderId, Collection<RideStatus> statuses, Pageable pageable);

    List<Ride> findByDriverIdAndStatusInOrderByEndedAtDesc(
            Long driverId, Collection<RideStatus> statuses, Pageable pageable);
}
