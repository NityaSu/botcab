package com.botcab.ride;

import com.botcab.common.auth.AuthPrincipal;
import com.botcab.common.auth.Role;
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

    @PostMapping
    public RideResponse book(@Valid @RequestBody CreateRideRequest body) {
        return rides.book(AuthPrincipal.requireRiderId(), body);
    }

    @GetMapping("/{id}")
    public RideResponse get(@PathVariable("id") long id) {
        return rides.get(id);
    }

    @PostMapping("/{id}/accept")
    public OfferMessage accept(@PathVariable("id") long id) {
        return rides.acceptOffer(id, AuthPrincipal.requireDriverId());
    }

    @PostMapping("/{id}/reject")
    public OfferMessage reject(@PathVariable("id") long id) {
        return rides.rejectOffer(id, AuthPrincipal.requireDriverId());
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
}
