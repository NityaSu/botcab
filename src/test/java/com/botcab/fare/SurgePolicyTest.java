package com.botcab.fare;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SurgePolicyTest {

    private final SurgePolicy surge = new SurgePolicy();

    @Test
    void thresholds() {
        assertEquals(1.0, surge.multiplier(0.0));
        assertEquals(1.0, surge.multiplier(1.49));
        assertEquals(1.5, surge.multiplier(1.5));
        assertEquals(1.5, surge.multiplier(2.49));
        assertEquals(2.0, surge.multiplier(2.5));
    }
}
