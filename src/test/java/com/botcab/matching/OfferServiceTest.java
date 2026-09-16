package com.botcab.matching;

import com.botcab.driver.DriverService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OfferServiceTest {

    @Mock
    MatchingService matching;

    @Mock
    DriverService drivers;

    @Mock
    SimpMessagingTemplate messaging;

    OfferService offers;

    @BeforeEach
    void setUp() {
        offers = new OfferService(matching, drivers, messaging);
    }

    @Test
    void requestMatchesAndPushesOfferToDriverTopic() {
        when(matching.match(eq(11.55), eq(104.92), eq(Set.of())))
                .thenReturn(new MatchResult(2L, 0.4, 1.0));

        OfferMessage msg = offers.request(11.55, 104.92);

        assertEquals(2L, msg.driverId());
        assertEquals(OfferStatus.PENDING, msg.status());
        assertEquals("offer", msg.note());
        verify(messaging).convertAndSend(eq("/topic/drivers/2/offers"), any(OfferMessage.class));
    }

    @Test
    void acceptClearsLocationAndStopsTimeoutRematch() {
        when(matching.match(anyDouble(), anyDouble(), any()))
                .thenReturn(new MatchResult(1L, 0.1, 1.0));
        OfferMessage pending = offers.request(11.55, 104.92);

        OfferMessage accepted = offers.accept(pending.offerId(), 1L);

        assertEquals(OfferStatus.ACCEPTED, accepted.status());
        verify(drivers).clearLiveLocation(1L);
        verify(drivers, never()).releaseOffer(anyLong());
    }

    @Test
    void rejectReleasesAndOffersNextDriver() {
        when(matching.match(eq(11.55), eq(104.92), eq(Set.of())))
                .thenReturn(new MatchResult(1L, 0.1, 1.0));
        when(matching.match(eq(11.55), eq(104.92), eq(Set.of(1L))))
                .thenReturn(new MatchResult(3L, 0.5, 1.0));

        OfferMessage first = offers.request(11.55, 104.92);
        OfferMessage second = offers.reject(first.offerId(), 1L);

        assertEquals(3L, second.driverId());
        assertEquals(OfferStatus.PENDING, second.status());
        verify(drivers).releaseOffer(1L);
        ArgumentCaptor<String> topic = ArgumentCaptor.forClass(String.class);
        verify(messaging, org.mockito.Mockito.atLeast(2))
                .convertAndSend(topic.capture(), any(OfferMessage.class));
        assertTrue(topic.getAllValues().stream().anyMatch(t -> t.contains("/drivers/3/")));
    }
}
