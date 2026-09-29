package com.botcab.payment;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Record one mock payment per ride. {@code ride} calls this service;
 * this package never injects {@code RideRepository}.
 */
@Service
public class PaymentService {

    private final PaymentRepository payments;
    private final MockPaymentProcessor processor;

    public PaymentService(PaymentRepository payments, MockPaymentProcessor processor) {
        this.payments = payments;
        this.processor = processor;
    }

    /** Settle cash for a completed fare. One row per ride. */
    @Transactional
    public PaymentView captureForRide(long rideId, long amountCents) {
        if (payments.existsByRideId(rideId)) {
            throw new PaymentAlreadyExistsException(rideId);
        }
        PaymentStatus status = processor.settle(amountCents);
        try {
            Payment saved = payments.save(new Payment(rideId, amountCents, status));
            return PaymentView.from(saved);
        } catch (DataIntegrityViolationException ex) {
            throw new PaymentAlreadyExistsException(rideId);
        }
    }

    public Optional<PaymentView> findByRideId(long rideId) {
        return payments.findByRideId(rideId).map(PaymentView::from);
    }
}
