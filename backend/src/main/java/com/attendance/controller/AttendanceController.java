package com.attendance.controller;

import com.attendance.dto.request.AttendanceRequest;
import com.attendance.dto.response.AttendanceResponse;
import com.attendance.dto.response.DayDetailResponse;
import com.attendance.dto.response.DayStatsResponse;
import com.attendance.dto.response.QrResponse;
import com.attendance.entity.User;
import com.attendance.repository.UserRepository;
import com.attendance.service.AttendanceService;
import com.attendance.service.QrService;
import com.attendance.service.StatsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final StatsService statsService;
    private final UserRepository userRepository;
    private final QrService qrService;

    /**
     * Lấy QR code hiện tại (Kiosk page gọi endpoint này).
     * Nếu token hết hạn → tự tạo mới.
     */
    @GetMapping("/qr/current")
    public ResponseEntity<QrResponse> getCurrentQr() {
        return ResponseEntity.ok(qrService.getCurrentQr());
    }

    /**
     * Scan QR — Check-in hoặc Check-out tự động
     */
    @PostMapping("/scan")
    public ResponseEntity<AttendanceResponse> scan(
            @Valid @RequestBody AttendanceRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(attendanceService.scan(request.getToken(), authentication.getName()));
    }

    /**
     * Xem thống kê điểm danh theo khoảng ngày
     */
    @GetMapping("/stats")
    public ResponseEntity<List<DayStatsResponse>> getStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(statsService.getDayStats(userId, startDate, endDate));
    }

    /**
     * Xem chi tiết điểm danh 1 ngày
     */
    @GetMapping("/detail")
    public ResponseEntity<DayDetailResponse> getDetail(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(statsService.getDayDetail(userId, date));
    }

    private Long getUserId(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .map(User::getId)
                .orElse(1L);
    }
}
