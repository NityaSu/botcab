package com.botcab.rating;

import com.botcab.common.auth.Role;
import com.botcab.ride.Ride;
import com.botcab.ride.RideStatus;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Persist one 1–5 star rating per ride per role. {@code ride} calls this service;
 * this package never injects {@code RideRepository}.
 */
@Service
public class RatingService {

    private final RatingRepository ratings;

    public RatingService(RatingRepository ratings) {
        this.ratings = ratings;
    }

    @Transactional
    public Rating submit(Ride ride, Role raterRole, int stars) {
        if (ride.getStatus() != RideStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ride is not completed");
        }
        if (raterRole == Role.DRIVER && ride.getDriverId() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No driver on this ride");
        }
        if (ratings.existsByRideIdAndRaterRole(ride.getId(), raterRole)) {
            throw new RatingAlreadyExistsException(ride.getId(), raterRole.name());
        }
        try {
            return ratings.save(new Rating(ride.getId(), raterRole, stars));
        } catch (DataIntegrityViolationException ex) {
            throw new RatingAlreadyExistsException(ride.getId(), raterRole.name());
        }
    }

    public RideRatings snapshot(long rideId) {
        List<Rating> rows = ratings.findByRideId(rideId);
        if (rows.isEmpty()) {
            return RideRatings.none();
        }
        Integer riderStars = null;
        Integer driverStars = null;
        for (Rating row : rows) {
            if (row.getRaterRole() == Role.RIDER) {
                riderStars = row.getStars();
            } else {
                driverStars = row.getStars();
            }
        }
        return new RideRatings(riderStars, driverStars);
    }
}
