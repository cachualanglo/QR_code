package com.attendance.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequest {

    @NotBlank(message = "QR token không được để trống")
    private String token;

    // GPS data (optional, frontend should provide when available)
    @jakarta.validation.constraints.DecimalMin(value = "-90.0", inclusive = true)
    @jakarta.validation.constraints.DecimalMax(value = "90.0", inclusive = true)
    private Double latitude;

    @jakarta.validation.constraints.DecimalMin(value = "-180.0", inclusive = true)
    @jakarta.validation.constraints.DecimalMax(value = "180.0", inclusive = true)
    private Double longitude;

    @jakarta.validation.constraints.DecimalMin(value = "0.0", inclusive = true)
    private Double accuracy;
}
