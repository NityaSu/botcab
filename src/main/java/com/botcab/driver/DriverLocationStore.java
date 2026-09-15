package com.botcab.driver;

import java.util.List;

/**
 * Live driver positions. Redis GEO in production; a fake in tests.
 * Postgres never stores "where is this driver right now."
 */
public interface DriverLocationStore {

    void upsert(long driverId, double lat, double lng);

    void remove(long driverId);

    List<NearbyDriver> nearby(double lat, double lng, double radiusKm, int limit);
}
