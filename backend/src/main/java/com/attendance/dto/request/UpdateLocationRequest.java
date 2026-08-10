package com.attendance.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLocationRequest {

    @NotNull(message = "Vĩ độ không được để trống")
    private Double latitude;

    @NotNull(message = "Kinh độ không được để trống")
    private Double longitude;

    @Positive(message = "Bán kính phải lớn hơn 0")
    private Integer radiusMeters = 10;

    // Cấu hình giờ check-in
    private LocalTime checkInStart;
    private LocalTime checkInEnd;

    // Cấu hình giờ check-out
    private LocalTime checkOutStart;
    private LocalTime checkOutEnd;

    // Giờ chuẩn
    private LocalTime standardCheckinTime;

    // Giờ làm việc
    private LocalTime workDayStart;
    private LocalTime workDayEnd;
}
