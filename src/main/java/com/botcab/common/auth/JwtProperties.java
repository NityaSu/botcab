package com.botcab.common.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "botcab.jwt")
public record JwtProperties(
        String secret,
        long ttlDays
) {
}
