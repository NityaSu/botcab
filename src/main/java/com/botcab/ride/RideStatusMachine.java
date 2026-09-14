package com.botcab.ride;

import java.util.Collections;
import java.util.EnumMap;
import java.util.Map;
import java.util.Set;

/**
 * The only place ride transitions are defined.
 *
 * <pre>
 * REQUESTED -> MATCHED -> DRIVER_EN_ROUTE -> IN_PROGRESS -> COMPLETED
 * any non-terminal -> CANCELLED
 * </pre>
 *
 * No skipping steps, no going backwards, nothing after a terminal status.
 * Illegal moves throw; they are never clamped to a "close enough" status.
 */
public final class RideStatusMachine {

    private static final Map<RideStatus, Set<RideStatus>> ALLOWED;

    static {
        Map<RideStatus, Set<RideStatus>> allowed = new EnumMap<>(RideStatus.class);
        allowed.put(RideStatus.REQUESTED, Set.of(RideStatus.MATCHED, RideStatus.CANCELLED));
        allowed.put(RideStatus.MATCHED, Set.of(RideStatus.DRIVER_EN_ROUTE, RideStatus.CANCELLED));
        allowed.put(RideStatus.DRIVER_EN_ROUTE, Set.of(RideStatus.IN_PROGRESS, RideStatus.CANCELLED));
        allowed.put(RideStatus.IN_PROGRESS, Set.of(RideStatus.COMPLETED, RideStatus.CANCELLED));
        allowed.put(RideStatus.COMPLETED, Set.of());
        allowed.put(RideStatus.CANCELLED, Set.of());
        ALLOWED = Collections.unmodifiableMap(allowed);
    }

    private RideStatusMachine() {
    }

    public static Set<RideStatus> allowedFrom(RideStatus from) {
        return ALLOWED.getOrDefault(from, Set.of());
    }

    public static boolean canTransition(RideStatus from, RideStatus to) {
        return allowedFrom(from).contains(to);
    }

    /** @throws IllegalRideTransitionException if the move is not allowed. */
    public static void require(RideStatus from, RideStatus to) {
        if (!canTransition(from, to)) {
            throw new IllegalRideTransitionException(from, to);
        }
    }
}
