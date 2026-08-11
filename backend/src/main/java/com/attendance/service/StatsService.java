package com.attendance.service;

import com.attendance.dto.response.DayDetailResponse;
import com.attendance.dto.response.DayStatsResponse;
import com.attendance.entity.AttendanceRecord;
import com.attendance.entity.CompanyLocation;
import com.attendance.repository.AttendanceRecordRepository;
import com.attendance.repository.CompanyLocationRepository;
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
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatsService {

    private static final ZoneId ZONE_VN = ZoneId.of("Asia/Ho_Chi_Minh");

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final CompanyLocationRepository companyLocationRepository;

    @Transactional(readOnly = true)
    public List<DayStatsResponse> getDayStats(Long userId, LocalDate startDate, LocalDate endDate) {
        List<AttendanceRecord> records = attendanceRecordRepository
                .findByUserIdAndRecordDateBetweenOrderByRecordDateAsc(userId, startDate, endDate);

        Map<LocalDate, AttendanceRecord> recordMap = records.stream()
                .collect(Collectors.toMap(AttendanceRecord::getRecordDate, r -> r));

        CompanyLocation location = companyLocationRepository.findFirstByOrderByIdAsc().orElse(null);

        List<DayStatsResponse> result = new ArrayList<>();
        LocalDate current = startDate;

        while (!current.isAfter(endDate)) {
            AttendanceRecord record = recordMap.get(current);
            String status = determineStatus(record, location, current);

            result.add(DayStatsResponse.builder()
                    .date(current)
                    .checkInTime(record != null ? record.getCheckInTime() : null)
                    .checkOutTime(record != null ? record.getCheckOutTime() : null)
                    .status(status)
                    .build());

            current = current.plusDays(1);
        }

        return result;
    }

    @Transactional(readOnly = true)
    public DayDetailResponse getDayDetail(Long userId, LocalDate date) {
        Optional<AttendanceRecord> recordOpt = attendanceRecordRepository.findByUserIdAndRecordDate(userId, date);
        CompanyLocation location = companyLocationRepository.findFirstByOrderByIdAsc().orElse(null);

        if (recordOpt.isEmpty()) {
            String status = isWeekend(date) ? "DAY_OFF" : "ABSENT";
            return DayDetailResponse.builder().date(date).status(status).build();
        }

        AttendanceRecord record = recordOpt.get();
        String status = determineStatus(record, location, date);

        return DayDetailResponse.builder()
                .date(date)
                .checkInTime(record.getCheckInTime())
                .checkOutTime(record.getCheckOutTime())
                .checkInLat(record.getCheckInLat())
                .checkInLng(record.getCheckInLng())
                .checkInDistanceM(record.getCheckInDistanceM())
                .checkInAccuracy(record.getCheckInAccuracy())
                .checkOutLat(record.getCheckOutLat())
                .checkOutLng(record.getCheckOutLng())
                .checkOutDistanceM(record.getCheckOutDistanceM())
                .checkOutAccuracy(record.getCheckOutAccuracy())
                .status(status)
                .build();
    }

    /**
     * Determine attendance status with proper business logic.
     * ABSENT: no record or no checkInTime
     * ON_TIME: checked in on time, may or may not have checkout
     * LATE: checked in late
     * CHECKED_IN: checked in but not yet checked out (still within allowed time)
     * COMPLETED: checked in + checked out
     * MISSING_CHECKOUT: checked in but grace period expired, no checkout
     */
    private String determineStatus(AttendanceRecord record, CompanyLocation location, LocalDate date) {
        if (isWeekend(date)) return "DAY_OFF";
        if (record == null || record.getCheckInTime() == null) return "ABSENT";

        // Determine if checked in late
        boolean isLate = location != null && record.getCheckInTime().toLocalTime().isAfter(location.getCheckInEnd());

        if (record.getCheckOutTime() != null) {
            // Has both check-in and check-out → COMPLETED
            return isLate ? "LATE" : "ON_TIME";
        }

        // Checked in but no check-out
        // Check if grace period has expired
        LocalTime now = LocalTime.now(ZONE_VN);
        if (record.getShift() != null && now.isAfter(record.getShift().getEndTime().plusMinutes(60))) {
            return "MISSING_CHECKOUT";
        }

        // Still within working time / grace period → CHECKED_IN
        return isLate ? "LATE" : "CHECKED_IN";
    }

    private boolean isWeekend(LocalDate date) {
        int dayOfWeek = date.getDayOfWeek().getValue();
        return dayOfWeek == 6 || dayOfWeek == 7;
    }
}
