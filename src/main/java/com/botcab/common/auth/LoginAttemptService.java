package com.botcab.common.auth;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory login throttle (per phone key). Enough for a single-instance demo;
 * multi-instance would move this to Redis later.
 */
@Component
public class LoginAttemptService {

    public static final int MAX_FAILURES = 5;
    static final Duration WINDOW = Duration.ofMinutes(15);

    private final ConcurrentHashMap<String, Window> attempts = new ConcurrentHashMap<>();
    private final Clock clock;

    public LoginAttemptService() {
        this(Clock.systemUTC());
    }

    LoginAttemptService(Clock clock) {
        this.clock = clock;
    }

    public void checkAllowed(String key) {
        Window w = attempts.get(key);
        if (w == null) {
            return;
        }
        Instant now = clock.instant();
        if (now.isAfter(w.windowStart.plus(WINDOW))) {
            attempts.remove(key, w);
            return;
        }
        if (w.failures >= MAX_FAILURES) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many failed logins — try again in a few minutes");
        }
    }

    public void recordFailure(String key) {
        Instant now = clock.instant();
        attempts.compute(key, (k, existing) -> {
            if (existing == null || now.isAfter(existing.windowStart.plus(WINDOW))) {
                return new Window(now, 1);
            }
            return new Window(existing.windowStart, existing.failures + 1);
        });
    }

    public void recordSuccess(String key) {
        attempts.remove(key);
    }

    private record Window(Instant windowStart, int failures) {
    }
}
