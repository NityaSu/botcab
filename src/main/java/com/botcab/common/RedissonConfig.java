package com.botcab.common;

import org.redisson.config.SingleServerConfig;
import org.redisson.spring.starter.RedissonAutoConfigurationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

/**
 * Local Compose Redis has no password. {@code spring.data.redis.password:} becomes
 * {@code ""} and Redisson still sends {@code AUTH}, which Redis rejects. Clear blank
 * passwords so local works; Railway can still set a real {@code SPRING_DATA_REDIS_PASSWORD}.
 */
@Configuration
public class RedissonConfig {

    @Bean
    RedissonAutoConfigurationCustomizer blankRedisPasswordCustomizer() {
        return config -> {
            SingleServerConfig single = config.useSingleServer();
            if (!StringUtils.hasText(single.getPassword())) {
                single.setPassword(null);
            }
        };
    }
}
