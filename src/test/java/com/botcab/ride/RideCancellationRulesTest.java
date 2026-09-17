package com.botcab.ride;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class RideCancellationRulesTest {

    @Test
    void riderMayCancelBeforeInProgress() {
        assertDoesNotThrow(() -> RideCancellationRules.requireAllowed(RideStatus.REQUESTED, CancelledBy.RIDER));
        assertDoesNotThrow(() -> RideCancellationRules.requireAllowed(RideStatus.MATCHED, CancelledBy.RIDER));
        assertDoesNotThrow(() ->
                RideCancellationRules.requireAllowed(RideStatus.DRIVER_EN_ROUTE, CancelledBy.RIDER));
        assertThrows(
                RideCancelNotAllowedException.class,
                () -> RideCancellationRules.requireAllowed(RideStatus.IN_PROGRESS, CancelledBy.RIDER));
    }

    @Test
    void driverMayCancelOnlyAfterAccept() {
        assertThrows(
                RideCancelNotAllowedException.class,
                () -> RideCancellationRules.requireAllowed(RideStatus.REQUESTED, CancelledBy.DRIVER));
        assertDoesNotThrow(() -> RideCancellationRules.requireAllowed(RideStatus.MATCHED, CancelledBy.DRIVER));
        assertThrows(
                RideCancelNotAllowedException.class,
                () -> RideCancellationRules.requireAllowed(RideStatus.IN_PROGRESS, CancelledBy.DRIVER));
    }

    @Test
    void terminalCannotCancel() {
        assertThrows(
                IllegalRideTransitionException.class,
                () -> RideCancellationRules.requireAllowed(RideStatus.COMPLETED, CancelledBy.SYSTEM));
    }
}
