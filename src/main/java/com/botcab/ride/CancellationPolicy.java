package com.botcab.ride;

import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

/**
 * When a cancel is free vs charged. Actor rules stay in {@link RideCancellationRules};
 * this class only prices an already-allowed cancel.
 */
@Component
public class CancellationPolicy {

    /** Rider MATCHED cancel is free for this long after accept. */
    public static final Duration GRACE = Duration.ofMinutes(2);

    /** Rider MATCHED after grace (KHR). */
    public static final long AFTER_GRACE_FEE_CENTS = 2_000L;

    /** Rider DRIVER_EN_ROUTE (KHR) — flag-drop, same order as {@code FareCalculator} base. */
    public static final long EN_ROUTE_FEE_CENTS = 4_000L;

    public static final String FREE_SEARCHING = "FREE_SEARCHING";
    public static final String FREE_GRACE = "FREE_GRACE";
    public static final String FEE_AFTER_GRACE = "FEE_AFTER_GRACE";
    public static final String FEE_EN_ROUTE = "FEE_EN_ROUTE";
    public static final String DRIVER_NO_FEE = "DRIVER_NO_FEE";
    public static final String SYSTEM_NO_FEE = "SYSTEM_NO_FEE";

    private final Clock clock;

    public CancellationPolicy(Clock clock) {
        this.clock = clock;
    }

    public CancellationQuote quote(CancelledBy by, RideStatus status, Instant matchedAt) {
        return quote(by, status, matchedAt, Instant.now(clock));
    }

    public CancellationQuote quote(CancelledBy by, RideStatus status, Instant matchedAt, Instant now) {
        return switch (by) {
            case SYSTEM -> new CancellationQuote(0L, SYSTEM_NO_FEE);
            case DRIVER -> new CancellationQuote(0L, DRIVER_NO_FEE);
            case RIDER -> riderQuote(status, matchedAt, now);
        };
    }

    private static CancellationQuote riderQuote(RideStatus status, Instant matchedAt, Instant now) {
        return switch (status) {
            case REQUESTED -> new CancellationQuote(0L, FREE_SEARCHING);
            case MATCHED -> {
                if (matchedAt != null && !now.isAfter(matchedAt.plus(GRACE))) {
                    yield new CancellationQuote(0L, FREE_GRACE);
                }
                yield new CancellationQuote(AFTER_GRACE_FEE_CENTS, FEE_AFTER_GRACE);
            }
            case DRIVER_EN_ROUTE -> new CancellationQuote(EN_ROUTE_FEE_CENTS, FEE_EN_ROUTE);
            default -> new CancellationQuote(0L, "NOT_ALLOWED");
        };
    }
}
