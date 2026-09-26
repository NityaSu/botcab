package com.botcab.ride;

import com.botcab.driver.Driver;
import com.botcab.driver.DriverLocationStore;
import com.botcab.driver.DriverRepository;
import com.botcab.driver.DriverService;
import com.botcab.driver.DriverStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LiveLocationServiceTest {

    @Mock
    RideRepository rides;

    @Mock
    SimpMessagingTemplate messaging;

    @Mock
    DriverRepository drivers;

    @Mock
    DriverLocationStore locations;

    LiveLocationService liveLocation;
    DriverService driverService;

    @BeforeEach
    void setUp() {
        liveLocation = new LiveLocationService(rides, messaging);
        driverService = new DriverService(drivers, locations, liveLocation);
    }

    @Test
    void busyPingPublishesToRideTopic() {
        Driver driver = busyDriver(9L);
        when(drivers.findById(9L)).thenReturn(Optional.of(driver));
        Ride ride = matchedRide(42L, 9L);
        when(rides.findFirstByDriverIdAndStatusIn(eq(9L), any())).thenReturn(Optional.of(ride));

        driverService.pingLocation(9L, 11.56, 104.92);

        verify(locations).upsert(9L, 11.56, 104.92);
        ArgumentCaptor<DriverLocationMessage> captor = ArgumentCaptor.forClass(DriverLocationMessage.class);
        verify(messaging).convertAndSend(eq("/topic/rides/42"), captor.capture());
        DriverLocationMessage msg = captor.getValue();
        assertEquals("location", msg.event());
        assertEquals(42L, msg.rideId());
        assertEquals(9L, msg.driverId());
        assertEquals(11.56, msg.lat());
        assertEquals(104.92, msg.lng());
    }

    @Test
    void availablePingUpdatesGeoWithoutBroadcast() {
        Driver driver = new Driver("A", "+8551", "hash");
        driver.goAvailable();
        when(drivers.findById(1L)).thenReturn(Optional.of(driver));

        driverService.pingLocation(1L, 11.55, 104.91);

        verify(locations).upsert(1L, 11.55, 104.91);
        verify(messaging, never()).convertAndSend(any(String.class), any(Object.class));
        verify(rides, never()).findFirstByDriverIdAndStatusIn(any(), any());
    }

    @Test
    void broadcastSkippedWhenNoActiveRide() {
        when(rides.findFirstByDriverIdAndStatusIn(eq(3L), any())).thenReturn(Optional.empty());
        liveLocation.broadcastIfOnTrip(3L, 11.0, 104.0);
        verify(messaging, never()).convertAndSend(any(String.class), any(Object.class));
    }

    private static Driver busyDriver(long id) {
        Driver driver = new Driver("D", "+8559", "hash");
        driver.markBusy();
        try {
            var field = Driver.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(driver, id);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(e);
        }
        return driver;
    }

    private static Ride matchedRide(long rideId, long driverId) {
        Ride ride = new Ride(
                1L,
                BigDecimal.valueOf(11.55),
                BigDecimal.valueOf(104.92),
                BigDecimal.valueOf(11.56),
                BigDecimal.valueOf(104.93));
        try {
            var idField = Ride.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(ride, rideId);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(e);
        }
        ride.assignDriver(driverId, java.time.Instant.now());
        return ride;
    }
}
