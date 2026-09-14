package com.botcab.ride;

/**
 * Lifecycle of a single ride. Persisted as STRING, so these names are also
 * the values stored in {@code rides.status}.
 */
public enum RideStatus {

    /** Rider asked for a ride. No driver assigned yet. */
    REQUESTED,

    /** A driver accepted the offer. Nobody is moving yet. */
    MATCHED,

    /** Driver is travelling to the pickup point. */
    DRIVER_EN_ROUTE,

    /** Rider is on board, heading to the dropoff. */
    IN_PROGRESS,

    /** Rider was dropped off. Terminal. */
    COMPLETED,

    /** Ride was called off before completion. Terminal. */
    CANCELLED;

    /** A terminal ride is over: no further transition is legal. */
    public boolean isTerminal() {
        return this == COMPLETED || this == CANCELLED;
    }
}
