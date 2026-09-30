package com.botcab.ride;

/** Whether the caller may cancel now, and the fee if they do. */
public record CancellationPreview(boolean allowed, long feeCents, String policyCode) {

    public static CancellationPreview denied() {
        return new CancellationPreview(false, 0L, "NOT_ALLOWED");
    }
}
