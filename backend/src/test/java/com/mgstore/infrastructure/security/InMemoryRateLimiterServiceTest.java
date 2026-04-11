package com.mgstore.infrastructure.security;

import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InMemoryRateLimiterServiceTest {

    private final InMemoryRateLimiterService service = new InMemoryRateLimiterService();

    @Test
    void shouldAllowRequestsWithinLimit() {
        String key = "test-key-allow";

        assertTrue(service.isAllowed(key, 2, Duration.ofSeconds(5)));
        assertTrue(service.isAllowed(key, 2, Duration.ofSeconds(5)));
    }

    @Test
    void shouldBlockWhenLimitExceeded() {
        String key = "test-key-block";

        assertTrue(service.isAllowed(key, 2, Duration.ofSeconds(5)));
        assertTrue(service.isAllowed(key, 2, Duration.ofSeconds(5)));
        assertFalse(service.isAllowed(key, 2, Duration.ofSeconds(5)));
    }

    @Test
    void shouldAllowAgainAfterWindowExpires() throws InterruptedException {
        String key = "test-key-window";

        assertTrue(service.isAllowed(key, 1, Duration.ofMillis(50)));
        assertFalse(service.isAllowed(key, 1, Duration.ofMillis(50)));

        Thread.sleep(70);

        assertTrue(service.isAllowed(key, 1, Duration.ofMillis(50)));
    }
}
