package com.botcab.ride;

import com.botcab.common.Haversine;
import com.botcab.common.auth.AuthPrincipal;
import com.botcab.common.auth.Role;
import com.botcab.driver.DriverService;
import com.botcab.fare.FareService;
import com.botcab.fare.FareView;
import com.botcab.matching.NoDriverAvailableException;
import com.botcab.matching.OfferMessage;
import com.botcab.matching.OfferService;
import com.botcab.payment.PaymentService;
import com.botcab.payment.PaymentView;
import com.botcab.rating.CreateRatingRequest;
import com.botcab.rating.RatingService;
import com.botcab.rating.RideRatings;
import com.botcab.rider.RiderService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

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
    private final FareService fares;
    private final RatingService ratings;
    private final PaymentService payments;
    private final TransactionTemplate tx;

    public RideService(
            RideRepository rides,
            RiderService riders,
            DriverService drivers,
            OfferService offers,
            FareService fares,
            RatingService ratings,
            PaymentService payments,
            PlatformTransactionManager transactionManager) {
        this.rides = rides;
        this.riders = riders;
        this.drivers = drivers;
        this.offers = offers;
        this.fares = fares;
        this.ratings = ratings;
        this.payments = payments;
        this.tx = new TransactionTemplate(transactionManager);
    }

    /** Persist {@code REQUESTED}, then start the STOMP offer loop. Rider id from JWT. */
    public RideResponse book(long riderId, CreateRideRequest request) {
        riders.require(riderId);
        Ride ride;
        try {
            ride = tx.execute(status -> rides.save(new Ride(
                    riderId,
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
        return get(rideId, AuthPrincipal.require());
    }

    /** Load a ride the caller owns (rider or assigned driver), with fare when present. */
    public RideResponse get(long rideId, AuthPrincipal auth) {
        Ride ride = require(rideId);
        assertCanView(ride, auth);
        return toView(ride, null);
    }

    /**
     * Terminal rides for the JWT principal, newest first, with fare snapshots when completed.
     */
    public List<RideResponse> history(AuthPrincipal auth, int limit) {
        int pageSize = Math.clamp(limit, 1, 50);
        Set<RideStatus> terminal = EnumSet.of(RideStatus.COMPLETED, RideStatus.CANCELLED);
        List<Ride> rows = switch (auth.role()) {
            case RIDER -> rides.findByRiderIdAndStatusInOrderByEndedAtDesc(
                    auth.id(), terminal, PageRequest.of(0, pageSize));
            case DRIVER -> rides.findByDriverIdAndStatusInOrderByEndedAtDesc(
                    auth.id(), terminal, PageRequest.of(0, pageSize));
        };
        return rows.stream().map(ride -> toView(ride, null)).toList();
    }

    /** After COMPLETED: this role rates the other party. One rating per ride/role. */
    @Transactional
    public RideResponse rate(long rideId, AuthPrincipal auth, CreateRatingRequest body) {
        Ride ride = require(rideId);
        assertCanView(ride, auth);
        ratings.submit(ride, auth.role(), body.stars());
        return toView(ride, null);
    }

    private RideResponse toView(Ride ride, OfferMessage offer) {
        FareView fare = fares.findByRideId(ride.getId()).map(FareView::from).orElse(null);
        RideRatings snapshot = ratings.snapshot(ride.getId());
        PaymentView payment = payments.findByRideId(ride.getId()).orElse(null);
        return RideResponse.from(ride, offer, fare, snapshot, payment);
    }

    private void assertCanView(Ride ride, AuthPrincipal auth) {
        if (auth.role() == Role.RIDER && ride.getRiderId().equals(auth.id())) {
            return;
        }
        if (auth.role() == Role.DRIVER
                && ride.getDriverId() != null
                && ride.getDriverId().equals(auth.id())) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a party to this ride");
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
    public RideResponse markEnRoute(long rideId) {
        Ride ride = require(rideId);
        ride.markEnRoute();
        return RideResponse.from(rides.save(ride));
    }

    @Transactional
    public RideResponse startTrip(long rideId) {
        Ride ride = require(rideId);
        ride.startTrip(Instant.now());
        return RideResponse.from(rides.save(ride));
    }

    /**
     * {@code IN_PROGRESS → COMPLETED}, persist fare, mock-capture cash, then free driver.
     */
    @Transactional
    public RideResponse complete(long rideId) {
        Ride ride = require(rideId);
        ride.complete(Instant.now());
        rides.save(ride);

        double distanceKm = Haversine.km(
                ride.getPickupLat().doubleValue(),
                ride.getPickupLng().doubleValue(),
                ride.getDropoffLat().doubleValue(),
                ride.getDropoffLng().doubleValue());
        // Driver is still BUSY here, so they count toward demand before release.
        double demandRatio = drivers.demandRatio();
        FareView fare = FareView.from(fares.createForRide(ride.getId(), distanceKm, demandRatio));
        PaymentView payment = payments.captureForRide(ride.getId(), fare.totalCents());

        Long driverId = ride.getDriverId();
        if (driverId != null) {
            drivers.releaseOffer(driverId);
        }
        return RideResponse.from(ride, null, fare, ratings.snapshot(ride.getId()), payment);
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
