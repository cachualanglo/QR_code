package com.attendance.repository;

import com.attendance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmployeeCode(String employeeCode);

    @Query("SELECT u.id FROM User u WHERE u.id NOT IN " +
           "(SELECT ar.user.id FROM AttendanceRecord ar WHERE ar.recordDate = :today)")
    List<Long> findUserIdsNotCheckedInToday(@Param("today") LocalDate today);

    @Query("SELECT ar.user.id FROM AttendanceRecord ar WHERE ar.recordDate = :today AND ar.checkInTime IS NOT NULL AND ar.checkOutTime IS NULL")
    List<Long> findUserIdsMissingCheckoutToday(@Param("today") LocalDate today);
}
