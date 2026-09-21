package com.botcab.matching;

import com.botcab.common.auth.AuthPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/offers")
public class OfferController {

    private final OfferService offers;

    public OfferController(OfferService offers) {
        this.offers = offers;
    }

    @PostMapping("/{offerId}/accept")
    public OfferMessage accept(@PathVariable("offerId") String offerId) {
        return offers.accept(offerId, AuthPrincipal.requireDriverId());
    }

    @PostMapping("/{offerId}/reject")
    public OfferMessage reject(@PathVariable("offerId") String offerId) {
        return offers.reject(offerId, AuthPrincipal.requireDriverId());
    }
}
