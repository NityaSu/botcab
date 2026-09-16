package com.botcab.matching;

import jakarta.validation.constraints.NotNull;

public record OfferActionRequest(@NotNull Long driverId) {
}
