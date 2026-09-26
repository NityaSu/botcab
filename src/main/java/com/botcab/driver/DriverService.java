package com.botcab.driver;

import com.botcab.ride.LiveLocationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DriverService {

    private final DriverRepository drivers;
    private final DriverLocationStore locations;
    private final LiveLocationService liveLocation;

    public DriverService(
            DriverRepository drivers,
            DriverLocationStore locations,
            LiveLocationService liveLocation) {
        this.drivers = drivers;
        this.locations = locations;
        this.liveLocation = liveLocation;
    }

    public Driver require(long driverId) {
        return drivers.findById(driverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found: " + driverId));
    }

    /**
     * Upsert Redis GEO. Available drivers are matchable; busy drivers on an active
     * ride also stream lat/lng to {@code /topic/rides/{id}}.
     */
    @Transactional
    public void pingLocation(long driverId, double lat, double lng) {
        Driver driver = require(driverId);
        DriverStatus status = driver.getStatus();
        if (status != DriverStatus.AVAILABLE && status != DriverStatus.BUSY) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Driver " + driverId + " is " + status + ", cannot ping");
        }
        locations.upsert(driverId, lat, lng);
        if (status == DriverStatus.BUSY) {
            liveLocation.broadcastIfOnTrip(driverId, lat, lng);
        }
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

    /** Drop GEO pin (cancel / go offline). Kept through accept so the trip can stream. */
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

    /**
     * Busy drivers ÷ available drivers. Used for surge at fare time.
     * No free drivers while some are busy → max band (2.5). Idle fleet → 1.0.
     */
    public double demandRatio() {
        long available = drivers.countByStatus(DriverStatus.AVAILABLE);
        long busy = drivers.countByStatus(DriverStatus.BUSY);
        if (available == 0) {
            return busy == 0 ? 1.0 : 2.5;
        }
        return (double) busy / (double) available;
    }
}
