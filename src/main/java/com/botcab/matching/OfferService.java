package com.botcab.matching;

import com.botcab.driver.DriverService;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

/**
 * Match a nearby driver, push a STOMP offer, wait {@link #ACCEPT_SECONDS}s.
 * Timeout or reject frees the driver and tries the next one (reassignment).
 * <p>
 * No {@code Ride} row yet — that is Phase 4 {@code POST /rides}.
 */
@Service
public class OfferService {

    static final long ACCEPT_SECONDS = 15;
    static final int MAX_REASSIGNS = 5;

    private final MatchingService matching;
    private final DriverService drivers;
    private final SimpMessagingTemplate messaging;

    private final Map<String, LiveOffer> offers = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "offer-timeout");
        t.setDaemon(true);
        return t;
    });

    public OfferService(MatchingService matching, DriverService drivers, SimpMessagingTemplate messaging) {
        this.matching = matching;
        this.drivers = drivers;
        this.messaging = messaging;
    }

    public OfferMessage request(double pickupLat, double pickupLng) {
        return assign(pickupLat, pickupLng, Set.of(), 0);
    }

    public OfferMessage accept(String offerId, long driverId) {
        LiveOffer live = requirePending(offerId, driverId);
        live.cancelTimeout();
        live.status = OfferStatus.ACCEPTED;
        drivers.clearLiveLocation(driverId);
        OfferMessage msg = live.toMessage("accepted");
        push(msg);
        offers.remove(offerId);
        return msg;
    }

    public OfferMessage reject(String offerId, long driverId) {
        LiveOffer live = requirePending(offerId, driverId);
        live.cancelTimeout();
        live.status = OfferStatus.REJECTED;
        push(live.toMessage("rejected"));
        offers.remove(offerId);
        drivers.releaseOffer(driverId);
        return reassignAfter(live);
    }

    private OfferMessage assign(double pickupLat, double pickupLng, Set<Long> exclude, int attempt) {
        if (attempt >= MAX_REASSIGNS) {
            throw new NoDriverAvailableException(pickupLat, pickupLng);
        }
        MatchResult match = matching.match(pickupLat, pickupLng, exclude);
        String offerId = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plusSeconds(ACCEPT_SECONDS);
        LiveOffer live = new LiveOffer(
                offerId,
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

        OfferMessage msg = live.toMessage("offer");
        push(msg);
        return msg;
    }

    private void onTimeout(String offerId) {
        LiveOffer live = offers.remove(offerId);
        if (live == null || live.status != OfferStatus.PENDING) {
            return;
        }
        live.status = OfferStatus.EXPIRED;
        push(live.toMessage("expired"));
        drivers.releaseOffer(live.driverId);
        try {
            assign(live.pickupLat, live.pickupLng, live.exclude, live.attempt + 1);
        } catch (NoDriverAvailableException ex) {
            messaging.convertAndSend(
                    "/topic/pickups/" + coordKey(live.pickupLat, live.pickupLng),
                    Map.of("error", ex.getMessage(), "event", "no_driver"));
        }
    }

    private OfferMessage reassignAfter(LiveOffer previous) {
        try {
            return assign(previous.pickupLat, previous.pickupLng, previous.exclude, previous.attempt + 1);
        } catch (NoDriverAvailableException ex) {
            throw ex;
        }
    }

    private LiveOffer requirePending(String offerId, long driverId) {
        LiveOffer live = offers.get(offerId);
        if (live == null) {
            throw new OfferNotFoundException(offerId);
        }
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
    }

    private static String coordKey(double lat, double lng) {
        return lat + "," + lng;
    }

    private static final class LiveOffer {
        final String offerId;
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
                long driverId,
                double pickupLat,
                double pickupLng,
                double distanceKm,
                Instant expiresAt,
                Set<Long> exclude,
                int attempt) {
            this.offerId = offerId;
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
                    offerId, driverId, pickupLat, pickupLng, distanceKm, expiresAt, status, note);
        }
    }
}
