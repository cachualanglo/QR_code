package com.attendance.service;

import com.attendance.dto.response.QrResponse;
import com.attendance.dto.response.QrTokenData;
import com.attendance.entity.Shift;
import com.attendance.exception.BusinessException;
import com.attendance.repository.QrRedisRepository;
import com.attendance.repository.ShiftRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.ZoneId;
import java.util.UUID;

/**
 * QR Service — On-Demand.
 * Frontend gọi GET /api/attendance/qr/current để lấy QR đang active.
 * - Nếu Redis có token còn hạn → trả về.
 * - Nếu hết hạn hoặc chưa có → tự tạo mới (nếu có ca đang active).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QrService {

    private final QrRedisRepository qrRedisRepository;
    private final ShiftRepository shiftRepository;

    /**
     * Lấy QR hiện tại (gọi từ Kiosk page).
     * Nếu token hết hạn hoặc chưa có → tạo mới.
     */
    public QrResponse getCurrentQr() {
        // 1. Kiểm tra Redis có token đang active không
        QrTokenData existing = qrRedisRepository.getCurrentToken();
        if (existing != null) {
            return QrResponse.builder()
                    .token(existing.getToken())
                    .shiftId(existing.getShiftId())
                    .shiftName(existing.getShiftName())
                    .expiresIn(existing.getTtlSeconds())
                    .expiresAt(existing.getExpiresAt())
                    .build();
        }

        // 2. Tìm ca đang active
        Shift activeShift = findActiveShift();
        if (activeShift == null) {
            throw new BusinessException("NO_ACTIVE_SHIFT", "Hiện không có ca nào đang hoạt động");
        }

        // 3. Tạo token mới
        return generateNewToken(activeShift);
    }

    /**
     * Validate token khi employee scan QR.
     * @return QrTokenData nếu hợp lệ, null nếu hết hạn/đã dùng/không tồn tại.
     */
    public QrTokenData validateToken(String token) {
        if (token == null || token.isBlank()) {
            throw new BusinessException("QR_INVALID", "QR token không hợp lệ");
        }
        QrTokenData data = qrRedisRepository.validateToken(token);
        if (data == null) {
            throw new BusinessException("QR_EXPIRED", "QR đã hết hạn hoặc không tồn tại");
        }
        return data;
    }

    /**
     * Đánh dấu token đã dùng (sau khi scan thành công).
     */
    public void markTokenUsed(String token) {
        qrRedisRepository.markTokenUsed(token);
    }

    private static final ZoneId ZONE_VN = ZoneId.of("Asia/Ho_Chi_Minh");

    /**
     * Tìm ca đang active theo thời gian hiện tại.
     */
    private Shift findActiveShift() {
        LocalTime now = LocalTime.now(ZONE_VN);
        return shiftRepository.findByIsActiveTrue().stream()
                .filter(shift -> shift.isWithinShiftTime(now))
                .findFirst()
                .orElse(null);
    }

    /**
     * Tạo token mới và lưu vào Redis.
     */
    private QrResponse generateNewToken(Shift shift) {
        String token = UUID.randomUUID().toString();
        long ttlSeconds = shift.getQrRotationSeconds();
        long expiresAt = System.currentTimeMillis() + ttlSeconds * 1000;

        QrTokenData tokenData = QrTokenData.builder()
                .token(token)
                .shiftId(shift.getId())
                .shiftName(shift.getName())
                .expiresAt(expiresAt)
                .ttlSeconds(ttlSeconds)
                .build();

        qrRedisRepository.saveToken(tokenData, ttlSeconds);

        log.info("New QR token generated: shift={}, token={}, ttl={}s", shift.getName(), token, ttlSeconds);

        return QrResponse.builder()
                .token(token)
                .shiftId(shift.getId())
                .shiftName(shift.getName())
                .expiresIn(ttlSeconds)
                .expiresAt(expiresAt)
                .build();
    }
}
