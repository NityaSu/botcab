package com.botcab.fare;

import org.springframework.stereotype.Component;

/**
 * Pure fare math: {@code base + distanceKm × perKm × surge}, rounded to integer KHR.
 * No I/O — callers persist a {@link Fare} later.
 */
@Component
public class FareCalculator {

    /** Flag-drop style base (KHR). */
    static final long BASE_CENTS = 4_000L;

    /** Per kilometre (KHR). */
    static final long PER_KM_CENTS = 2_000L;

    private final SurgePolicy surge;

    public FareCalculator(SurgePolicy surge) {
        this.surge = surge;
    }

    /** Quote with no surge (multiplier 1.0, demand 1.0). */
    public FareQuote quote(double distanceKm) {
        return quote(distanceKm, 1.0, 1.0);
    }

    /** Quote using {@link SurgePolicy} from a demand ratio (busy ÷ available). */
    public FareQuote quoteForDemand(double distanceKm, double demandRatio) {
        return quote(distanceKm, surge.multiplier(demandRatio), demandRatio);
    }

    public FareQuote quote(double distanceKm, double surgeMultiplier) {
        return quote(distanceKm, surgeMultiplier, 0);
    }

    public FareQuote quote(double distanceKm, double surgeMultiplier, double demandRatio) {
        if (distanceKm < 0) {
            throw new IllegalArgumentException("distanceKm must be >= 0");
        }
        if (surgeMultiplier <= 0) {
            throw new IllegalArgumentException("surgeMultiplier must be > 0");
        }
        long total = Math.round((BASE_CENTS + distanceKm * PER_KM_CENTS) * surgeMultiplier);
        return new FareQuote(
                distanceKm,
                surgeMultiplier,
                demandRatio,
                BASE_CENTS,
                PER_KM_CENTS,
                total,
                Fare.CURRENCY_KHR);
    }
}
