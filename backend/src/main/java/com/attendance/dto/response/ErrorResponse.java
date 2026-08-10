package com.attendance.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private String error;
    private String code;
    private String message;
    private LocalDateTime timestamp;

    public ErrorResponse(String error, String code, String message) {
        this.error = error;
        this.code = code;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
}
