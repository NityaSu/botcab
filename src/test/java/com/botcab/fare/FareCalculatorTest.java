package com.botcab.fare;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class FareCalculatorTest {

    FareCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new FareCalculator(new SurgePolicy());
    }

    @Test
    void twoKmNoSurgeIsBasePlusDistance() {
        // 4000 + 2.0 * 2000 = 8000
        FareQuote quote = calculator.quote(2.0);

        assertEquals(8_000L, quote.totalCents());
        assertEquals(1.0, quote.surgeMultiplier());
        assertEquals(Fare.CURRENCY_KHR, quote.currency());
        assertEquals(4_000L, quote.baseCents());
        assertEquals(2_000L, quote.perKmCents());
    }

    @Test
    void zeroDistanceIsJustBase() {
        assertEquals(4_000L, calculator.quote(0).totalCents());
    }

    @Test
    void surgeOnePointFiveMultipliesWholeTrip() {
        // (4000 + 2*2000) * 1.5 = 12000
        FareQuote quote = calculator.quote(2.0, 1.5);

        assertEquals(12_000L, quote.totalCents());
        assertEquals(1.5, quote.surgeMultiplier());
    }

    @Test
    void demandRatioMapsThroughSurgePolicy() {
        assertEquals(1.0, calculator.quoteForDemand(1.0, 1.0).surgeMultiplier());
        assertEquals(1.0, calculator.quoteForDemand(1.0, 1.0).demandRatio());
        assertEquals(1.5, calculator.quoteForDemand(1.0, 1.5).surgeMultiplier());
        assertEquals(2.0, calculator.quoteForDemand(1.0, 2.5).surgeMultiplier());
        assertEquals(2.5, calculator.quoteForDemand(1.0, 2.5).demandRatio());
        // (4000 + 2000) * 2 = 12000
        assertEquals(12_000L, calculator.quoteForDemand(1.0, 2.5).totalCents());
    }

    @Test
    void rejectsNegativeDistance() {
        assertThrows(IllegalArgumentException.class, () -> calculator.quote(-0.1));
    }
}
