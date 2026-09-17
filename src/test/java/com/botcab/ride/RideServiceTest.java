package com.botcab.ride;

import com.botcab.driver.DriverService;
import com.botcab.matching.OfferMessage;
import com.botcab.matching.OfferService;
import com.botcab.matching.OfferStatus;
import com.botcab.rider.RiderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.SimpleTransactionStatus;

import java.math.BigDecimal;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RideServiceTest {

    @Mock
    RideRepository rides;

    @Mock
    RiderService riders;

    @Mock
    DriverService drivers;

    @Mock
    OfferService offers;

    @Mock
    PlatformTransactionManager txManager;

    RideService service;

    @BeforeEach
    void setUp() {
        org.mockito.Mockito.lenient()
                .when(txManager.getTransaction(any()))
                .thenReturn(new SimpleTransactionStatus());
        service = new RideService(rides, riders, drivers, offers, txManager);
    }

    @Test
    void bookPersistsRequestedThenStartsOffer() {
        when(riders.require(1L)).thenReturn(mock(com.botcab.rider.Rider.class));
        when(rides.save(any(Ride.class))).thenAnswer(inv -> {
            Ride r = inv.getArgument(0);
            setId(r, 42L);
            return r;
        });
        when(rides.findById(42L)).thenAnswer(inv -> {
            Ride r = new Ride(
                    1L,
                    BigDecimal.valueOf(11.55),
                    BigDecimal.valueOf(104.92),
                    BigDecimal.valueOf(11.56),
                    BigDecimal.valueOf(104.93));
            setId(r, 42L);
            return java.util.Optional.of(r);
        });
        OfferMessage offer = new OfferMessage(
                "o1", 42L, 2L, 11.55, 104.92, 0.3, Instant.now(), OfferStatus.PENDING, "offer");
        when(offers.requestForRide(any(Ride.class))).thenReturn(offer);

        RideResponse response = service.book(new CreateRideRequest(
                1L,
                BigDecimal.valueOf(11.55),
                BigDecimal.valueOf(104.92),
                BigDecimal.valueOf(11.56),
                BigDecimal.valueOf(104.93)));

        assertEquals(42L, response.id());
        assertEquals(RideStatus.REQUESTED, response.status());
        assertEquals("o1", response.offer().offerId());
        ArgumentCaptor<Ride> saved = ArgumentCaptor.forClass(Ride.class);
        verify(rides).save(saved.capture());
        assertEquals(RideStatus.REQUESTED, saved.getValue().getStatus());
    }

    @Test
    void assignDriverMovesToMatched() {
        Ride ride = new Ride(
                1L,
                BigDecimal.valueOf(11.55),
                BigDecimal.valueOf(104.92),
                BigDecimal.valueOf(11.56),
                BigDecimal.valueOf(104.93));
        setId(ride, 9L);
        when(rides.findById(9L)).thenReturn(java.util.Optional.of(ride));
        when(rides.save(any(Ride.class))).thenAnswer(inv -> inv.getArgument(0));

        Ride matched = service.assignDriver(9L, 3L);

        assertEquals(RideStatus.MATCHED, matched.getStatus());
        assertEquals(3L, matched.getDriverId());
    }

    private static void setId(Ride ride, long id) {
        try {
            var field = Ride.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(ride, id);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(e);
        }
    }
}
