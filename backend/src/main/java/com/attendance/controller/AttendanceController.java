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
import org.springframework.security.core.context.SecurityContextHolder;
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
    public ResponseEntity<AttendanceResponse> scan(@Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.scan(request, currentUsername()));
    }

    /**
     * Xem thống kê điểm danh theo khoảng ngày
     */
    @GetMapping("/stats")
    public ResponseEntity<List<DayStatsResponse>> getStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(statsService.getDayStats(getUserId(), startDate, endDate));
    }

    /**
     * Xem chi tiết điểm danh 1 ngày
     */
    @GetMapping("/detail")
    public ResponseEntity<DayDetailResponse> getDetail(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(statsService.getDayDetail(getUserId(), date));
    }

    private String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new com.attendance.exception.BusinessException("UNAUTHORIZED", "Không xác định được người dùng");
        }
        return authentication.getName();
    }

    private Long getUserId() {
        return userRepository.findByUsername(currentUsername())
                .map(User::getId)
                .orElse(1L);
    }
}
