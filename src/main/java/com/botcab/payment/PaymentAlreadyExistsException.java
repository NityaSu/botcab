package com.botcab.payment;

/** Thrown when a second payment is recorded for the same ride. HTTP 409. */
public class PaymentAlreadyExistsException extends RuntimeException {

    public PaymentAlreadyExistsException(long rideId) {
        super("Payment already exists for ride " + rideId);
    }
}
