package com.attendance.service;

import com.attendance.dto.response.NotificationResponse;
import com.attendance.entity.Notification;
import com.attendance.entity.User;
import com.attendance.exception.BusinessException;
import com.attendance.repository.NotificationRepository;
import com.attendance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final ZoneId ZONE_VN = ZoneId.of("Asia/Ho_Chi_Minh");

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderBySentAtDesc(userId, PageRequest.of(0, 50))
                .getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        notificationRepository.markAsRead(notificationId, userId, LocalDateTime.now());
        log.info("Notification {} marked as read for user {}", notificationId, userId);
    }

    @Scheduled(cron = "0 25 8 * * 1-5", zone = "Asia/Ho_Chi_Minh")
    @Transactional
    public void sendCheckInReminder() {
        java.time.LocalDate today = java.time.LocalDate.now(ZONE_VN);
        List<Long> notCheckedIn = userRepository.findUserIdsNotCheckedInToday(today);
        for (Long userId : notCheckedIn) {
            createNotification(userId, "CHECK_IN_REMINDER", "Nhắc nhở Check-in",
                    "Bạn chưa check-in hôm nay. Vui lòng check-in trước 09:00.");
        }
        log.info("Sent check-in reminders to {} users", notCheckedIn.size());
    }

    @Scheduled(cron = "0 25 16 * * 1-5", zone = "Asia/Ho_Chi_Minh")
    @Transactional
    public void sendCheckOutReminder() {
        java.time.LocalDate today = java.time.LocalDate.now(ZONE_VN);
        List<Long> notCheckedOut = userRepository.findUserIdsMissingCheckoutToday(today);
        for (Long userId : notCheckedOut) {
            createNotification(userId, "CHECK_OUT_REMINDER", "Nhắc nhở Check-out",
                    "Bạn chưa check-out. Vui lòng check-out trước 20:00.");
        }
        log.info("Sent check-out reminders to {} users", notCheckedOut.size());
    }

    @Transactional
    public void createNotification(Long userId, String type, String title, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "Không tìm thấy người dùng"));

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .build();

        notificationRepository.save(notification);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .sentAt(n.getSentAt())
                .isRead(n.getIsRead())
                .build();
    }
}
