package com.botcab.matching;

import java.time.Instant;

/** Pushed over STOMP to {@code /topic/drivers/{driverId}/offers} and {@code /topic/rides/{rideId}}. */
public record OfferMessage(
        String offerId,
        long rideId,
        long driverId,
        double pickupLat,
        double pickupLng,
        double distanceKm,
        Instant expiresAt,
        OfferStatus status,
        String note
) {
}
