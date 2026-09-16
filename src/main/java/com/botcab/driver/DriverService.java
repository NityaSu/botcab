package com.botcab.driver;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DriverService {

    private final DriverRepository drivers;
    private final DriverLocationStore locations;

    public DriverService(DriverRepository drivers, DriverLocationStore locations) {
        this.drivers = drivers;
        this.locations = locations;
    }

    public Driver require(long driverId) {
        return drivers.findById(driverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found: " + driverId));
    }

    @Transactional
    public void pingLocation(long driverId, double lat, double lng) {
        Driver driver = require(driverId);
        if (driver.getStatus() != DriverStatus.AVAILABLE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Driver " + driverId + " is " + driver.getStatus() + ", not AVAILABLE");
        }
        locations.upsert(driverId, lat, lng);
    }

    @Transactional
    public void goAvailable(long driverId) {
        Driver driver = require(driverId);
        driver.goAvailable();
    }

    @Transactional
    public void goOffline(long driverId) {
        Driver driver = require(driverId);
        driver.goOffline();
        locations.remove(driverId);
    }

    /**
     * Claim the driver for an offer window. Keeps the GEO pin so a timeout can
     * reassign without forcing another ping.
     */
    @Transactional
    public boolean tryMarkBusy(long driverId) {
        Driver driver = require(driverId);
        if (driver.getStatus() != DriverStatus.AVAILABLE) {
            return false;
        }
        driver.markBusy();
        return true;
    }

    /** Offer accepted — drop live location until the trip ends. */
    public void clearLiveLocation(long driverId) {
        locations.remove(driverId);
    }

    /** Offer timed out or rejected — free again; GEO pin should still be present. */
    @Transactional
    public void releaseOffer(long driverId) {
        Driver driver = require(driverId);
        driver.goAvailable();
    }

    public List<NearbyDriver> nearby(double lat, double lng, double radiusKm, int limit) {
        return locations.nearby(lat, lng, radiusKm, limit);
    }
}
