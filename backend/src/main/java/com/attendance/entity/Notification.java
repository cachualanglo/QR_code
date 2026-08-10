package com.attendance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "type", nullable = false, length = 30)
    private String type;  // CHECKIN_REMINDER / CHECKOUT_REMINDER

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "sent_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime sentAt = LocalDateTime.now();

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;

    public void markAsRead() {
        this.readAt = LocalDateTime.now();
        this.isRead = true;
    }

    @PrePersist
    protected void onCreate() {
        this.sentAt = LocalDateTime.now();
    }
}
