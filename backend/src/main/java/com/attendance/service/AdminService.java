package com.attendance.service;

import com.attendance.dto.request.ShiftRequest;
import com.attendance.dto.request.UpdateLocationRequest;
import com.attendance.dto.response.DayStatsResponse;
import com.attendance.dto.response.DayDetailResponse;
import com.attendance.dto.response.ShiftResponse;
import com.attendance.entity.CompanyLocation;
import com.attendance.entity.Shift;
import com.attendance.entity.User;
import com.attendance.exception.BusinessException;
import com.attendance.repository.CompanyLocationRepository;
import com.attendance.repository.ShiftRepository;
import com.attendance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final CompanyLocationRepository companyLocationRepository;
    private final UserRepository userRepository;
    private final ShiftRepository shiftRepository;
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
        shiftRepository.deleteById(id);
        log.info("Shift deleted: id={}", id);
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
}
