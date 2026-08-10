package com.attendance.repository;

import com.attendance.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Lấy thông báo của user, sắp xếp mới nhất trước
    Page<Notification> findByUserIdOrderBySentAtDesc(Long userId, Pageable pageable);

    // Đếm thông báo chưa đọc
    long countByUserIdAndIsReadFalse(Long userId);

    // Đánh dấu đã đọc
    @Modifying
    @Query("UPDATE Notification n SET n.readAt = :now, n.isRead = true WHERE n.id = :id AND n.user.id = :userId AND n.isRead = false")
    int markAsRead(@Param("id") Long id, @Param("userId") Long userId, @Param("now") LocalDateTime now);
}
