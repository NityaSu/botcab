package com.botcab.common.auth;

import org.springframework.lang.Nullable;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Authenticates STOMP CONNECT with a Bearer JWT and gates subscriptions.
 * Offers are delivered via {@code /user/queue/offers} (driver only).
 */
@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwt;

    public StompAuthChannelInterceptor(JwtService jwt) {
        this.jwt = jwt;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            AuthPrincipal principal = requirePrincipal(accessor);
            accessor.setUser(principal.toAuthentication());
            return message;
        }

        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            AuthPrincipal principal = principalFrom(accessor);
            String dest = accessor.getDestination();
            if (dest == null) {
                return message;
            }
            if (dest.startsWith("/topic/drivers/") && dest.endsWith("/offers")) {
                throw deny(message, "Subscribe to /user/queue/offers with a driver JWT");
            }
            if (isUserOffersQueue(dest) && principal.role() != Role.DRIVER) {
                throw deny(message, "Driver login required for offers");
            }
            return message;
        }

        return message;
    }

    private AuthPrincipal requirePrincipal(StompHeaderAccessor accessor) {
        String header = firstNative(accessor, "Authorization");
        if (header == null || header.isBlank()) {
            header = firstNative(accessor, "authorization");
        }
        if (header == null || !header.regionMatches(true, 0, "Bearer ", 0, 7)) {
            throw deny(null, "Login required");
        }
        String token = header.substring(7).trim();
        if (token.isEmpty()) {
            throw deny(null, "Login required");
        }
        try {
            return jwt.parse(token);
        } catch (Exception ex) {
            throw deny(null, "Login required");
        }
    }

    private static AuthPrincipal principalFrom(StompHeaderAccessor accessor) {
        if (accessor.getUser() instanceof Authentication auth
                && auth.getPrincipal() instanceof AuthPrincipal principal) {
            return principal;
        }
        throw deny(null, "Login required");
    }

    @Nullable
    private static String firstNative(StompHeaderAccessor accessor, String name) {
        return accessor.getFirstNativeHeader(name);
    }

    private static boolean isUserOffersQueue(String dest) {
        return "/user/queue/offers".equals(dest) || dest.startsWith("/queue/offers");
    }

    private static MessageDeliveryException deny(@Nullable Message<?> message, String reason) {
        if (message == null) {
            return new MessageDeliveryException(reason);
        }
        return new MessageDeliveryException(message, reason);
    }
}
