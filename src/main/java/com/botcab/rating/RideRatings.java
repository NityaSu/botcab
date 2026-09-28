package com.botcab.rating;

/** Stars submitted by each party on a completed ride. Null = not rated yet. */
public record RideRatings(Integer riderStars, Integer driverStars) {

    public static RideRatings none() {
        return new RideRatings(null, null);
    }
}
