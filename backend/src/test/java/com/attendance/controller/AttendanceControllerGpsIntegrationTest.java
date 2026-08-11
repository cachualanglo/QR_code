package com.attendance.controller;

import com.attendance.dto.request.AttendanceRequest;
import com.attendance.dto.response.AttendanceResponse;
import com.attendance.exception.BusinessException;
import com.attendance.monitor.RateLimiterService;
import com.attendance.security.JwtAuthenticationFilter;
import com.attendance.service.AttendanceService;
import com.attendance.service.QrService;
import com.attendance.service.StatsService;
import com.attendance.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import org.junit.jupiter.api.AfterEach;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@WebMvcTest(controllers = AttendanceController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@DisplayName("POST /api/attendance/scan — GPS payload integration")
class AttendanceControllerGpsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

        @MockBean
        private AttendanceService attendanceService;

        @MockBean
        private StatsService statsService;

        @MockBean
        private UserRepository userRepository;

        @MockBean
        private QrService qrService;

        @MockBean
        private RateLimiterService rateLimiterService;

        @MockBean
        private JwtAuthenticationFilter jwtAuthenticationFilter;

    private AttendanceResponse mockResponse;

    @BeforeEach
    void setUp() {
        var authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("user1", null, authorities));

        mockResponse = AttendanceResponse.builder()
                .action("CHECK_IN")
                .checkInAt(LocalTime.now())
                .status("PRESENT")
                .lateMinutes(0)
                .earlyLeaveMinutes(0)
                .message("Check-in thành công")
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Scan with GPS payload → 200 OK")
    void scan_withGpsPayload_returnsOk() throws Exception {
        when(attendanceService.scan(any(AttendanceRequest.class), eq("user1")))
                .thenReturn(mockResponse);

        AttendanceRequest request = new AttendanceRequest();
        request.setToken("valid-token-123");
        request.setLatitude(10.7769);
        request.setLongitude(106.7009);
        request.setAccuracy(10.0);

        mockMvc.perform(post("/api/attendance/scan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.action").value("CHECK_IN"))
                .andExpect(jsonPath("$.status").value("PRESENT"))
                .andExpect(jsonPath("$.message").value("Check-in thành công"));

        verify(attendanceService).scan(any(AttendanceRequest.class), eq("user1"));
    }

    @Test
    @DisplayName("Scan without GPS fields → 200 OK (GPS optional)")
    void scan_withoutGpsPayload_returnsOk() throws Exception {
        when(attendanceService.scan(any(AttendanceRequest.class), eq("user1")))
                .thenReturn(mockResponse);

        AttendanceRequest request = new AttendanceRequest();
        request.setToken("valid-token-456");

        mockMvc.perform(post("/api/attendance/scan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.action").value("CHECK_IN"));

        verify(attendanceService).scan(any(AttendanceRequest.class), eq("user1"));
    }

    @Test
    @DisplayName("Scan with out-of-range GPS → 422 GEO_OUT_OF_RANGE")
    void scan_outOfRange_returnsUnprocessable() throws Exception {
        when(attendanceService.scan(any(AttendanceRequest.class), eq("user1")))
                .thenThrow(new BusinessException(
                        "GEO_OUT_OF_RANGE",
                        "GPS location is outside the allowed geofence (distance: 1500.0m, max: 500m)"
                ));

        AttendanceRequest request = new AttendanceRequest();
        request.setToken("valid-token-789");
        request.setLatitude(11.0);
        request.setLongitude(107.0);
        request.setAccuracy(10.0);

        mockMvc.perform(post("/api/attendance/scan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @DisplayName("Scan with empty token → 400 Bad Request")
    void scan_emptyToken_returnsBadRequest() throws Exception {
        AttendanceRequest request = new AttendanceRequest();
        request.setToken("");

        mockMvc.perform(post("/api/attendance/scan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
