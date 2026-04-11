package com.mgstore.infrastructure.security;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class InMemoryRateLimiterService {

    private final Map<String, Deque<Long>> requestStore = new ConcurrentHashMap<>();

    public boolean isAllowed(String key, int maxRequests, Duration window) {
        long now = System.currentTimeMillis();
        long threshold = now - window.toMillis();

        Deque<Long> timestamps = requestStore.computeIfAbsent(key, ignored -> new ArrayDeque<>());

        synchronized (timestamps) {
            while (!timestamps.isEmpty() && timestamps.peekFirst() < threshold) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= maxRequests) {
                return false;
            }

            timestamps.addLast(now);
            return true;
        }
    }
}
