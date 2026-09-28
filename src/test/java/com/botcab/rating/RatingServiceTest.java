package com.botcab.rating;

import com.botcab.common.auth.Role;
import com.botcab.ride.Ride;
import com.botcab.ride.RideStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    RatingRepository ratings;

    RatingService service;

    @BeforeEach
    void setUp() {
        service = new RatingService(ratings);
    }

    @Test
    void submitPersistsRiderStarsOnCompletedRide() {
        Ride ride = completedRide(10L, 1L, 2L);
        when(ratings.existsByRideIdAndRaterRole(10L, Role.RIDER)).thenReturn(false);
        when(ratings.save(any(Rating.class))).thenAnswer(inv -> inv.getArgument(0));

        Rating saved = service.submit(ride, Role.RIDER, 5);

        assertEquals(10L, saved.getRideId());
        assertEquals(Role.RIDER, saved.getRaterRole());
        assertEquals(5, saved.getStars());
        verify(ratings).save(any(Rating.class));
    }

    @Test
    void submitRejectsWhenRideNotCompleted() {
        Ride ride = new Ride(
                1L,
                BigDecimal.valueOf(11.55),
                BigDecimal.valueOf(104.92),
                BigDecimal.valueOf(11.56),
                BigDecimal.valueOf(104.93));
        assertEquals(RideStatus.REQUESTED, ride.getStatus());

        assertThrows(ResponseStatusException.class, () -> service.submit(ride, Role.RIDER, 4));
        verify(ratings, never()).save(any());
    }

    @Test
    void submitRejectsDuplicateRole() {
        Ride ride = completedRide(10L, 1L, 2L);
        when(ratings.existsByRideIdAndRaterRole(10L, Role.RIDER)).thenReturn(true);

        assertThrows(RatingAlreadyExistsException.class, () -> service.submit(ride, Role.RIDER, 3));
        verify(ratings, never()).save(any());
    }

    @Test
    void snapshotMapsBothRoles() {
        when(ratings.findByRideId(10L)).thenReturn(List.of(
                new Rating(10L, Role.RIDER, 5),
                new Rating(10L, Role.DRIVER, 4)));

        RideRatings snap = service.snapshot(10L);
        assertEquals(5, snap.riderStars());
        assertEquals(4, snap.driverStars());
    }

    @Test
    void snapshotEmptyWhenNone() {
        when(ratings.findByRideId(10L)).thenReturn(List.of());
        RideRatings snap = service.snapshot(10L);
        assertNull(snap.riderStars());
        assertNull(snap.driverStars());
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
