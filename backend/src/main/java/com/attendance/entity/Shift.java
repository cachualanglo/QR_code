package com.attendance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalTime;
import java.time.ZonedDateTime;

@Entity
@Table(name = "shift")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "checkin_cutoff", nullable = false)
    private LocalTime checkinCutoff;

    @Column(name = "qr_rotation_seconds", nullable = false)
    @Builder.Default
    private int qrRotationSeconds = 300;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    /**
     * Kiểm tra thời điểm hiện tại có nằm trong ca làm việc không
     */
    public boolean isWithinShiftTime(LocalTime now) {
        if (!now.isBefore(startTime) && !now.isAfter(endTime)) {
            return true;
        }
        // Xử lý ca qua đêm (VD: 22:00 → 06:00)
        if (startTime.isAfter(endTime)) {
            return !now.isAfter(endTime) || !now.isBefore(startTime);
        }
        return false;
    }

    /**
     * Kiểm tra có thể check-in không (chưa quá cutoff)
     */
    public boolean canCheckIn(LocalTime now) {
        return !now.isAfter(checkinCutoff);
    }

    /**
     * Tính số phút đi muộn (0 = đúng giờ)
     */
    public int calculateLateMinutes(LocalTime checkInTime) {
        if (!checkInTime.isAfter(startTime)) {
            return 0;
        }
        return (int) java.time.Duration.between(startTime, checkInTime).toMinutes();
    }

    /**
     * Tính số phút về sớm (0 = đúng giờ)
     */
    public int calculateEarlyLeaveMinutes(LocalTime checkOutTime) {
        if (!checkOutTime.isBefore(endTime)) {
            return 0;
        }
        return (int) java.time.Duration.between(checkOutTime, endTime).toMinutes();
    }
}
