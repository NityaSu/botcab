package com.botcab.ride;

/**
 * Thrown when a ride is asked to move between statuses that the state machine
 * does not allow. Becomes HTTP 409 once controllers exist (Phase 4).
 */
public class IllegalRideTransitionException extends RuntimeException {

    private final RideStatus from;
    private final RideStatus to;

    public IllegalRideTransitionException(RideStatus from, RideStatus to) {
        super("Illegal ride transition: " + from + " -> " + to);
        this.from = from;
        this.to = to;
    }

    public RideStatus getFrom() {
        return from;
    }

    public RideStatus getTo() {
        return to;
    }
}
