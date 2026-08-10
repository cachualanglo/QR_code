package com.attendance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "attendance_record")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    // ===== Check-in fields =====
    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_in_lat")
    private Double checkInLat;

    @Column(name = "check_in_lng")
    private Double checkInLng;

    @Column(name = "check_in_distance_m")
    private Double checkInDistanceM;

    @Column(name = "check_in_accuracy")
    private Double checkInAccuracy;

    @Column(name = "check_in_qr_token")
    private UUID checkInQrToken;

    // ===== Check-out fields =====
    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    @Column(name = "check_out_lat")
    private Double checkOutLat;

    @Column(name = "check_out_lng")
    private Double checkOutLng;

    @Column(name = "check_out_distance_m")
    private Double checkOutDistanceM;

    @Column(name = "check_out_accuracy")
    private Double checkOutAccuracy;

    @Column(name = "check_out_qr_token")
    private UUID checkOutQrToken;

    // ===== Shift & Status fields =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id")
    private Shift shift;

    @Column(name = "late_minutes", nullable = false)
    @Builder.Default
    private int lateMinutes = 0;

    @Column(name = "early_leave_minutes", nullable = false)
    @Builder.Default
    private int earlyLeaveMinutes = 0;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "PRESENT";
}
