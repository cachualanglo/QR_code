package com.attendance.repository;

import com.attendance.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    // Tìm record theo user + ngày cụ thể
    Optional<AttendanceRecord> findByUserIdAndRecordDate(Long userId, LocalDate recordDate);

    // Tìm tất cả record của user trong khoảng ngày (dùng cho stats week/month)
    List<AttendanceRecord> findByUserIdAndRecordDateBetweenOrderByRecordDateAsc(
            Long userId, LocalDate startDate, LocalDate endDate);

    // Kiểm tra user đã check-in hôm nay chưa
    boolean existsByUserIdAndRecordDate(Long userId, LocalDate recordDate);

    // Tìm danh sách user chưa check-in hôm nay (dùng cho notification reminder)
    @Query("SELECT u.id FROM User u WHERE u.id NOT IN " +
           "(SELECT ar.user.id FROM AttendanceRecord ar WHERE ar.recordDate = :today)")
    List<Long> findUserIdsNotCheckedInToday(@Param("today") LocalDate today);

    // Tìm danh sách user đã check-in nhưng chưa check-out hôm nay
    @Query("SELECT ar.user.id FROM AttendanceRecord ar " +
           "WHERE ar.recordDate = :today AND ar.checkInTime IS NOT NULL AND ar.checkOutTime IS NULL")
    List<Long> findUserIdsMissingCheckoutToday(@Param("today") LocalDate today);
}
