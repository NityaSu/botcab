package com.botcab.fare;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FareServiceTest {

    @Mock
    FareRepository fares;

    FareService service;

    @BeforeEach
    void setUp() {
        service = new FareService(fares, new FareCalculator(new SurgePolicy()));
    }

    @Test
    void createForRidePersistsIntegerTotal() {
        when(fares.existsByRideId(5L)).thenReturn(false);
        when(fares.save(any(Fare.class))).thenAnswer(inv -> inv.getArgument(0));

        FareQuote quote = service.createForRide(5L, 2.0);

        assertEquals(8_000L, quote.totalCents());
        ArgumentCaptor<Fare> saved = ArgumentCaptor.forClass(Fare.class);
        verify(fares).save(saved.capture());
        assertEquals(5L, saved.getValue().getRideId());
        assertEquals(8_000L, saved.getValue().getTotalCents());
        assertEquals("KHR", saved.getValue().getCurrency());
    }

    @Test
    void createForRideRejectsDuplicate() {
        when(fares.existsByRideId(5L)).thenReturn(true);

        assertThrows(FareAlreadyExistsException.class, () -> service.createForRide(5L, 1.0));
        verify(fares, never()).save(any());
    }
}
