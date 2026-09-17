package com.botcab.ride;

import com.botcab.driver.DriverService;
import com.botcab.matching.NoDriverAvailableException;
import com.botcab.matching.OfferMessage;
import com.botcab.matching.OfferService;
import com.botcab.rider.RiderService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

/**
 * Booking HTTP: create a real {@link Ride} row, start matching, accept → {@code MATCHED},
 * cancel with actor rules. Matching calls this service; this service calls {@link OfferService}.
 * <p>
 * Create commits before the offer window starts so a 15s timeout never races an uncommitted row.
 * No entity graphs here — {@code Ride} holds raw ids only (no N+1 risk from associations).
 */
@Service
public class RideService {

    private final RideRepository rides;
    private final RiderService riders;
    private final DriverService drivers;
    private final OfferService offers;
    private final TransactionTemplate tx;

    public RideService(
            RideRepository rides,
            RiderService riders,
            DriverService drivers,
            OfferService offers,
            PlatformTransactionManager transactionManager) {
        this.rides = rides;
        this.riders = riders;
        this.drivers = drivers;
        this.offers = offers;
        this.tx = new TransactionTemplate(transactionManager);
    }

    /** Persist {@code REQUESTED}, then start the STOMP offer loop. */
    public RideResponse book(CreateRideRequest request) {
        riders.require(request.riderId());
        Ride ride;
        try {
            ride = tx.execute(status -> rides.save(new Ride(
                    request.riderId(),
                    request.pickupLat(),
                    request.pickupLng(),
                    request.dropoffLat(),
                    request.dropoffLng())));
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Rider already has an active ride", ex);
        }
        if (ride == null) {
            throw new IllegalStateException("Failed to persist ride");
        }
        try {
            OfferMessage offer = offers.requestForRide(ride);
            return RideResponse.from(require(ride.getId()), offer);
        } catch (NoDriverAvailableException ex) {
            cancelAsSystem(ride.getId());
            throw ex;
        }
    }

    public RideResponse get(long rideId) {
        return RideResponse.from(require(rideId));
    }

    /**
     * Offer accepted: {@code REQUESTED → MATCHED} with optimistic locking.
     * Called from {@link OfferService} only.
     */
    @Transactional
    public Ride assignDriver(long rideId, long driverId) {
        Ride ride = require(rideId);
        if (ride.getStatus() != RideStatus.REQUESTED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Ride is " + ride.getStatus() + ", expected REQUESTED");
        }
        try {
            ride.assignDriver(driverId, Instant.now());
            return rides.save(ride);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Driver already has an active ride", ex);
        }
    }

    @Transactional
    public RideResponse cancel(long rideId, CancelRideRequest request) {
        Ride ride = require(rideId);
        assertActor(ride, request);
        Long driverId = ride.getDriverId();
        RideStatus before = ride.getStatus();
        ride.cancel(request.cancelledBy(), Instant.now());
        rides.save(ride);

        if (before == RideStatus.REQUESTED) {
            offers.cancelPendingForRide(rideId);
        } else if (driverId != null) {
            drivers.releaseOffer(driverId);
            drivers.clearLiveLocation(driverId);
        }
        return RideResponse.from(ride);
    }

    /** No more candidates — free the rider to book again. */
    public void cancelAsSystem(long rideId) {
        tx.executeWithoutResult(status -> {
            Ride ride = require(rideId);
            if (ride.getStatus().isTerminal()) {
                return;
            }
            Long driverId = ride.getDriverId();
            ride.cancel(CancelledBy.SYSTEM, Instant.now());
            rides.save(ride);
            offers.cancelPendingForRide(rideId);
            if (driverId != null) {
                drivers.releaseOffer(driverId);
                drivers.clearLiveLocation(driverId);
            }
        });
    }

    /** Driver accept/reject against the pending offer for this ride. */
    public OfferMessage acceptOffer(long rideId, long driverId) {
        return offers.acceptForRide(rideId, driverId);
    }

    public OfferMessage rejectOffer(long rideId, long driverId) {
        return offers.rejectForRide(rideId, driverId);
    }

    public Ride require(long rideId) {
        return rides.findById(rideId).orElseThrow(() -> new RideNotFoundException(rideId));
    }

    private void assertActor(Ride ride, CancelRideRequest request) {
        switch (request.cancelledBy()) {
            case RIDER -> {
                if (!ride.getRiderId().equals(request.actorId())) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Actor is not the rider");
                }
            }
            case DRIVER -> {
                if (ride.getDriverId() == null || !ride.getDriverId().equals(request.actorId())) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Actor is not the assigned driver");
                }
            }
            case SYSTEM -> throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "SYSTEM cancel is internal only");
        }
    }
}
