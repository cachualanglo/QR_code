package com.attendance.service;

import com.attendance.dto.request.ShiftRequest;
import com.attendance.dto.request.UpdateLocationRequest;
import com.attendance.dto.response.DashboardEmployeeResponse;
import com.attendance.dto.response.DayStatsResponse;
import com.attendance.dto.response.DayDetailResponse;
import com.attendance.dto.response.ShiftResponse;
import com.attendance.entity.AttendanceRecord;
import com.attendance.entity.CompanyLocation;
import com.attendance.entity.Shift;
import com.attendance.entity.User;
import com.attendance.exception.BusinessException;
import com.attendance.repository.CompanyLocationRepository;
import com.attendance.repository.ShiftRepository;
import com.attendance.repository.UserRepository;
import com.attendance.repository.AttendanceRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final CompanyLocationRepository companyLocationRepository;
    private final UserRepository userRepository;
    private final ShiftRepository shiftRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final StatsService statsService;

    // ─── Shift CRUD ────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ShiftResponse> getAllShifts() {
        return shiftRepository.findAll().stream()
                .map(ShiftResponse::fromEntity)
                .toList();
    }

    @Transactional
    public ShiftResponse createShift(ShiftRequest request) {
        if (shiftRepository.existsByNameIgnoreCase(request.getName())) {
            throw new BusinessException("SHIFT_NAME_DUPLICATE", "Tên ca đã tồn tại");
        }
        Shift shift = Shift.builder()
                .name(request.getName())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .checkinCutoff(request.getCheckinCutoff())
                .qrRotationSeconds(request.getQrRotationSeconds())
                .isActive(request.isActive())
                .build();
        shift = shiftRepository.save(shift);
        log.info("Shift created: {}", shift.getName());
        return ShiftResponse.fromEntity(shift);
    }

    @Transactional
    public ShiftResponse updateShift(Long id, ShiftRequest request) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new BusinessException("SHIFT_NOT_FOUND", "Không tìm thấy ca"));
        shift.setName(request.getName());
        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());
        shift.setCheckinCutoff(request.getCheckinCutoff());
        shift.setQrRotationSeconds(request.getQrRotationSeconds());
        shift.setActive(request.isActive());
        shift = shiftRepository.save(shift);
        log.info("Shift updated: {}", shift.getName());
        return ShiftResponse.fromEntity(shift);
    }

    @Transactional
    public void deleteShift(Long id) {
        if (!shiftRepository.existsById(id)) {
            throw new BusinessException("SHIFT_NOT_FOUND", "Không tìm thấy ca");
        }
        // Check if any AttendanceRecord references this shift
        boolean used = attendanceRecordRepository.existsByShift_Id(id);
        if (used) {
            throw new BusinessException(
                    "SHIFT_DELETE_FORBIDDEN",
                    "Không thể xóa ca làm việc vì ca này đã được sử dụng trong dữ liệu chấm công."
            );
        }

        shiftRepository.deleteById(id);
        log.info("Shift deleted: id={}", id);
    }

    /**
     * Delete a user if there are no attendance records referencing this user.
     * Do not delete if there are related attendance data.
     */
    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new BusinessException("USER_NOT_FOUND", "Không tìm thấy người dùng");
        }
        boolean hasAttendance = attendanceRecordRepository.existsByUserId(userId);
        if (hasAttendance) {
            throw new BusinessException(
                    "USER_DELETE_FORBIDDEN",
                    "Không thể xóa người dùng vì đã có dữ liệu điểm danh liên quan"
            );
        }
        userRepository.deleteById(userId);
        log.info("User deleted: id={}", userId);
    }

    /**
     * Cập nhật vị trí công ty và cấu hình giờ làm việc
     */
    @Transactional
    public CompanyLocation updateLocation(UpdateLocationRequest request) {
        CompanyLocation location = companyLocationRepository.findFirstByOrderByIdAsc()
                .orElse(new CompanyLocation());

        if (request.getLatitude() != null) location.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) location.setLongitude(request.getLongitude());
        if (request.getRadiusMeters() != null) location.setRadiusMeters(request.getRadiusMeters());
        if (request.getCheckInStart() != null) location.setCheckInStart(request.getCheckInStart());
        if (request.getCheckInEnd() != null) location.setCheckInEnd(request.getCheckInEnd());
        if (request.getCheckOutStart() != null) location.setCheckOutStart(request.getCheckOutStart());
        if (request.getCheckOutEnd() != null) location.setCheckOutEnd(request.getCheckOutEnd());
        if (request.getStandardCheckinTime() != null) location.setStandardCheckinTime(request.getStandardCheckinTime());
        if (request.getWorkDayStart() != null) location.setWorkDayStart(request.getWorkDayStart());
        if (request.getWorkDayEnd() != null) location.setWorkDayEnd(request.getWorkDayEnd());

        companyLocationRepository.save(location);
        log.info("Company location updated: lat={}, lng={}, radius={}m",
                location.getLatitude(), location.getLongitude(), location.getRadiusMeters());

        return location;
    }

    /**
     * Lấy thông tin vị trí hiện tại
     */
    @Transactional(readOnly = true)
    public CompanyLocation getLocation() {
        return companyLocationRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new BusinessException("NO_LOCATION", "Chưa cấu hình vị trí công ty"));
    }

    /**
     * Lấy tất cả nhân viên (để hiển thị trong dashboard admin)
     */
    @Transactional(readOnly = true)
    public List<User> getAllEmployees() {
        return userRepository.findAll();
    }

    /**
     * Admin xem thống kê điểm danh của 1 nhân viên
     */
    @Transactional(readOnly = true)
    public List<DayStatsResponse> getEmployeeStats(Long userId, LocalDate startDate, LocalDate endDate) {
        return statsService.getDayStats(userId, startDate, endDate);
    }

    /**
     * Admin xem chi tiết điểm danh của 1 nhân viên
     */
    @Transactional(readOnly = true)
    public DayDetailResponse getEmployeeDayDetail(Long userId, LocalDate date) {
        return statsService.getDayDetail(userId, date);
    }

    private static final ZoneId ZONE_VN = ZoneId.of("Asia/Ho_Chi_Minh");

    /**
     * Dashboard: lấy TOÀN BỘ nhân viên active + merge với attendance record theo ngày.
     * Trả về danh sách nhân viên kèm trạng thái chấm công.
     */
    @Transactional(readOnly = true)
    public List<DashboardEmployeeResponse> getDashboardData(LocalDate date) {
        // 1. Lấy tất cả nhân viên active (không phải ADMIN)
        List<User> allEmployees = userRepository.findAll().stream()
                .filter(u -> "EMPLOYEE".equals(u.getRole()))
                .toList();

        // 2. Lấy attendance records cho ngày đó
        List<AttendanceRecord> records = attendanceRecordRepository.findByRecordDate(date);
        Map<Long, AttendanceRecord> recordMap = records.stream()
                .collect(Collectors.toMap(r -> r.getUser().getId(), r -> r));

        // 3. Merge: mỗi employee kèm attendance (hoặc ABSENT nếu không có record)
        List<DashboardEmployeeResponse> result = new ArrayList<>();
        LocalTime now = LocalTime.now(ZONE_VN);

        for (User emp : allEmployees) {
            AttendanceRecord record = recordMap.get(emp.getId());
            String status = determineDashboardStatus(record, now);

            result.add(DashboardEmployeeResponse.builder()
                    .employeeId(emp.getId())
                    .employeeCode(emp.getEmployeeCode())
                    .employeeName(emp.getUsername())
                    .status(status)
                    .checkInTime(record != null ? record.getCheckInTime() : null)
                    .checkOutTime(record != null ? record.getCheckOutTime() : null)
                    .lateMinutes(record != null ? record.getLateMinutes() : 0)
                    .earlyLeaveMinutes(record != null ? record.getEarlyLeaveMinutes() : 0)
                    .build());
        }

        return result;
    }

    /**
     * Xác định trạng thái dashboard cho employee.
     */
    private String determineDashboardStatus(AttendanceRecord record, LocalTime now) {
        if (record == null || record.getCheckInTime() == null) {
            return "ABSENT";
        }

        if (record.getCheckOutTime() != null) {
            // Has both → COMPLETED (or LATE/ON_TIME based on check-in time)
            return record.getLateMinutes() > 0 ? "LATE" : "ON_TIME";
        }

        // Checked in but no check-out
        // Check if grace period expired
        if (record.getShift() != null && now.isAfter(record.getShift().getEndTime().plusMinutes(60))) {
            return "MISSING_CHECKOUT";
        }

        // Still within working time / grace period → CHECKED_IN
        return record.getLateMinutes() > 0 ? "LATE" : "CHECKED_IN";
    }
}
