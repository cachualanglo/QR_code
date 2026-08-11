package com.attendance.dto.response;

import com.attendance.entity.Shift;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftResponse {

    private Long id;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalTime checkinCutoff;
    private int qrRotationSeconds;
    @JsonProperty("isActive")
    private boolean isActive;

    public static ShiftResponse fromEntity(Shift shift) {
        return ShiftResponse.builder()
                .id(shift.getId())
                .name(shift.getName())
                .startTime(shift.getStartTime())
                .endTime(shift.getEndTime())
                .checkinCutoff(shift.getCheckinCutoff())
                .qrRotationSeconds(shift.getQrRotationSeconds())
                .isActive(shift.isActive())
                .build();
    }
}