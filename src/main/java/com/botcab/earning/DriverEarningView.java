package com.botcab.earning;

import java.time.Instant;

public record DriverEarningView(long rideId, long amountCents, EarningKind kind, Instant createdAt) {

    public static DriverEarningView from(DriverEarning row) {
        return new DriverEarningView(row.getRideId(), row.getAmountCents(), row.getKind(), row.getCreatedAt());
    }
}
