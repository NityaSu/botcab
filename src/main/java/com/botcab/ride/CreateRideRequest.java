package com.botcab.ride;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateRideRequest(
        @NotNull Long riderId,
        @NotNull @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal pickupLat,
        @NotNull @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal pickupLng,
        @NotNull @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal dropoffLat,
        @NotNull @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal dropoffLng
) {
}
