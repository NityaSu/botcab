package com.botcab.ride;

public record CancellationView(CancelledBy cancelledBy, long feeCents, String policyCode) {
}
