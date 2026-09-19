package com.botcab.fare;

/** API-facing fare snapshot (calculation details optional when loaded from DB). */
public record FareView(
        long totalCents,
        String currency,
        Double distanceKm,
        Double surgeMultiplier
) {
    public static FareView from(Fare fare) {
        return new FareView(fare.getTotalCents(), fare.getCurrency(), null, null);
    }

    public static FareView from(FareQuote quote) {
        return new FareView(
                quote.totalCents(),
                quote.currency(),
                quote.distanceKm(),
                quote.surgeMultiplier());
    }
}
