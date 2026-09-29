package com.botcab.payment;

/** API-facing mock payment snapshot. */
public record PaymentView(long amountCents, PaymentStatus status) {

    public static PaymentView from(Payment payment) {
        return new PaymentView(payment.getAmountCents(), payment.getStatus());
    }
}
