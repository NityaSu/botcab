package com.botcab.payment;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    PaymentRepository payments;

    PaymentService service;

    @BeforeEach
    void setUp() {
        service = new PaymentService(payments, new MockPaymentProcessor());
    }

    @Test
    void capturePersistsCapturedForPositiveAmount() {
        when(payments.existsByRideId(11L)).thenReturn(false);
        when(payments.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentView view = service.captureForRide(11L, 9600);

        assertEquals(9600L, view.amountCents());
        assertEquals(PaymentStatus.CAPTURED, view.status());
        verify(payments).save(any(Payment.class));
    }

    @Test
    void capturePersistsFailedForZeroAmount() {
        when(payments.existsByRideId(11L)).thenReturn(false);
        when(payments.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentView view = service.captureForRide(11L, 0);

        assertEquals(PaymentStatus.FAILED, view.status());
    }

    @Test
    void captureRejectsDuplicateRide() {
        when(payments.existsByRideId(11L)).thenReturn(true);

        assertThrows(PaymentAlreadyExistsException.class, () -> service.captureForRide(11L, 1000));
        verify(payments, never()).save(any());
    }

    @Test
    void findByRideIdEmptyWhenNone() {
        when(payments.findByRideId(11L)).thenReturn(Optional.empty());
        assertEquals(Optional.empty(), service.findByRideId(11L));
    }
}
