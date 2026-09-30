package com.botcab.ride;

/** Fee and policy code before a cancel is persisted. */
public record CancellationQuote(long feeCents, String policyCode) {
}
