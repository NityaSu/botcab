package com.botcab.ride;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CancellationPolicyTest {

    private static final Instant T0 = Instant.parse("2026-09-30T10:00:00Z");

    private final CancellationPolicy policy = new CancellationPolicy(Clock.fixed(T0, ZoneOffset.UTC));

    @Test
    void riderSearchingIsFree() {
        CancellationQuote q = policy.quote(CancelledBy.RIDER, RideStatus.REQUESTED, null);
        assertEquals(0L, q.feeCents());
        assertEquals(CancellationPolicy.FREE_SEARCHING, q.policyCode());
    }

    @Test
    void riderMatchedInsideGraceIsFree() {
        Instant matched = T0.minusSeconds(30);
        CancellationQuote q = policy.quote(CancelledBy.RIDER, RideStatus.MATCHED, matched);
        assertEquals(0L, q.feeCents());
        assertEquals(CancellationPolicy.FREE_GRACE, q.policyCode());
    }

    @Test
    void riderMatchedAfterGracePays() {
        Instant matched = T0.minus(CancellationPolicy.GRACE).minusSeconds(1);
        CancellationQuote q = policy.quote(CancelledBy.RIDER, RideStatus.MATCHED, matched);
        assertEquals(CancellationPolicy.AFTER_GRACE_FEE_CENTS, q.feeCents());
        assertEquals(CancellationPolicy.FEE_AFTER_GRACE, q.policyCode());
    }

    @Test
    void riderEnRoutePaysFlagDrop() {
        CancellationQuote q = policy.quote(CancelledBy.RIDER, RideStatus.DRIVER_EN_ROUTE, T0.minusSeconds(10));
        assertEquals(CancellationPolicy.EN_ROUTE_FEE_CENTS, q.feeCents());
        assertEquals(CancellationPolicy.FEE_EN_ROUTE, q.policyCode());
    }

    @Test
    void driverAndSystemAreFree() {
        assertEquals(0L, policy.quote(CancelledBy.DRIVER, RideStatus.MATCHED, T0).feeCents());
        assertEquals(0L, policy.quote(CancelledBy.SYSTEM, RideStatus.REQUESTED, null).feeCents());
    }
}
