package com.botcab.matching;

import com.botcab.driver.DriverService;
import com.botcab.driver.NearbyDriver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MatchingServiceTest {

    @Mock
    DriverService drivers;

    @Mock
    DriverLock locks;

    MatchingService matching;

    @BeforeEach
    void setUp() {
        matching = new MatchingService(drivers, locks);
    }

    @Test
    void picksClosestUnlockedDriver() {
        when(drivers.nearby(eq(11.5564), eq(104.9282), eq(1.0), anyInt()))
                .thenReturn(List.of(
                        new NearbyDriver(2L, 0.8),
                        new NearbyDriver(1L, 0.3)));
        when(locks.tryAcquire(1L)).thenReturn(true);
        when(drivers.tryMarkBusy(1L)).thenReturn(true);

        MatchResult result = matching.match(11.5564, 104.9282);

        assertEquals(1L, result.driverId());
        assertEquals(0.3, result.distanceKm());
        assertEquals(1.0, result.radiusKmUsed());
    }

    @Test
    void skipsDriverWhenLockLostThenTakesNext() {
        when(drivers.nearby(eq(11.5564), eq(104.9282), eq(1.0), anyInt()))
                .thenReturn(List.of(
                        new NearbyDriver(1L, 0.2),
                        new NearbyDriver(2L, 0.4)));
        when(locks.tryAcquire(1L)).thenReturn(false);
        when(locks.tryAcquire(2L)).thenReturn(true);
        when(drivers.tryMarkBusy(2L)).thenReturn(true);

        MatchResult result = matching.match(11.5564, 104.9282);

        assertEquals(2L, result.driverId());
    }

    @Test
    void expandsRadiusWhenInnerRingEmpty() {
        when(drivers.nearby(eq(11.5564), eq(104.9282), eq(1.0), anyInt())).thenReturn(List.of());
        when(drivers.nearby(eq(11.5564), eq(104.9282), eq(2.0), anyInt()))
                .thenReturn(List.of(new NearbyDriver(9L, 1.6)));
        when(locks.tryAcquire(9L)).thenReturn(true);
        when(drivers.tryMarkBusy(9L)).thenReturn(true);

        MatchResult result = matching.match(11.5564, 104.9282);

        assertEquals(9L, result.driverId());
        assertEquals(2.0, result.radiusKmUsed());
    }

    @Test
    void throwsWhenNobodyIsFree() {
        when(drivers.nearby(anyDouble(), anyDouble(), anyDouble(), anyInt())).thenReturn(List.of());

        assertThrows(NoDriverAvailableException.class, () -> matching.match(11.5564, 104.9282));
    }
}
