package com.botcab.ride;

import com.botcab.fare.FareView;
import com.botcab.matching.OfferMessage;
import com.botcab.payment.PaymentView;
import com.botcab.rating.RideRatings;

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
        FareView fare,
        RideRatings ratings,
        PaymentView payment
) {
    public static RideResponse from(Ride ride) {
        return from(ride, null, null, null, null);
    }

    public static RideResponse from(Ride ride, OfferMessage offer) {
        return from(ride, offer, null, null, null);
    }

    public static RideResponse from(Ride ride, OfferMessage offer, FareView fare) {
        return from(ride, offer, fare, null, null);
    }

    public static RideResponse from(Ride ride, OfferMessage offer, FareView fare, RideRatings ratings) {
        return from(ride, offer, fare, ratings, null);
    }

    public static RideResponse from(
            Ride ride, OfferMessage offer, FareView fare, RideRatings ratings, PaymentView payment) {
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
                fare,
                ratings,
                payment);
    }
}
