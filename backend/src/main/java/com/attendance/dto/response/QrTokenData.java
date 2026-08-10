package com.attendance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dữ liệu QR token lưu trong Redis.
 * Thay thế QrSession entity khi dùng Redis.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrTokenData {

    private String token;
    private Long shiftId;
    private String shiftName;
    private long expiresAt;     // epoch millis
    private long ttlSeconds;    // số giây còn lại
}
