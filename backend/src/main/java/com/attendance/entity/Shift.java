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
    private int qrRotationSeconds = 60;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    /** Default checkout window: 60 minutes after endTime */
    private static final int DEFAULT_CHECKOUT_WINDOW_MINUTES = 60;

    /**
     * Kiểm tra thời điểm hiện tại có nằm trong ca làm việc + checkout window không.
     * QR vẫn được sinh trong checkout window để employee có thể check-out.
     */
    public boolean isWithinShiftTime(LocalTime now) {
        // Normal shift window: startTime <= now <= endTime
        if (!now.isBefore(startTime) && !now.isAfter(endTime)) {
            return true;
        }
        // Checkout window: endTime < now <= endTime + 30min
        if (!now.isAfter(endTime.plusMinutes(DEFAULT_CHECKOUT_WINDOW_MINUTES))) {
            return true;
        }
        // Overnight shift (VD: 22:00 → 06:00)
        if (startTime.isAfter(endTime)) {
            LocalTime checkoutEnd = endTime.plusMinutes(DEFAULT_CHECKOUT_WINDOW_MINUTES);
            return !now.isAfter(checkoutEnd) || !now.isBefore(startTime);
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
     * Kiểm tra có thể check-out không.
     * Check-out allowed from startTime until endTime + grace period.
     */
    public boolean canCheckOut(LocalTime now) {
        if (now.isBefore(startTime)) {
            return false; // before shift starts
        }
        return !now.isAfter(endTime.plusMinutes(DEFAULT_CHECKOUT_WINDOW_MINUTES));
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
