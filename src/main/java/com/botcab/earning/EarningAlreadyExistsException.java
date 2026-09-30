package com.botcab.earning;

/** One ledger row per ride. Maps to HTTP 409. */
public class EarningAlreadyExistsException extends RuntimeException {

    public EarningAlreadyExistsException(long rideId) {
        super("Earning already recorded for ride " + rideId);
    }
}
