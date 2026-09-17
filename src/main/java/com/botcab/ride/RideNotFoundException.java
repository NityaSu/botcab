package com.botcab.ride;

/** No ride row for the given id. Maps to HTTP 404. */
public class RideNotFoundException extends RuntimeException {

    public RideNotFoundException(long rideId) {
        super("Ride not found: " + rideId);
    }
}
