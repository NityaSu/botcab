package com.botcab.ride;

import com.botcab.common.auth.AuthPrincipal;
import com.botcab.common.auth.Role;
import com.botcab.matching.OfferMessage;
import com.botcab.rating.CreateRatingRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    private final RideService rides;

    public RideController(RideService rides) {
        this.rides = rides;
    }

    @PostMapping
    public RideResponse book(@Valid @RequestBody CreateRideRequest body) {
        return rides.book(AuthPrincipal.requireRiderId(), body);
    }

    /** Terminal rides for the current rider or driver, newest first. */
    @GetMapping("/history")
    public List<RideResponse> history(@RequestParam(defaultValue = "20") int limit) {
        return rides.history(AuthPrincipal.require(), limit);
    }

    @GetMapping("/{id:\\d+}")
    public RideResponse get(@PathVariable("id") long id) {
        return rides.get(id, AuthPrincipal.require());
    }

    @PostMapping("/{id}/accept")
    public OfferMessage accept(@PathVariable("id") long id) {
        return rides.acceptOffer(id, AuthPrincipal.requireDriverId());
    }

    @PostMapping("/{id}/reject")
    public OfferMessage reject(@PathVariable("id") long id) {
        return rides.rejectOffer(id, AuthPrincipal.requireDriverId());
    }

    @GetMapping("/{id:\\d+}/cancel-preview")
    public CancellationPreview cancelPreview(@PathVariable("id") long id) {
        return rides.previewCancel(id, AuthPrincipal.require());
    }

    @PostMapping("/{id}/cancel")
    public RideResponse cancel(@PathVariable("id") long id) {
        AuthPrincipal auth = AuthPrincipal.require();
        if (auth.role() == Role.RIDER) {
            return rides.cancel(id, new CancelRideRequest(CancelledBy.RIDER, auth.id()));
        }
        if (auth.role() == Role.DRIVER) {
            return rides.cancel(id, new CancelRideRequest(CancelledBy.DRIVER, auth.id()));
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cancel not allowed");
    }

    @PostMapping("/{id}/en-route")
    public RideResponse enRoute(@PathVariable("id") long id) {
        AuthPrincipal.requireDriverId();
        return rides.markEnRoute(id);
    }

    @PostMapping("/{id}/start")
    public RideResponse start(@PathVariable("id") long id) {
        AuthPrincipal.requireDriverId();
        return rides.startTrip(id);
    }

    @PostMapping("/{id}/complete")
    public RideResponse complete(@PathVariable("id") long id) {
        AuthPrincipal.requireDriverId();
        return rides.complete(id);
    }

    @PostMapping("/{id}/rating")
    public RideResponse rate(@PathVariable("id") long id, @Valid @RequestBody CreateRatingRequest body) {
        return rides.rate(id, AuthPrincipal.require(), body);
    }
}
