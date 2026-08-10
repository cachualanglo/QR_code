package com.attendance.repository;

import com.attendance.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {

    List<Shift> findByIsActiveTrue();

    Optional<Shift> findByIdAndIsActiveTrue(Long id);

    @Query("SELECT s FROM Shift s WHERE s.isActive = true AND s.startTime <= :time AND s.endTime >= :time")
    List<Shift> findActiveShiftsAtTime(LocalTime time);

    boolean existsByNameIgnoreCase(String name);
}
