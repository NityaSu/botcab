package com.botcab.matching;

/**
 * Mutex on a driver so two matchers cannot pick the same person.
 * Lease expires so a crashed matcher does not lock the driver forever.
 */
public interface DriverLock {

    /**
     * @return true if this caller owns the driver for the lease duration
     */
    boolean tryAcquire(long driverId);
}
