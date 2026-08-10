package com.attendance.controller;

import com.attendance.dto.request.ShiftRequest;
import com.attendance.dto.request.UpdateLocationRequest;
import com.attendance.dto.response.DayDetailResponse;
import com.attendance.dto.response.DayStatsResponse;
import com.attendance.dto.response.ShiftResponse;
import com.attendance.entity.CompanyLocation;
import com.attendance.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ─── Shift CRUD ────────────────────────────────────────

    @GetMapping("/shifts")
    public ResponseEntity<List<ShiftResponse>> getAllShifts() {
        return ResponseEntity.ok(adminService.getAllShifts());
    }

    @PostMapping("/shifts")
    public ResponseEntity<ShiftResponse> createShift(@Valid @RequestBody ShiftRequest request) {
        return ResponseEntity.ok(adminService.createShift(request));
    }

    @PutMapping("/shifts/{id}")
    public ResponseEntity<ShiftResponse> updateShift(
            @PathVariable Long id,
            @Valid @RequestBody ShiftRequest request) {
        return ResponseEntity.ok(adminService.updateShift(id, request));
    }

    @DeleteMapping("/shifts/{id}")
    public ResponseEntity<Void> deleteShift(@PathVariable Long id) {
        adminService.deleteShift(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Location ───────────────────────────────────────────

    @PutMapping("/location")
    public ResponseEntity<CompanyLocation> updateLocation(@Valid @RequestBody UpdateLocationRequest request) {
        return ResponseEntity.ok(adminService.updateLocation(request));
    }

    @GetMapping("/location")
    public ResponseEntity<CompanyLocation> getLocation() {
        return ResponseEntity.ok(adminService.getLocation());
    }

    // ─── Employees ──────────────────────────────────────────

    @GetMapping("/employees")
    public ResponseEntity<List<Map<String, Object>>> getEmployees() {
        List<Map<String, Object>> employees = adminService.getAllEmployees().stream()
                .map(e -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", e.getId());
                    map.put("employeeCode", e.getEmployeeCode());
                    map.put("username", e.getUsername());
                    map.put("role", e.getRole());
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/employees/{userId}/stats")
    public ResponseEntity<List<DayStatsResponse>> getEmployeeStats(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(adminService.getEmployeeStats(userId, startDate, endDate));
    }

    @GetMapping("/employees/{userId}/detail")
    public ResponseEntity<DayDetailResponse> getEmployeeDayDetail(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(adminService.getEmployeeDayDetail(userId, date));
    }
}
