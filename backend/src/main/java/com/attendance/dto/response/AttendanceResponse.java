package com.attendance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceResponse {

    private String action;            // CHECK_IN / CHECK_OUT
    private LocalTime checkInAt;      // Thời gian check-in
    private LocalTime checkOutAt;     // Thời gian check-out
    private String status;            // PRESENT / LATE / EARLY_LEAVE
    private int lateMinutes;          // Số phút đi muộn (0 = đúng giờ)
    private int earlyLeaveMinutes;    // Số phút về sớm (0 = đúng giờ)
    private String message;
}
