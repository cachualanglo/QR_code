package com.attendance.controller;

import com.attendance.dto.response.NotificationResponse;
import com.attendance.dto.response.MessageResponse;
import com.attendance.entity.User;
import com.attendance.repository.UserRepository;
import com.attendance.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    /**
     * Danh sách thông báo của user
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }

    /**
     * Số thông báo chưa đọc
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        Long userId = getUserId(authentication);
        long count = notificationService.countUnread(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Đánh dấu đã đọc
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<MessageResponse> markAsRead(@PathVariable Long id, Authentication authentication) {
        Long userId = getUserId(authentication);
        notificationService.markAsRead(userId, id);
        return ResponseEntity.ok(MessageResponse.success("Đã đánh dấu đã đọc"));
    }

    private Long getUserId(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .map(User::getId)
                .orElse(1L);
    }
}
