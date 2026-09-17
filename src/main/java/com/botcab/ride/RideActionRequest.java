package com.botcab.ride;

import jakarta.validation.constraints.NotNull;

/** Driver accept/reject against a real ride row (pending offer). */
public record RideActionRequest(@NotNull Long driverId) {
}
