package com.botcab.ride;

import com.botcab.fare.FareView;
import com.botcab.matching.OfferMessage;

import java.math.BigDecimal;
import java.time.Instant;

public record RideResponse(
        long id,
        long riderId,
        Long driverId,
        RideStatus status,
        BigDecimal pickupLat,
        BigDecimal pickupLng,
        BigDecimal dropoffLat,
        BigDecimal dropoffLng,
        Instant requestedAt,
        Instant matchedAt,
        Instant startedAt,
        Instant endedAt,
        long version,
        OfferMessage offer,
        FareView fare
) {
    public static RideResponse from(Ride ride) {
        return from(ride, null, null);
    }

    public static RideResponse from(Ride ride, OfferMessage offer) {
        return from(ride, offer, null);
    }

    public static RideResponse from(Ride ride, OfferMessage offer, FareView fare) {
        return new RideResponse(
                ride.getId(),
                ride.getRiderId(),
                ride.getDriverId(),
                ride.getStatus(),
                ride.getPickupLat(),
                ride.getPickupLng(),
                ride.getDropoffLat(),
                ride.getDropoffLng(),
                ride.getRequestedAt(),
                ride.getMatchedAt(),
                ride.getStartedAt(),
                ride.getEndedAt(),
                ride.getVersion(),
                offer,
                fare);
    }
}
