package com.botcab.payment;

import org.springframework.stereotype.Component;

/**
 * In-process stand-in for a PSP. Positive amounts capture; zero or negative fail.
 * No network, no cards.
 */
@Component
public class MockPaymentProcessor {

    public PaymentStatus settle(long amountCents) {
        return amountCents > 0 ? PaymentStatus.CAPTURED : PaymentStatus.FAILED;
    }
}
