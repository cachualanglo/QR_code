package com.attendance.service;

import com.attendance.dto.request.AttendanceRequest;
import com.attendance.dto.response.AttendanceResponse;
import com.attendance.dto.response.QrTokenData;
import com.attendance.entity.AttendanceRecord;
import com.attendance.entity.CompanyLocation;
import com.attendance.entity.Shift;
import com.attendance.entity.User;
import com.attendance.exception.BusinessException;
import com.attendance.repository.AttendanceRecordRepository;
import com.attendance.repository.CompanyLocationRepository;
import com.attendance.repository.ShiftRepository;
import com.attendance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private static final ZoneId ZONE_VN = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final double GPS_MIN_ACCURACY_FLOOR = 5.0;

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final CompanyLocationRepository companyLocationRepository;
    private final UserRepository userRepository;
    private final ShiftRepository shiftRepository;
    private final QrService qrService;

    /**
     * Scan QR — tự xác định CHECK_IN hoặc CHECK_OUT.
     */
    @Transactional
    public AttendanceResponse scan(String token, String username) {
        // 1. Validate QR token từ Redis
        QrTokenData qrData = qrService.validateToken(token);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "Không tìm thấy người dùng"));

        // 2. Lấy shift từ QR token
        Shift shift = shiftRepository.findByIdAndIsActiveTrue(qrData.getShiftId())
                .orElseThrow(() -> new BusinessException("SHIFT_NOT_FOUND", "Ca làm việc không tồn tại"));

        LocalDate today = LocalDate.now(ZONE_VN);
        LocalTime now = LocalTime.now(ZONE_VN);

        // 3. Lấy hoặc tạo attendance record
        var existing = attendanceRecordRepository.findByUserIdAndRecordDate(user.getId(), today);
        AttendanceRecord record;

        if (existing.isEmpty()) {
            // Chưa có record → CHECK_IN
            // Kiểm tra cutoff trước
            if (!shift.canCheckIn(now)) {
                throw new BusinessException("CHECKIN_CUTOFF",
                        String.format("Đã quá giờ check-in. Cutoff: %s", shift.getCheckinCutoff()));
            }
            return processCheckIn(user, shift, today, token);
        } else {
            record = existing.get();
            if (record.getCheckOutTime() == null) {
                // Đã check-in nhưng chưa check-out → CHECK_OUT
                return processCheckOut(record, user, token);
            } else {
                throw new BusinessException("ALREADY_COMPLETED", "Đã chấm công đủ trong ngày hôm nay");
            }
        }
    }

    private AttendanceResponse processCheckIn(User user, Shift shift,
                                               LocalDate today, String qrToken) {
        LocalTime checkInTime = LocalTime.now(ZONE_VN);
        int lateMinutes = shift.calculateLateMinutes(checkInTime);
        String status = lateMinutes > 0 ? "LATE" : "PRESENT";

        AttendanceRecord record = AttendanceRecord.builder()
                .user(user)
                .recordDate(today)
                .checkInTime(LocalDateTime.now(ZONE_VN))
                .checkInQrToken(UUID.fromString(qrToken))
                .shift(shift)
                .lateMinutes(lateMinutes)
                .status(status)
                .build();

        attendanceRecordRepository.save(record);
        qrService.markTokenUsed(qrToken);

        String message = lateMinutes > 0
                ? String.format("Check-in thành công (ĐẾN MUỘN %d phút)", lateMinutes)
                : "Check-in thành công (ĐÚNG GIỜ)";

        log.info("User {} checked in at {}, late={}min, shift={}", user.getUsername(), checkInTime, lateMinutes, shift.getName());

        return AttendanceResponse.builder()
                .action("CHECK_IN")
                .checkInAt(checkInTime)
                .status(status)
                .lateMinutes(lateMinutes)
                .message(message)
                .build();
    }

    private AttendanceResponse processCheckOut(AttendanceRecord record, User user, String qrToken) {
        Shift shift = record.getShift();
        LocalTime checkOutTime = LocalTime.now(ZONE_VN);
        int earlyLeaveMinutes = shift != null ? shift.calculateEarlyLeaveMinutes(checkOutTime) : 0;

        record.setCheckOutTime(LocalDateTime.now(ZONE_VN));
        record.setCheckOutQrToken(UUID.fromString(qrToken));
        record.setEarlyLeaveMinutes(earlyLeaveMinutes);
        if (earlyLeaveMinutes > 0) {
            record.setStatus("EARLY_LEAVE");
        }

        attendanceRecordRepository.save(record);
        qrService.markTokenUsed(qrToken);

        String message = earlyLeaveMinutes > 0
                ? String.format("Check-out thành công (VỀ SỚM %d phút)", earlyLeaveMinutes)
                : "Check-out thành công";

        log.info("User {} checked out at {}, earlyLeave={}min", user.getUsername(), checkOutTime, earlyLeaveMinutes);

        return AttendanceResponse.builder()
                .action("CHECK_OUT")
                .checkOutAt(checkOutTime)
                .earlyLeaveMinutes(earlyLeaveMinutes)
                .message(message)
                .build();
    }
}
