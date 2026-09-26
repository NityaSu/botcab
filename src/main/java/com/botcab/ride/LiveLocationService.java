package com.botcab.ride;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.EnumSet;
import java.util.Optional;
import java.util.Set;

/**
 * Streams driver GPS from Redis-backed pings onto the ride STOMP topic.
 * Matching still uses GEO; this only notifies clients watching an active ride.
 */
@Service
public class LiveLocationService {

    private static final Set<RideStatus> ON_TRIP = EnumSet.of(
            RideStatus.MATCHED,
            RideStatus.DRIVER_EN_ROUTE,
            RideStatus.IN_PROGRESS);

    private final RideRepository rides;
    private final SimpMessagingTemplate messaging;

    public LiveLocationService(RideRepository rides, SimpMessagingTemplate messaging) {
        this.rides = rides;
        this.messaging = messaging;
    }

    /** If this driver owns a non-terminal ride, publish their latest lat/lng. */
    public void broadcastIfOnTrip(long driverId, double lat, double lng) {
        Optional<Ride> active = rides.findFirstByDriverIdAndStatusIn(driverId, ON_TRIP);
        if (active.isEmpty()) {
            return;
        }
        Ride ride = active.get();
        messaging.convertAndSend(
                "/topic/rides/" + ride.getId(),
                DriverLocationMessage.of(ride.getId(), driverId, lat, lng));
    }
}
