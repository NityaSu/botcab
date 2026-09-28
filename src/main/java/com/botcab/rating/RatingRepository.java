package com.botcab.rating;

import com.botcab.common.auth.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    boolean existsByRideIdAndRaterRole(long rideId, Role raterRole);

    List<Rating> findByRideId(long rideId);
}
