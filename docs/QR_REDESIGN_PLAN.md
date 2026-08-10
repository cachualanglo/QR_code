# Plan Redesign Hệ thống QR Chấm Công

## Tổng quan thay đổi

| | HIỆN TẠI | MỚI |
|---|---|---|
| QR tạo bởi | Admin bấm "Tạo QR" | Backend tự sinh theo ca (on-demand) |
| QR lưu ở | PostgreSQL (`qr_sessions`) | Redis (TTL tự hết hạn) |
| QR type | CHECK_IN / CHECK_OUT (admin chọn) | Random token (backend tự xác định) |
| QR xoay vòng | Không | Tự rotate mỗi 60s |
| Ca làm việc | Hardcode trong `company_location` | Entity `shift` riêng |
| Endpoint scan | `POST /api/attendance` (qrToken + GPS) | `POST /api/attendance/scan` (chỉ token) |
| Cutoff | Không có | Có (sau cutoff không nhận check-in mới) |
| Tính công | ON_TIME / LATE đơn giản | LATE + EARLY_LEAVE + chi tiết phút |
| Admin thao tác | Tạo QR thủ công | Chỉ cấu hình ca/lịch |
| **Kiosk** | **Không có** | **`/kiosk/attendance` — màn hình QR cố định** |
| **GPS** | **Bắt buộc** | **Phase 1 bỏ qua, làm sau** |
| **Admin xem QR** | **Trang Admin QR** | **Nút "Mở Kiosk" → mở `/kiosk/attendance`** |

---

## Kiến trúc Kiosk

```text
ADMIN                          KIOSK                         EMPLOYEE
│                               │                               │
├── Dashboard                   │                               │
├── Ca làm việc                 │                               │
├── Nhân viên                   │                               │
│                               │                               │
└── [Mở Kiosk] ────────────────→ /kiosk/attendance              │
                                │                               │
                    GET /api/attendance/qr/current               │
                                │                               │
                    Backend kiểm tra Redis                       │
                      ├── Có token còn hạn → trả về             │
                      └── Token hết hạn → tạo mới               │
                                │                               │
                    Hiển thị QR + Countdown                     │
                                │                               │
                                │          Đăng nhập Employee   │
                                │                    │          │
                                │                    ▼          │
                                │              [Quét QR]        │
                                │                    │          │
                                │                    ▼          │
                                │    POST /api/attendance/scan  │
                                │                    │          │
                                │                    ▼          │
                                │         Backend xác thực      │
                                │         CHECK-IN/CHECK-OUT    │
```

### Nguyên tắc Kiosk

1. **Kiosk không phải tài khoản Admin** — URL mở trực tiếp, không cần đăng nhập
2. **QR do Backend sinh** — Frontend chỉ gọi `GET /api/attendance/qr/current`
3. **QR tự rotate** — Token hết hạn → lần request tiếp theo tự tạo mới
4. **QR chỉ hoạt động trong ca** — Ngoài ca → hiển thị "Không có ca"
5. **Admin mở Kiosk từ Dashboard** — Nút link sang `/kiosk/attendance`
6. **GPS chưa làm ở Phase 1** — Bỏ qua validation GPS ban đầu

---

## Phase 1: Infrastructure — Redis + Docker

### 1.1 Thêm Redis vào Docker Compose

```yaml
# docker-compose.template.yml — thêm service redis
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

### 1.2 Thêm Redis dependency vào `pom.xml`

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

### 1.3 Cấu hình Redis trong `application.properties`

```properties
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.timeout=5000
```

### Files sửa:
- `docker-compose.template.yml`
- `backend/pom.xml`
- `backend/src/main/resources/application.properties`

---

## Phase 2: Entity Shift + Migration

### 2.1 Entity `Shift`

```
shift
------
id              BIGSERIAL PK
name            VARCHAR 100 (VD: "Ca sáng", "Ca chiều")
start_time      TIME (VD: 08:00)
end_time        TIME (VD: 12:00)
checkin_cutoff  TIME (VD: 10:00)  -- sau giờ này không nhận check-in mới
qr_rotation_seconds INT DEFAULT 60 -- chu kỳ xoay QR
is_active       BOOLEAN DEFAULT TRUE
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### 2.2 Migration `V3__add_shift_and_refactor.sql`

```sql
-- Bảng shift mới
CREATE TABLE shift (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    checkin_cutoff  TIME NOT NULL,
    qr_rotation_seconds INT NOT NULL DEFAULT 60,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Thêm shift_id vào attendance_record
ALTER TABLE attendance_record
    ADD COLUMN shift_id BIGINT REFERENCES shift(id),
    ADD COLUMN late_minutes INT DEFAULT 0,
    ADD COLUMN early_leave_minutes INT DEFAULT 0,
    ADD COLUMN status VARCHAR(20) DEFAULT 'PRESENT';

-- Unique constraint: 1 nhân viên chỉ 1 attendance/ngày/ca
ALTER TABLE attendance_record
    ADD CONSTRAINT uq_attendance_user_date_shift
    UNIQUE (user_id, record_date, shift_id);

-- Xóa bảng qr_sessions (thay bằng Redis)
DROP TABLE IF EXISTS qr_sessions;

-- Seed: Ca sáng
INSERT INTO shift (name, start_time, end_time, checkin_cutoff, qr_rotation_seconds)
VALUES ('Ca sáng', '08:00', '12:00', '10:00', 60);
```

### Files tạo/sửa:
- `backend/src/main/java/com/attendance/entity/Shift.java` (MỚI)
- `backend/src/main/java/com/attendance/repository/ShiftRepository.java` (MỚI)
- `backend/src/main/resources/db/migration/V3__add_shift_and_refactor.sql` (MỚI)
- `backend/src/main/java/com/attendance/entity/AttendanceRecord.java` (thêm shiftId, lateMinutes, earlyLeaveMinutes, status)

---

## Phase 3: QR Service — Chuyển sang Redis (On-Demand)

> **Quan trọng:** Phase 1 KHÔNG dùng Scheduler. Backend tự sinh QR khi có request `GET /api/attendance/qr/current`. Đơn giản hơn, không cần distributed lock.

### 3.1 Redis QR Repository

```java
@Service
public class QrRedisRepository {
    private final StringRedisTemplate redis;

    // Key pattern: qr:{location}
    // Value: JSON { token, shiftId, expiresAt }
    // TTL: set by rotation seconds

    public void saveToken(String token, Long shiftId, long ttlSeconds) { ... }
    public QrTokenData getToken(String token) { ... }  // null = expired/not found
    public String getCurrentToken() { ... } // token đang active
}
```

### 3.2 QrService mới — On-Demand

```java
@Service
public class QrService {
    private final QrRedisRepository qrRedis;
    private final ShiftRepository shiftRepo;

    // Frontend gọi khi mở Kiosk
    public QrResponse getCurrentQr() {
        // 1. Kiểm tra Redis có token đang active không
        String existingToken = qrRedis.getCurrentToken();
        if (existingToken != null) {
            return new QrResponse(existingToken, ttlRemaining);
        }

        // 2. Kiểm tra có ca nào đangactive không
        Shift activeShift = findActiveShift();
        if (activeShift == null) {
            throw new BusinessException("NO_ACTIVE_SHIFT", "Không có ca đang hoạt động");
        }

        // 3. Tạo token mới
        String newToken = UUID.randomUUID().toString();
        qrRedis.saveToken(newToken, activeShift.getId(), activeShift.getQrRotationSeconds());
        return new QrResponse(newToken, activeShift.getQrRotationSeconds());
    }

    // Validate khi employee scan
    public QrTokenData validateToken(String token) {
        QrTokenData data = qrRedis.getToken(token);
        if (data == null) throw new BusinessException("QR_EXPIRED", "QR đã hết hạn");
        return data;
    }
}
```

### 3.3 API

```
GET  /api/attendance/qr/current    → QrResponse (token + expiresIn)
POST /api/attendance/scan           → AttendanceResponse
```

### 3.4 Xóa cũ

- **Xóa** `QrSession.java` entity
- **Xóa** `QrSessionRepository.java`
- **Xóa** `GenerateQrRequest.java`
- **Sửa** `QrController.java` — xóa POST /qr/generate, thêm GET /attendance/qr/current
- **Sửa** `QrResponse.java` — chứa token, expiresIn, shiftName

### Files tạo/sửa/xóa:
- `backend/.../repository/QrRedisRepository.java` (MỚI)
- `backend/.../service/QrService.java` (VIẾT LẠI)
- `backend/.../controller/AttendanceController.java` (thêm GET /qr/current)
- `backend/.../dto/response/QrResponse.java` (SỬA)
- `backend/.../entity/QrSession.java` (XÓA)
- `backend/.../repository/QrSessionRepository.java` (XÓA)
- `backend/.../dto/request/GenerateQrRequest.java` (XÓA)

---

## Phase 4: Attendance Service — Đơn giản hóa

### 4.1 Single scan endpoint

```java
// POST /api/attendance/scan
// Request: { "token": "uuid-string" }
// Backend tự xác định: CHECK_IN hay CHECK_OUT

public AttendanceResponse scan(String token, String username) {
    // 1. Validate QR token từ Redis
    QrTokenData qrData = qrService.validateToken(token);
    Long shiftId = qrData.shiftId();

    // 2. Validate ca đang active
    Shift shift = shiftRepo.findById(shiftId).orElseThrow();
    validateShiftActive(shift);

    // 3. Kiểm tra cutoff
    LocalTime now = LocalTime.now();
    if (!hasCheckedInToday(userId, shiftId, today) && now.isAfter(shift.getCheckinCutoff())) {
        throw new BusinessException("CHECKIN_CLOSED", "Đã quá giờ check-in");
    }

    // 4. Lấy/tạo attendance record
    AttendanceRecord record = getOrCreateRecord(userId, shiftId, today);

    // 5. Xác định hành động dựa trên trạng thái
    if (record.getCheckInTime() == null) {
        return processCheckIn(record, shift, now);
    } else if (record.getCheckOutTime() == null) {
        return processCheckOut(record, shift, now);
    } else {
        throw new BusinessException("ALREADY_CHECKED_OUT", "Đã check-out rồi");
    }
}
```

### 4.2 Tính đi muộn / về sớm

```java
private AttendanceResponse processCheckIn(AttendanceRecord record, Shift shift, LocalTime now) {
    record.setCheckInTime(now);
    record.setCheckInQrToken(token);

    // Tính đi muộn
    int lateMinutes = 0;
    if (now.isAfter(shift.getStartTime())) {
        lateMinutes = (int) Duration.between(shift.getStartTime(), now).toMinutes();
    }
    record.setLateMinutes(lateMinutes);
    record.setStatus(lateMinutes > 0 ? "LATE" : "PRESENT");

    attendanceRepo.save(record);
    return new AttendanceResponse("CHECK_IN", record.getCheckInTime(), record.getStatus(), lateMinutes);
}
```

### 4.3 Response mới

```java
public record AttendanceResponse(
    String action,        // CHECK_IN | CHECK_OUT | REJECTED
    LocalTime checkInAt,
    LocalTime checkOutAt,
    String status,        // PRESENT | LATE | EARLY_LEAVE | MISSING_CHECKOUT
    int lateMinutes,
    int earlyLeaveMinutes,
    String message
) {}
```

### Files sửa:
- `backend/.../service/AttendanceService.java` (VIẾT LẠI)
- `backend/.../controller/AttendanceController.java` (sửa endpoint + request)
- `backend/.../dto/request/AttendanceRequest.java` (đơn giản hóa — chỉ có token)
- `backend/.../dto/response/AttendanceResponse.java` (thêm fields)

---

## Phase 5: Admin — Shift Management + Kiosk Link

### 5.1 Shift CRUD API

```
GET    /api/admin/shifts          → List<Shift>
POST   /api/admin/shifts          → Shift (create)
PUT    /api/admin/shifts/{id}     → Shift (update)
DELETE /api/admin/shifts/{id}     → void
```

### 5.2 Shift DTO

```java
public record ShiftRequest(
    String name,
    LocalTime startTime,
    LocalTime endTime,
    LocalTime checkinCutoff,
    int qrRotationSeconds,
    boolean isActive
) {}
```

### 5.3 Frontend — Shift Management Page

Admin trang mới: `/admin/shifts`
- Danh sách ca (toggle active/inactive)
- Form thêm/sửa ca
- Fields: tên ca, giờ bắt đầu, giờ kết thúc, cutoff, chu kỳ QR

### 5.4 Admin Dashboard — Nút "Mở Kiosk"

Admin Dashboard thêm nút:
```
[Mở màn hình QR Kiosk]  →  /kiosk/attendance (mở tab mới)
```

### Files tạo/sửa:
- `backend/.../controller/AdminController.java` (thêm shift CRUD endpoints)
- `backend/.../service/AdminService.java` (thêm shift methods)
- `backend/.../dto/request/ShiftRequest.java` (MỚI)
- `backend/.../dto/response/ShiftResponse.java` (MỚI)
- `frontend/src/pages/admin/ShiftManagementPage.tsx` (MỚI)
- `frontend/src/pages/admin/AdminDashboardPage.tsx` (thêm nút "Mở Kiosk")
- `frontend/src/components/AdminBottomNav.tsx` (thêm tab "Ca làm việc")
- `frontend/src/App.tsx` (thêm route /admin/shifts)

---

## Phase 6: Kiosk Page + QR Display

### 6.1 Kiosk Page — `/kiosk/attendance`

Trang riêng, không cần đăng nhập, mở fullscreen trên TV:

```
┌──────────────────────────────────┐
│                                  │
│          CHẤM CÔNG               │
│                                  │
│          ██████████              │
│          ██      ██              │
│          ██  QR  ██              │
│          ██      ██              │
│          ██████████              │
│                                  │
│            CỔNG CHÍNH             │
│             CA SÁNG               │
│                                  │
│            Còn 42 giây            │
│                                  │
└──────────────────────────────────┘
```

Ngoài ca:
```
┌──────────────────────────────────┐
│                                  │
│          CHẤM CÔNG               │
│                                  │
│     Hiện không có ca             │
│       đang hoạt động             │
│                                  │
└──────────────────────────────────┘
```

### 6.2 Kiosk Flow

```
Page load → GET /api/attendance/qr/current
              │
              ├── Có ca active + token còn hạn → Hiển thị QR
              ├── Có ca active + token hết hạn → Backend tạo mới → Hiển thị
              └── Không có ca → Hiển thị "Không có ca"
```

### 6.3 Frontend Refresh Strategy

- Poll `GET /api/attendance/qr/current` mỗi **5 giây**
- Khi countdown < 10s → tăng poll lên **2s** (để lấy QR mới trước khi hết hạn)
- Backend tự trả token mới khi token cũ hết hạn

### 6.4 Routes

```
/kiosk/attendance          → KioskPage (công khai, không auth)
/admin/shifts              → ShiftManagementPage (admin only)
/admin/qr                  → XÓA (thay bằng Kiosk link)
```

### Files tạo/sửa:
- `frontend/src/pages/kiosk/KioskPage.tsx` (MỚI)
- `frontend/src/components/KioskQrDisplay.tsx` (MỚI)
- `frontend/src/components/KioskCountdown.tsx` (MỚI)
- `frontend/src/hooks/useKioskQr.ts` (MỚI)
- `frontend/src/App.tsx` (thêm route /kiosk/attendance)
- `frontend/src/pages/admin/AdminQrPage.tsx` (XÓA hoặc redirect → /kiosk/attendance)

---

## Phase 7: Frontend — Employee Scan

### 7.1 Employee Flow

```
1. Đăng nhập Employee
2. Mở trang chấm công → /cham-cong
3. Bấm "Quét QR" → Camera mở
4. Scan QR trên Kiosk
5. Backend xác thực → CHECK-IN / CHECK-OUT
6. Hiển thị kết quả
```

**GPS bỏ qua ở Phase 1.** Chỉ cần token hợp lệ.

### 7.2 Attendance Status Card

Hiển thị trạng thái hiện tại của employee trong ca:
- Chưa check-in → "Chờ quét QR"
- Đã check-in → Hiển thị giờ check-in + trạng thái (Đúng giờ/Đi muộn X phút)
- Đã check-out → Hiển thị giờ check-out + tổng kết

### 7.3 Giao diện Employee

```
┌───────────────────────────────┐
│ Xin chào Nguyễn Văn A         │
│                               │
│ Hôm nay — Ca sáng              │
│                               │
│ Trạng thái: Chưa chấm công    │
│                               │
│       [ 📷 Quét QR ]          │
│                               │
└───────────────────────────────┘
```

Sau khi check-in:
```
┌───────────────────────────────┐
│ Xin chào Nguyễn Văn A         │
│                               │
│ Hôm nay — Ca sáng              │
│                               │
│ ✓ Check-in: 08:07             │
│ Trạng thái: Đi muộn (7 phút)  │
│                               │
│       [ 📷 Quét QR ]          │
│         (Check-out)            │
└───────────────────────────────┘
```

### Files sửa:
- `frontend/src/pages/HomePage.tsx` (sửa — hiển thị status card + nút Quét QR)
- `frontend/src/components/AutoQrScanner.tsx` (sửa — gọi POST /api/attendance/scan, không GPS)
- `frontend/src/lib/types.ts` (cập nhật types)
- `frontend/src/services/attendance.ts` (cập nhật API calls)

---

## Phase 8: Cleanup & Polish

### 8.1 Xóa code cũ không dùng

- `useQrGenerator.ts` (hook cũ)
- `GenerateQrRequest.java`
- `QrSession.java`
- `QrSessionRepository.java`

### 8.2 Cập nhật StatsService

```java
// StatsService cần cập nhật để join với shift table
// Tính ON_TIME/LATE/EARLY_LEAVE dựa trên shift times
```

### 8.3 Scheduler Notification

```java
// Cập nhật NotificationService scheduler
// Thay vì hardcode 08:25/16:25 → dựa vào shift time
// Gửi reminder trước khi ca bắt đầu 5 phút
```

---

## Thứ tự thực hiện

```
Phase 1: Redis + Docker          (1-2 giờ)
    ↓
Phase 2: Shift Entity + Migration (1 giờ)
    ↓
Phase 3: QR Service → Redis       (2-3 giờ)
    ↓
Phase 4: Attendance Service       (2-3 giờ)
    ↓
Phase 5: Admin Shift Management   (2-3 giờ)
    ↓
Phase 6: Admin QR Display         (1-2 giờ)
    ↓
Phase 7: Employee Scan            (1-2 giờ)
    ↓
Phase 8: Cleanup + Stats          (1 giờ)
```

**Tổng estimated: 12-17 giờ**

---

## Lưu ý kỹ thuật

1. **Redis cho dev**: Dùng Docker Redis (`redis:7-alpine`). Production có thể dùng AWS ElastiCache / Redis Cloud.

2. **Scheduler trong Spring Boot**: Dùng `@Scheduled` đơn giản. Nếu chạy nhiều instances → thêm ShedLock hoặc Redis distributed lock.

3. **Fallback nếu Redis down**: QrService nên có fallback — nếu Redis không available, trả lỗi rõ ràng thay vì crash.

4. **Frontend polling**: Dùng `setInterval` poll mỗi 5s. Có thể upgrade lên SSE/WebSocket sau nếu cần real-time.

5. **Backward compatibility**: Migration V3 giữ nguyên data attendance cũ (shift_id = NULL cho records cũ). StatsService cần xử lý NULL shift gracefully.

6. **Testing**: Mỗi phase test riêng trước khi qua phase tiếp theo.
