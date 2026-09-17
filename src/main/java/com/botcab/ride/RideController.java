package com.botcab.ride;

import com.botcab.matching.OfferMessage;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    private final RideService rides;

    public RideController(RideService rides) {
        this.rides = rides;
    }

    /** Create a {@code REQUESTED} ride and start the offer loop. */
    @PostMapping
    public RideResponse book(@Valid @RequestBody CreateRideRequest body) {
        return rides.book(body);
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

    @PostMapping("/{id}/cancel")
    public RideResponse cancel(
            @PathVariable("id") long id, @Valid @RequestBody CancelRideRequest body) {
        return rides.cancel(id, body);
    }
}
