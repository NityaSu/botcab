package com.botcab.ride;

import com.botcab.common.auth.RiderPrincipal;
import com.botcab.matching.OfferMessage;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    private final RideService rides;

    public RideController(RideService rides) {
        this.rides = rides;
    }

    /** Create a {@code REQUESTED} ride — rider id from JWT. */
    @PostMapping
    public RideResponse book(@Valid @RequestBody CreateRideRequest body) {
        return rides.book(RiderPrincipal.requireRiderId(), body);
    }

    @GetMapping("/{id}")
    public RideResponse get(@PathVariable("id") long id) {
        return rides.get(id);
    }

    @PostMapping("/{id}/accept")
    public OfferMessage accept(
            @PathVariable("id") long id, @Valid @RequestBody RideActionRequest body) {
        return rides.acceptOffer(id, body.driverId());
    }

    @PostMapping("/{id}/reject")
    public OfferMessage reject(
            @PathVariable("id") long id, @Valid @RequestBody RideActionRequest body) {
        return rides.rejectOffer(id, body.driverId());
    }

    /**
     * Rider cancel uses JWT (ignores body actor). Driver/system cancel still send
     * {@link CancelRideRequest} until driver auth (Phase 10).
     */
    @PostMapping("/{id}/cancel")
    public RideResponse cancel(
            @PathVariable("id") long id, @RequestBody(required = false) CancelRideRequest body) {
        var rider = RiderPrincipal.current();
        if (rider.isPresent()) {
            return rides.cancel(id, new CancelRideRequest(CancelledBy.RIDER, rider.get().riderId()));
        }
        if (body == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        if (body.cancelledBy() == CancelledBy.RIDER) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Rider cancel requires login");
        }
        return rides.cancel(id, body);
    }

    @PostMapping("/{id}/en-route")
    public RideResponse enRoute(@PathVariable("id") long id) {
        return rides.markEnRoute(id);
    }

    @PostMapping("/{id}/start")
    public RideResponse start(@PathVariable("id") long id) {
        return rides.startTrip(id);
    }

    /** Complete trip and persist fare (haversine pickup→dropoff, integer KHR). */
    @PostMapping("/{id}/complete")
    public RideResponse complete(@PathVariable("id") long id) {
        return rides.complete(id);
    }
}
