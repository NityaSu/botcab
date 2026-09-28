package com.botcab.ride;

import com.botcab.common.auth.AuthPrincipal;
import com.botcab.common.auth.Role;
import com.botcab.driver.DriverService;
import com.botcab.fare.Fare;
import com.botcab.fare.FareService;
import com.botcab.matching.OfferService;
import com.botcab.rating.CreateRatingRequest;
import com.botcab.rating.RatingService;
import com.botcab.rating.RideRatings;
import com.botcab.rider.RiderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RideHistoryServiceTest {

    @Mock
    RideRepository rides;

    @Mock
    RiderService riders;

    @Mock
    DriverService drivers;

    @Mock
    OfferService offers;

    @Mock
    FareService fares;

    @Mock
    RatingService ratings;

    @Mock
    PlatformTransactionManager txManager;

    RideService service;

    @BeforeEach
    void setUp() {
        lenient().when(txManager.getTransaction(any())).thenReturn(new SimpleTransactionStatus());
        lenient().when(ratings.snapshot(anyLong())).thenReturn(RideRatings.none());
        service = new RideService(rides, riders, drivers, offers, fares, ratings, txManager);
    }

    @Test
    void historyForRiderReturnsCompletedWithFare() {
        Ride ride = completedRide(10L, 1L, 2L);
        when(rides.findByRiderIdAndStatusInOrderByEndedAtDesc(eq(1L), any(), any(Pageable.class)))
                .thenReturn(List.of(ride));
        when(fares.findByRideId(10L)).thenReturn(Optional.of(new Fare(10L, 12_500, "KHR")));

        List<RideResponse> history = service.history(
                new AuthPrincipal(1L, "+8551", "Rider", Role.RIDER), 20);

        assertEquals(1, history.size());
        assertEquals(10L, history.getFirst().id());
        assertEquals(RideStatus.COMPLETED, history.getFirst().status());
        assertEquals(12_500, history.getFirst().fare().totalCents());
        verify(rides).findByRiderIdAndStatusInOrderByEndedAtDesc(eq(1L), any(), any(Pageable.class));
    }

    @Test
    void historyForDriverListsTheirTrips() {
        Ride ride = completedRide(11L, 1L, 5L);
        when(rides.findByDriverIdAndStatusInOrderByEndedAtDesc(eq(5L), any(), any(Pageable.class)))
                .thenReturn(List.of(ride));
        when(fares.findByRideId(11L)).thenReturn(Optional.empty());

        List<RideResponse> history = service.history(
                new AuthPrincipal(5L, "+8555", "Driver", Role.DRIVER), 10);

        assertEquals(1, history.size());
        assertNull(history.getFirst().fare());
        verify(rides).findByDriverIdAndStatusInOrderByEndedAtDesc(eq(5L), any(), any(Pageable.class));
    }

    @Test
    void getForbidsOutsider() {
        Ride ride = completedRide(10L, 1L, 2L);
        when(rides.findById(10L)).thenReturn(Optional.of(ride));

        assertThrows(ResponseStatusException.class, () ->
                service.get(10L, new AuthPrincipal(99L, "+8559", "Other", Role.RIDER)));
    }

    @Test
    void getAllowsAssignedDriver() {
        Ride ride = completedRide(10L, 1L, 2L);
        when(rides.findById(10L)).thenReturn(Optional.of(ride));
        when(fares.findByRideId(10L)).thenReturn(Optional.empty());

        RideResponse body = service.get(10L, new AuthPrincipal(2L, "+8552", "Drv", Role.DRIVER));
        assertEquals(10L, body.id());
    }

    @Test
    void rateSubmitsForRiderOnCompletedRide() {
        Ride ride = completedRide(10L, 1L, 2L);
        when(rides.findById(10L)).thenReturn(Optional.of(ride));
        when(fares.findByRideId(10L)).thenReturn(Optional.empty());
        AuthPrincipal rider = new AuthPrincipal(1L, "+8551", "Rider", Role.RIDER);

        RideResponse body = service.rate(10L, rider, new CreateRatingRequest(5));

        assertEquals(10L, body.id());
        verify(ratings).submit(ride, Role.RIDER, 5);
    }

    @Test
    void rateForbidsOutsider() {
        Ride ride = completedRide(10L, 1L, 2L);
        when(rides.findById(10L)).thenReturn(Optional.of(ride));

        assertThrows(ResponseStatusException.class, () ->
                service.rate(10L, new AuthPrincipal(99L, "+8559", "Other", Role.RIDER),
                        new CreateRatingRequest(4)));
        verify(ratings, never()).submit(any(), any(), anyInt());
    }

    private static Ride completedRide(long id, long riderId, long driverId) {
        Ride ride = new Ride(
                riderId,
                BigDecimal.valueOf(11.55),
                BigDecimal.valueOf(104.92),
                BigDecimal.valueOf(11.56),
                BigDecimal.valueOf(104.93));
        try {
            var field = Ride.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(ride, id);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(e);
        }
        Instant now = Instant.parse("2026-01-15T10:00:00Z");
        ride.assignDriver(driverId, now);
        ride.markEnRoute();
        ride.startTrip(now);
        ride.complete(now.plusSeconds(600));
        return ride;
    }
}
