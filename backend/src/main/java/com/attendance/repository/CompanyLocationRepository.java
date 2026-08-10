package com.attendance.repository;

import com.attendance.entity.CompanyLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyLocationRepository extends JpaRepository<CompanyLocation, Long> {

    // Single-location: luôn trả về dòng đầu tiên (hoặc tạo mới nếu chưa có)
    Optional<CompanyLocation> findFirstByOrderByIdAsc();
}
