package com.botcab.matching;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/offers")
public class OfferController {

    private final OfferService offers;

    public OfferController(OfferService offers) {
        this.offers = offers;
    }

    /** Match + push STOMP offer to the winning driver. */
    @PostMapping("/request")
    public OfferMessage request(@Valid @RequestBody MatchRequest body) {
        return offers.request(body.lat(), body.lng());
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
