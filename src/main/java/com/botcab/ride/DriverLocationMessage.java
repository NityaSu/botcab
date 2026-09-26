package com.botcab.ride;

import java.time.Instant;

/** Pushed to {@code /topic/rides/{rideId}} when a busy driver pings during an active trip. */
public record DriverLocationMessage(
        String event,
        long rideId,
        long driverId,
        double lat,
        double lng,
        Instant at
) {
    public static DriverLocationMessage of(long rideId, long driverId, double lat, double lng) {
        return new DriverLocationMessage("location", rideId, driverId, lat, lng, Instant.now());
    }
}
