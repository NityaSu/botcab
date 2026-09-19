package com.botcab.fare;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Quote + persist. Ride feature calls this; never the other way around for persistence.
 */
@Service
public class FareService {

    private final FareRepository fares;
    private final FareCalculator calculator;

    public FareService(FareRepository fares, FareCalculator calculator) {
        this.fares = fares;
        this.calculator = calculator;
    }

    /** Persist a fare for a completed ride. One fare per ride. Demand 1.0 = no surge. */
    @Transactional
    public FareQuote createForRide(long rideId, double distanceKm) {
        return createForRide(rideId, distanceKm, 1.0);
    }

    @Transactional
    public FareQuote createForRide(long rideId, double distanceKm, double demandRatio) {
        if (fares.existsByRideId(rideId)) {
            throw new FareAlreadyExistsException(rideId);
        }
        FareQuote quote = calculator.quoteForDemand(distanceKm, demandRatio);
        fares.save(new Fare(rideId, quote.totalCents(), quote.currency()));
        return quote;
    }

    public Optional<Fare> findByRideId(long rideId) {
        return fares.findByRideId(rideId);
    }
}
