package com.attendance.service;

import com.attendance.entity.CompanyLocation;
import com.attendance.entity.Shift;
import com.attendance.repository.AttendanceRecordRepository;
import com.attendance.repository.CompanyLocationRepository;
import com.attendance.repository.ShiftRepository;
import com.attendance.repository.UserRepository;
import com.attendance.dto.request.AttendanceRequest;
import com.attendance.dto.response.QrTokenData;
import com.attendance.entity.User;
import com.attendance.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class AttendanceServiceGpsTests {

    @Test
    void distanceToCompany_withinRadius_shouldReturnZeroWhenSameLocation() {
        AttendanceRecordRepository arRepo = Mockito.mock(AttendanceRecordRepository.class);
        CompanyLocationRepository clRepo = Mockito.mock(CompanyLocationRepository.class);
        UserRepository userRepo = Mockito.mock(UserRepository.class);
        ShiftRepository shiftRepo = Mockito.mock(ShiftRepository.class);
        com.attendance.service.QrService qrService = Mockito.mock(com.attendance.service.QrService.class);

        AttendanceService service = new AttendanceService(arRepo, clRepo, userRepo, shiftRepo, qrService);

        CompanyLocation loc = new CompanyLocation();
        loc.setLatitude(10.0);
        loc.setLongitude(106.0);
        loc.setRadiusMeters(50);
        Mockito.when(clRepo.findFirstByOrderByIdAsc()).thenReturn(Optional.of(loc));

        Double dist = service.distanceToCompany(10.0, 106.0);
        assertEquals(0.0, dist);
    }

    @Test
    void distanceToCompany_nulls_shouldReturnNull() {
        AttendanceRecordRepository arRepo = Mockito.mock(AttendanceRecordRepository.class);
        CompanyLocationRepository clRepo = Mockito.mock(CompanyLocationRepository.class);
        UserRepository userRepo = Mockito.mock(UserRepository.class);
        ShiftRepository shiftRepo = Mockito.mock(ShiftRepository.class);
        com.attendance.service.QrService qrService = Mockito.mock(com.attendance.service.QrService.class);

        AttendanceService service = new AttendanceService(arRepo, clRepo, userRepo, shiftRepo, qrService);

        assertNull(service.distanceToCompany(null, 106.0));
        assertNull(service.distanceToCompany(10.0, null));
    }

    @Test
    void geofence_shouldThrowWhenOutsideRadius_viaReflection() throws Exception {
        AttendanceRecordRepository arRepo = Mockito.mock(AttendanceRecordRepository.class);
        CompanyLocationRepository clRepo = Mockito.mock(CompanyLocationRepository.class);
        UserRepository userRepo = Mockito.mock(UserRepository.class);
        ShiftRepository shiftRepo = Mockito.mock(ShiftRepository.class);
        com.attendance.service.QrService qrService = Mockito.mock(com.attendance.service.QrService.class);

        AttendanceService service = new AttendanceService(arRepo, clRepo, userRepo, shiftRepo, qrService);

        CompanyLocation loc = new CompanyLocation();
        loc.setLatitude(10.0);
        loc.setLongitude(106.0);
        loc.setRadiusMeters(50);
        Mockito.when(clRepo.findFirstByOrderByIdAsc()).thenReturn(Optional.of(loc));

        User user = new User(); user.setId(1L); user.setUsername("user");
        Shift shift = Shift.builder().id(1L).name("S1").startTime(LocalTime.of(9,0)).endTime(LocalTime.of(17,0)).checkinCutoff(LocalTime.of(17,0)).build();
        org.mockito.Mockito.when(clRepo.findFirstByOrderByIdAsc()).thenReturn(Optional.of(loc));

        // Prepare inputs for reflection call
        LocalDate today = LocalDate.now();
        String qrToken = java.util.UUID.randomUUID().toString();
        Long userId = 1L;
        Double lat = 60.0; // far away
        Double lon = 60.0;
        Double acc = 5.0;

        java.lang.reflect.Method m = AttendanceService.class.getDeclaredMethod("processCheckIn", User.class, Shift.class, LocalDate.class, String.class, Long.class, Double.class, Double.class, Double.class);
        m.setAccessible(true);
        java.lang.Throwable ex = assertThrows(java.lang.reflect.InvocationTargetException.class, () -> {
            m.invoke(service, user, shift, today, qrToken, userId, lat, lon, acc);
        });
        assertTrue(ex.getCause() instanceof BusinessException);
        assertEquals("GEO_OUT_OF_RANGE", ((BusinessException) ex.getCause()).getCode());
    }
}
