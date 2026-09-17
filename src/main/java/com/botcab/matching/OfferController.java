package com.botcab.matching;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Offer accept/reject by offer id (driver-sim convenience). Prefer
 * {@code POST /api/rides/{id}/accept|reject} once a ride row exists.
 */
@RestController
@RequestMapping("/api/offers")
public class OfferController {

    private final OfferService offers;

    public OfferController(OfferService offers) {
        this.offers = offers;
    }

    @PostMapping("/{offerId}/accept")
    public OfferMessage accept(
            @PathVariable String offerId, @Valid @RequestBody OfferActionRequest body) {
        return offers.accept(offerId, body.driverId());
    }

    @PostMapping("/{offerId}/reject")
    public OfferMessage reject(
            @PathVariable String offerId, @Valid @RequestBody OfferActionRequest body) {
        return offers.reject(offerId, body.driverId());
    }
}
