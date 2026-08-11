package com.attendance.repository;

import com.attendance.dto.response.QrTokenData;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Lưu và quản lý QR tokens trong Redis.
 * Key: qr:current          → JSON(QrTokenData)  — token đang active duy nhất
 * Key: qr:used:{token}     → "1"                 — đánh dấu token đã dùng (TTL = 60s)
 */
@Slf4j
@Repository
@RequiredArgsConstructor
public class QrRedisRepository {

    private static final String KEY_CURRENT = "qr:current";
    private static final String KEY_USED_PREFIX = "qr:used:";
    private static final long USED_TOKEN_TTL_SECONDS = 120;

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;

    /**
     * Lưu token mới vào Redis, xóa token cũ nếu có.
     */
    public void saveToken(QrTokenData tokenData, long ttlSeconds) {
        try {
            String json = objectMapper.writeValueAsString(tokenData);
            // Xóa token cũ
            redis.delete(KEY_CURRENT);
            // Lưu token mới với TTL
            redis.opsForValue().set(KEY_CURRENT, json, ttlSeconds, TimeUnit.SECONDS);
            log.info("QR token saved to Redis: token={}, ttl={}s", tokenData.getToken(), ttlSeconds);
        } catch (Exception e) {
            log.error("Failed to save QR token to Redis", e);
            throw new RuntimeException("Không thể lưu QR token vào Redis", e);
        }
    }

    /**
     * Lấy token đang active từ Redis.
     * @return QrTokenData nếu còn hạn, null nếu hết hạn hoặc không có.
     */
    public QrTokenData getCurrentToken() {
        try {
            String json = redis.opsForValue().get(KEY_CURRENT);
            if (json == null) {
                return null;
            }
            QrTokenData data = objectMapper.readValue(json, QrTokenData.class);
            // Kiểm tra TTL còn lại
            Long ttl = redis.getExpire(KEY_CURRENT, TimeUnit.SECONDS);
            if (ttl == null || ttl <= 0) {
                redis.delete(KEY_CURRENT);
                return null;
            }
            data.setTtlSeconds(ttl);
            data.setExpiresAt(System.currentTimeMillis() + ttl * 1000);
            return data;
        } catch (Exception e) {
            log.error("Failed to get QR token from Redis", e);
            return null;
        }
    }

    /**
     * Validate token: kiểm tra có phải token hiện tại + chưa dùng cho userId.
     */
    public QrTokenData validateToken(String token, Long userId) {
        QrTokenData current = getCurrentToken();
        if (current == null) {
            return null;
        }
        if (!current.getToken().equals(token)) {
            return null;
        }
        // Check per-user usage
        Boolean isUsed = redis.hasKey(String.format("%s%s:%s", KEY_USED_PREFIX, token, userId));
        if (Boolean.TRUE.equals(isUsed)) {
            return null;
        }
        return current;
    }

    /**
     * Đánh dấu token đã sử dụng.
     */
    public void markTokenUsed(String token, Long userId) {
        String key = String.format("qr:used:%s:%s", token, userId);
        redis.opsForValue().set(key, "1");
        log.info("QR token marked as used in Redis for user {}: {}", userId, token);
    }

    public boolean isTokenUsed(String token, Long userId) {
        String key = String.format("qr:used:%s:%s", token, userId);
        return redis.hasKey(key);
    }

    /**
     * Xóa token hiện tại (dùng khi cần force rotate).
     */
    public void deleteCurrentToken() {
        redis.delete(KEY_CURRENT);
    }
}
