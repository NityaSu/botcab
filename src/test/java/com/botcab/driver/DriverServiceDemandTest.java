package com.botcab.driver;

import com.botcab.ride.LiveLocationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DriverServiceDemandTest {

    @Mock
    DriverRepository drivers;

    @Mock
    DriverLocationStore locations;

    @Mock
    LiveLocationService liveLocation;

    DriverService service;

    @BeforeEach
    void setUp() {
        service = new DriverService(drivers, locations, liveLocation);
    }

    @Test
    void idleFleetIsOne() {
        when(drivers.countByStatus(DriverStatus.AVAILABLE)).thenReturn(3L);
        when(drivers.countByStatus(DriverStatus.BUSY)).thenReturn(0L);
        assertEquals(0.0, service.demandRatio());
    }

    @Test
    void twoBusyOneFreeIsTwo() {
        when(drivers.countByStatus(DriverStatus.AVAILABLE)).thenReturn(1L);
        when(drivers.countByStatus(DriverStatus.BUSY)).thenReturn(2L);
        assertEquals(2.0, service.demandRatio());
    }

    @Test
    void noAvailableWhileBusyIsMaxBand() {
        when(drivers.countByStatus(DriverStatus.AVAILABLE)).thenReturn(0L);
        when(drivers.countByStatus(DriverStatus.BUSY)).thenReturn(2L);
        assertEquals(2.5, service.demandRatio());
    }
}
