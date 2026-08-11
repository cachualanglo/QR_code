package com.attendance.monitor;

import org.springframework.stereotype.Service;

import java.util.Deque;
import java.util.LinkedList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {
    private final int limitPerMinute;
    private final long windowMillis;
    private final Map<String, Deque<Long>> calls = new ConcurrentHashMap<>();

    public RateLimiterService() {
        this(100, 60_000); // default: 100 requests per 60 seconds
    }

    public RateLimiterService(int limitPerMinute, long windowMillis) {
        this.limitPerMinute = limitPerMinute;
        this.windowMillis = windowMillis;
    }

    public boolean tryAcquire(String key) {
        long now = System.currentTimeMillis();
        Deque<Long> dq = calls.computeIfAbsent(key, k -> new LinkedList<>());
        synchronized (dq) {
            while (!dq.isEmpty() && now - dq.peekFirst() > windowMillis) {
                dq.pollFirst();
            }
            if (dq.size() >= limitPerMinute) {
                return false;
            }
            dq.addLast(now);
            return true;
        }
    }
}
