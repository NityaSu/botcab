package com.botcab.driver;

import org.redisson.api.GeoOrder;
import org.redisson.api.GeoUnit;
import org.redisson.api.RGeo;
import org.redisson.api.RedissonClient;
import org.redisson.api.geo.GeoSearchArgs;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Redis GEOADD / GEOSEARCH. Redis wants <strong>longitude first</strong>, then latitude.
 */
@Component
public class RedisDriverLocationStore implements DriverLocationStore {

    static final String KEY = "drivers:geo";

    private final RGeo<String> geo;

    public RedisDriverLocationStore(RedissonClient redisson) {
        this.geo = redisson.getGeo(KEY);
    }

    @Override
    public void upsert(long driverId, double lat, double lng) {
        geo.add(lng, lat, String.valueOf(driverId));
    }

    @Override
    public void remove(long driverId) {
        geo.remove(String.valueOf(driverId));
    }

    @Override
    public List<NearbyDriver> nearby(double lat, double lng, double radiusKm, int limit) {
        Map<String, Double> found = geo.searchWithDistance(
                GeoSearchArgs.from(lng, lat)
                        .radius(radiusKm, GeoUnit.KILOMETERS)
                        .count(limit)
                        .order(GeoOrder.ASC));
        List<NearbyDriver> hits = new ArrayList<>(found.size());
        found.forEach((member, distanceKm) ->
                hits.add(new NearbyDriver(Long.parseLong(member), distanceKm)));
        hits.sort((a, b) -> Double.compare(a.distanceKm(), b.distanceKm()));
        return hits;
    }
}
