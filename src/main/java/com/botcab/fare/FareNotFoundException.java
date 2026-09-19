package com.botcab.fare;

/** Thrown when no fare row exists for a ride. Maps to HTTP 404. */
public class FareNotFoundException extends RuntimeException {

    public FareNotFoundException(long rideId) {
        super("Fare not found for ride " + rideId);
    }
}
