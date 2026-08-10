package com.attendance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "company_location")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    @Column(name = "radius_meters", nullable = false)
    @Builder.Default
    private Integer radiusMeters = 10;

    // Cấu hình giờ check-in
    @Column(name = "check_in_start", nullable = false)
    @Builder.Default
    private LocalTime checkInStart = LocalTime.of(7, 30);

    @Column(name = "check_in_end", nullable = false)
    @Builder.Default
    private LocalTime checkInEnd = LocalTime.of(9, 0);

    // Cấu hình giờ check-out
    @Column(name = "check_out_start", nullable = false)
    @Builder.Default
    private LocalTime checkOutStart = LocalTime.of(16, 30);

    @Column(name = "check_out_end", nullable = false)
    @Builder.Default
    private LocalTime checkOutEnd = LocalTime.of(20, 0);

    // Giờ chuẩn check-in (dùng để tính ON_TIME / LATE)
    @Column(name = "standard_checkin_time", nullable = false)
    @Builder.Default
    private LocalTime standardCheckinTime = LocalTime.of(8, 30);

    // Giờ làm việc
    @Column(name = "work_day_start", nullable = false)
    @Builder.Default
    private LocalTime workDayStart = LocalTime.of(8, 0);

    @Column(name = "work_day_end", nullable = false)
    @Builder.Default
    private LocalTime workDayEnd = LocalTime.of(17, 30);

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
