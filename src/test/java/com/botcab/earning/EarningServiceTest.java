package com.botcab.earning;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EarningServiceTest {

    @Mock
    EarningRepository earnings;

    EarningService service;

    @BeforeEach
    void setUp() {
        service = new EarningService(earnings);
    }

    @Test
    void tripShareIsEightyPercentIntegerCents() {
        assertEquals(7680L, EarningService.tripShareCents(9600L));
        assertEquals(0L, EarningService.tripShareCents(1L));
    }

    @Test
    void creditTripPersistsShare() {
        when(earnings.existsByRideId(11L)).thenReturn(false);
        when(earnings.save(any(DriverEarning.class))).thenAnswer(inv -> inv.getArgument(0));

        Optional<DriverEarningView> view = service.creditTrip(3L, 11L, 9600L);

        assertTrue(view.isPresent());
        assertEquals(7680L, view.get().amountCents());
        assertEquals(EarningKind.TRIP, view.get().kind());
        verify(earnings).save(any(DriverEarning.class));
    }

    @Test
    void creditSkipsZeroAmount() {
        assertTrue(service.creditCancelFee(3L, 12L, 0L).isEmpty());
        verify(earnings, never()).save(any());
    }

    @Test
    void creditRejectsDuplicateRide() {
        when(earnings.existsByRideId(11L)).thenReturn(true);
        assertThrows(EarningAlreadyExistsException.class, () -> service.creditTrip(3L, 11L, 1000L));
        verify(earnings, never()).save(any());
    }

    @Test
    void summaryTotalsByKind() {
        DriverEarning trip = new DriverEarning(3L, 11L, 7680L, EarningKind.TRIP);
        DriverEarning fee = new DriverEarning(3L, 12L, 2000L, EarningKind.CANCEL_FEE);
        when(earnings.findByDriverId(3L)).thenReturn(List.of(trip, fee));
        when(earnings.findByDriverIdOrderByCreatedAtDesc(eq(3L), any(Pageable.class)))
                .thenReturn(List.of(fee, trip));

        DriverEarningsSummary summary = service.summaryForDriver(3L);

        assertEquals(9680L, summary.totalCents());
        assertEquals(1, summary.tripCount());
        assertEquals(1, summary.cancelFeeCount());
        assertEquals(2, summary.recent().size());
    }
}
