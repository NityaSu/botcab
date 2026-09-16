package com.botcab.common;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * In-memory STOMP broker for a single app instance.
 * <p>
 * {@code /topic} = pub-sub (many subscribers). Driver offers use
 * {@code /topic/drivers/{id}/offers} so the sim can listen without login.
 * {@code /queue} is reserved for per-user destinations when auth exists.
 * <p>
 * Multi-instance production would replace {@code enableSimpleBroker} with an
 * external broker relay (RabbitMQ/Redis). We document that; we do not build it.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:5173", "*");
    }
}
