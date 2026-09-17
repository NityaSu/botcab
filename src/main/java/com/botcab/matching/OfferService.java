package com.botcab.matching;

import com.botcab.driver.DriverService;
import com.botcab.ride.Ride;
import com.botcab.ride.RideService;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

/**
 * Match a nearby driver for a real {@link Ride}, push a STOMP offer, wait
 * {@link #ACCEPT_SECONDS}s. Timeout or reject frees the driver and tries the next one.
 * Accept calls {@link RideService#assignDriver} ({@code REQUESTED → MATCHED}).
 */
@Service
public class OfferService {

    static final long ACCEPT_SECONDS = 15;
    static final int MAX_REASSIGNS = 5;

    private final MatchingService matching;
    private final DriverService drivers;
    private final RideService rides;
    private final SimpMessagingTemplate messaging;

    private final Map<String, LiveOffer> offers = new ConcurrentHashMap<>();
    /** rideId → current pending offerId */
    private final Map<Long, String> pendingByRide = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "offer-timeout");
        t.setDaemon(true);
        return t;
    });

    public OfferService(
            MatchingService matching,
            DriverService drivers,
            @Lazy RideService rides,
            SimpMessagingTemplate messaging) {
        this.matching = matching;
        this.drivers = drivers;
        this.rides = rides;
        this.messaging = messaging;
    }

    public OfferMessage requestForRide(Ride ride) {
        return assign(
                ride.getId(),
                ride.getPickupLat().doubleValue(),
                ride.getPickupLng().doubleValue(),
                Set.of(),
                0);
    }

    public OfferMessage accept(String offerId, long driverId) {
        LiveOffer live = requirePending(offerId, driverId);
        return acceptLive(live);
    }

    public OfferMessage acceptForRide(long rideId, long driverId) {
        LiveOffer live = requirePendingForRide(rideId, driverId);
        return acceptLive(live);
    }

    public OfferMessage reject(String offerId, long driverId) {
        LiveOffer live = requirePending(offerId, driverId);
        return rejectLive(live);
    }

    public OfferMessage rejectForRide(long rideId, long driverId) {
        LiveOffer live = requirePendingForRide(rideId, driverId);
        return rejectLive(live);
    }

    /** Drop any in-flight offer for this ride (rider/system cancel while REQUESTED). */
    public void cancelPendingForRide(long rideId) {
        String offerId = pendingByRide.remove(rideId);
        if (offerId == null) {
            return;
        }
        LiveOffer live = offers.remove(offerId);
        if (live == null || live.status != OfferStatus.PENDING) {
            return;
        }
        live.cancelTimeout();
        live.status = OfferStatus.REJECTED;
        push(live.toMessage("cancelled"));
        drivers.releaseOffer(live.driverId);
    }

    private OfferMessage acceptLive(LiveOffer live) {
        live.cancelTimeout();
        rides.assignDriver(live.rideId, live.driverId);
        live.status = OfferStatus.ACCEPTED;
        drivers.clearLiveLocation(live.driverId);
        OfferMessage msg = live.toMessage("accepted");
        push(msg);
        offers.remove(live.offerId);
        pendingByRide.remove(live.rideId, live.offerId);
        return msg;
    }

    private OfferMessage rejectLive(LiveOffer live) {
        live.cancelTimeout();
        live.status = OfferStatus.REJECTED;
        push(live.toMessage("rejected"));
        offers.remove(live.offerId);
        pendingByRide.remove(live.rideId, live.offerId);
        drivers.releaseOffer(live.driverId);
        return reassignAfter(live);
    }

    private OfferMessage assign(long rideId, double pickupLat, double pickupLng, Set<Long> exclude, int attempt) {
        if (attempt >= MAX_REASSIGNS) {
            throw new NoDriverAvailableException(pickupLat, pickupLng);
        }
        MatchResult match = matching.match(pickupLat, pickupLng, exclude);
        String offerId = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plusSeconds(ACCEPT_SECONDS);
        LiveOffer live = new LiveOffer(
                offerId,
                rideId,
                match.driverId(),
                pickupLat,
                pickupLng,
                match.distanceKm(),
                expiresAt,
                new java.util.HashSet<>(exclude),
                attempt);
        live.exclude.add(match.driverId());

        ScheduledFuture<?> timeout = scheduler.schedule(
                () -> onTimeout(offerId), ACCEPT_SECONDS, TimeUnit.SECONDS);
        live.timeoutTask = timeout;
        offers.put(offerId, live);
        pendingByRide.put(rideId, offerId);

        OfferMessage msg = live.toMessage("offer");
        push(msg);
        return msg;
    }

    private void onTimeout(String offerId) {
        LiveOffer live = offers.remove(offerId);
        if (live == null || live.status != OfferStatus.PENDING) {
            return;
        }
        pendingByRide.remove(live.rideId, offerId);
        live.status = OfferStatus.EXPIRED;
        push(live.toMessage("expired"));
        drivers.releaseOffer(live.driverId);
        try {
            assign(live.rideId, live.pickupLat, live.pickupLng, live.exclude, live.attempt + 1);
        } catch (NoDriverAvailableException ex) {
            rides.cancelAsSystem(live.rideId);
            messaging.convertAndSend(
                    "/topic/rides/" + live.rideId,
                    Map.of("error", ex.getMessage(), "event", "no_driver", "rideId", live.rideId));
        }
    }

    private OfferMessage reassignAfter(LiveOffer previous) {
        try {
            return assign(
                    previous.rideId,
                    previous.pickupLat,
                    previous.pickupLng,
                    previous.exclude,
                    previous.attempt + 1);
        } catch (NoDriverAvailableException ex) {
            rides.cancelAsSystem(previous.rideId);
            throw ex;
        }
    }

    private LiveOffer requirePending(String offerId, long driverId) {
        LiveOffer live = offers.get(offerId);
        if (live == null) {
            throw new OfferNotFoundException(offerId);
        }
        return requireOwnedPending(live, driverId);
    }

    private LiveOffer requirePendingForRide(long rideId, long driverId) {
        String offerId = pendingByRide.get(rideId);
        if (offerId == null) {
            throw new OfferNotFoundException("ride:" + rideId);
        }
        LiveOffer live = offers.get(offerId);
        if (live == null) {
            throw new OfferNotFoundException(offerId);
        }
        return requireOwnedPending(live, driverId);
    }

    private LiveOffer requireOwnedPending(LiveOffer live, long driverId) {
        if (live.driverId != driverId) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Offer belongs to another driver");
        }
        if (live.status != OfferStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Offer is " + live.status);
        }
        return live;
    }

    private void push(OfferMessage msg) {
        messaging.convertAndSend("/topic/drivers/" + msg.driverId() + "/offers", msg);
        messaging.convertAndSend("/topic/rides/" + msg.rideId(), msg);
    }

    private static final class LiveOffer {
        final String offerId;
        final long rideId;
        final long driverId;
        final double pickupLat;
        final double pickupLng;
        final double distanceKm;
        final Instant expiresAt;
        final Set<Long> exclude;
        final int attempt;
        volatile OfferStatus status = OfferStatus.PENDING;
        volatile ScheduledFuture<?> timeoutTask;

        LiveOffer(
                String offerId,
                long rideId,
                long driverId,
                double pickupLat,
                double pickupLng,
                double distanceKm,
                Instant expiresAt,
                Set<Long> exclude,
                int attempt) {
            this.offerId = offerId;
            this.rideId = rideId;
            this.driverId = driverId;
            this.pickupLat = pickupLat;
            this.pickupLng = pickupLng;
            this.distanceKm = distanceKm;
            this.expiresAt = expiresAt;
            this.exclude = exclude;
            this.attempt = attempt;
        }

        void cancelTimeout() {
            ScheduledFuture<?> task = timeoutTask;
            if (task != null) {
                task.cancel(false);
            }
        }

        OfferMessage toMessage(String note) {
            return new OfferMessage(
                    offerId, rideId, driverId, pickupLat, pickupLng, distanceKm, expiresAt, status, note);
        }
    }
}
