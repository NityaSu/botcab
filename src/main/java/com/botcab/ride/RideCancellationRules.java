package com.botcab.ride;

/**
 * Who may cancel, and from which statuses.
 *
 * <ul>
 *   <li>Rider: before the trip is underway ({@code REQUESTED} … {@code DRIVER_EN_ROUTE})</li>
 *   <li>Driver: only after they accepted ({@code MATCHED}, {@code DRIVER_EN_ROUTE})</li>
 *   <li>System: any non-terminal (no-driver exhaustion, etc.)</li>
 * </ul>
 * {@code IN_PROGRESS} is not cancellable here — that needs an explicit product rule later.
 */
public final class RideCancellationRules {

    private RideCancellationRules() {
    }

    public static void requireAllowed(RideStatus status, CancelledBy by) {
        if (status.isTerminal()) {
            throw new IllegalRideTransitionException(status, RideStatus.CANCELLED);
        }
        boolean allowed = switch (by) {
            case RIDER -> status == RideStatus.REQUESTED
                    || status == RideStatus.MATCHED
                    || status == RideStatus.DRIVER_EN_ROUTE;
            case DRIVER -> status == RideStatus.MATCHED
                    || status == RideStatus.DRIVER_EN_ROUTE;
            case SYSTEM -> true;
        };
        if (!allowed) {
            throw new RideCancelNotAllowedException(by, status);
        }
    }
}
