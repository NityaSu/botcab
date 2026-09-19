package com.botcab.fare;

/**
 * Result of a fare calculation. Not persisted — use {@link Fare} for the DB row.
 */
public record FareQuote(
        double distanceKm,
        double surgeMultiplier,
        double demandRatio,
        long baseCents,
        long perKmCents,
        long totalCents,
        String currency
) {
}
