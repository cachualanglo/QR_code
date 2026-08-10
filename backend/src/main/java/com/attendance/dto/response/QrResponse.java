package com.attendance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrResponse {

    private String token;          // UUID string
    private Long shiftId;          // ID ca làm việc
    private String shiftName;      // Tên ca (VD: Ca sáng)
    private Long expiresIn;        // Số giây còn lại
    private Long expiresAt;        // Thời điểm hết hạn (epoch millis)
}
