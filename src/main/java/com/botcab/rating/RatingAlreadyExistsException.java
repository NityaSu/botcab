package com.botcab.rating;

/** Thrown when the same role rates the same ride twice. HTTP 409. */
public class RatingAlreadyExistsException extends RuntimeException {

    public RatingAlreadyExistsException(long rideId, String role) {
        super("Already rated ride " + rideId + " as " + role);
    }
}
