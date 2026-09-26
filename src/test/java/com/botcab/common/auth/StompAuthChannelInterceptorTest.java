package com.botcab.common.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;

class StompAuthChannelInterceptorTest {

    StompAuthChannelInterceptor interceptor;
    JwtService jwt;

    @BeforeEach
    void setUp() {
        jwt = new JwtService(new JwtProperties("botcab-dev-jwt-secret-change-me-32b", 7));
        interceptor = new StompAuthChannelInterceptor(jwt);
    }

    @Test
    void connectSetsDriverPrincipalFromBearer() {
        String token = jwt.sign(2L, "+855000000011", "Sophea", Role.DRIVER);
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setNativeHeader("Authorization", "Bearer " + token);
        accessor.setLeaveMutable(true);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        interceptor.preSend(message, null);

        Authentication auth = assertInstanceOf(Authentication.class, accessor.getUser());
        AuthPrincipal principal = assertInstanceOf(AuthPrincipal.class, auth.getPrincipal());
        assertEquals(2L, principal.id());
        assertEquals(Role.DRIVER, principal.role());
        assertEquals("driver:2", principal.getName());
    }

    @Test
    void connectWithoutTokenFails() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setLeaveMutable(true);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        assertThrows(MessageDeliveryException.class, () -> interceptor.preSend(message, null));
    }

    @Test
    void subscribeToLegacyDriverTopicFails() {
        String token = jwt.sign(2L, "+855000000011", "Sophea", Role.DRIVER);
        AuthPrincipal principal = jwt.parse(token);
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setUser(principal.toAuthentication());
        accessor.setDestination("/topic/drivers/2/offers");
        accessor.setLeaveMutable(true);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        assertThrows(MessageDeliveryException.class, () -> interceptor.preSend(message, null));
    }
}
