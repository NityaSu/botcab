package com.botcab.matching;

import com.botcab.driver.DriverService;
import com.botcab.driver.NearbyDriver;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Find the closest unlocked driver. Radius grows 1 → 2 → 5 → 10 km.
 * Redis GEO is the search; Redisson lock is the race; Postgres BUSY is the durable flag.
 */
@Service
public class MatchingService {

    static final double[] RADII_KM = {1, 2, 5, 10};
    static final int CANDIDATES_PER_RING = 8;

    private final DriverService drivers;
    private final DriverLock locks;

    public MatchingService(DriverService drivers, DriverLock locks) {
        this.drivers = drivers;
        this.locks = locks;
    }

    public MatchResult match(double pickupLat, double pickupLng) {
        Set<Long> seen = new HashSet<>();
        for (double radiusKm : RADII_KM) {
            List<NearbyDriver> ring = new ArrayList<>(
                    drivers.nearby(pickupLat, pickupLng, radiusKm, CANDIDATES_PER_RING));
            ring.sort(Comparator.comparingDouble(NearbyDriver::distanceKm));
            for (NearbyDriver candidate : ring) {
                if (!seen.add(candidate.driverId())) {
                    continue;
                }
                if (!locks.tryAcquire(candidate.driverId())) {
                    continue;
                }
                if (!drivers.tryMarkBusy(candidate.driverId())) {
                    continue;
                }
                return new MatchResult(candidate.driverId(), candidate.distanceKm(), radiusKm);
            }
        }
        throw new NoDriverAvailableException(pickupLat, pickupLng);
    }
}
