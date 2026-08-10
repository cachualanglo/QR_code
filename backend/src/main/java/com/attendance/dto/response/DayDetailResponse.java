package com.attendance.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DayDetailResponse {

    private LocalDate date;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;

    // Check-in details
    private Double checkInLat;
    private Double checkInLng;
    private Double checkInDistanceM;
    private Double checkInAccuracy;

    // Check-out details
    private Double checkOutLat;
    private Double checkOutLng;
    private Double checkOutDistanceM;
    private Double checkOutAccuracy;

    private String status;  // ON_TIME, LATE, ABSENT, DAY_OFF, MISSING_CHECKOUT, IN_PROGRESS
}
