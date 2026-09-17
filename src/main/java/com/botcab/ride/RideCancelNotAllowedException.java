package com.botcab.ride;

/** Actor is not allowed to cancel from the ride's current status. Maps to HTTP 409. */
public class RideCancelNotAllowedException extends RuntimeException {

    public RideCancelNotAllowedException(CancelledBy by, RideStatus status) {
        super(by + " cannot cancel a ride in status " + status);
    }
}
