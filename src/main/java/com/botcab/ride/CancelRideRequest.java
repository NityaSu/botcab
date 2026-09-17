package com.botcab.ride;

import jakarta.validation.constraints.NotNull;

public record CancelRideRequest(
        @NotNull CancelledBy cancelledBy,
        @NotNull Long actorId
) {
}
