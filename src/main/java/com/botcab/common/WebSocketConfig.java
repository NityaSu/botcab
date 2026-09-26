package com.botcab.common;

import com.botcab.common.auth.StompAuthChannelInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * In-memory STOMP broker for a single app instance.
 * <p>
 * Driver offers go to the authenticated user queue {@code /user/queue/offers}
 * (JWT on CONNECT). {@code /topic/rides/{id}} remains pub-sub for ride-level events.
 * <p>
 * Multi-instance production would replace {@code enableSimpleBroker} with an
 * external broker relay (RabbitMQ/Redis). We document that; we do not build it.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final StompAuthChannelInterceptor stompAuth;

    public WebSocketConfig(StompAuthChannelInterceptor stompAuth) {
        this.stompAuth = stompAuth;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(stompAuth);
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:5173", "*");
    }
}
