package com.botcab.fare;

/**
 * Thrown when a second fare is requested for the same ride.
 * Maps to HTTP 409.
 */
public class FareAlreadyExistsException extends RuntimeException {

    public FareAlreadyExistsException(long rideId) {
        super("Fare already exists for ride " + rideId);
    }
}
