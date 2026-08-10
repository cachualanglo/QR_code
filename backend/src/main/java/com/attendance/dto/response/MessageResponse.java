package com.attendance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {

    private Boolean ok;
    private String message;

    public static MessageResponse success(String message) {
        return MessageResponse.builder().ok(true).message(message).build();
    }
}
