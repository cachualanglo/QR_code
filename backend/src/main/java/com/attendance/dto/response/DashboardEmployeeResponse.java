package com.attendance.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Dashboard response for a single employee merged with attendance data.
 * Used by GET /api/admin/dashboard to show all employees with their status.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardEmployeeResponse {

    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private String status;          // ABSENT, ON_TIME, LATE, CHECKED_IN, COMPLETED, MISSING_CHECKOUT, DAY_OFF
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private int lateMinutes;
    private int earlyLeaveMinutes;
}
