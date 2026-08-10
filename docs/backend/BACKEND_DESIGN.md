# BACKEND DESIGN — MOD-01 Chấm Công QR (v2 Hoàn Chỉnh)

> Tổng hợp luồng, chức năng, business rules và cấu trúc code BE.
> **Phiên bản:** v2 — Tích hợp bản gốc + phân tích bổ sung sửa lỗi.
> Dựa trên: OpenAPI `docs/api/openapi.yaml` + Flyway `V1__init_schema.sql` + Requirement `MOD-01/requirement.md` + Phân tích bổ sung.
>
> **Cải tiến chính so với v1:**
> - QR động (UUID + TTL 15s + one-time use) thay vì QR tĩnh
> - GPS + accuracy validation (cho phép sai số thiết bị)
> - Khung giờ check-in/check-out cấu hình được
> - Refresh token stateful (DB, hỗ trợ revoke)
> - Bảng notifications + cronjob nhắc nhở
> - Stats status chính xác hơn (IN_PROGRESS, MISSING_CHECKOUT)

---

## 1. Database Schema (6 bảng)

```
┌──────────────┐  ┌─────────────────────┐  ┌──────────────────────┐
│    users     │  │  company_location    │  │  attendance_record   │
├──────────────┤  ├─────────────────────┤  ├──────────────────────┤
│ id (PK)      │  │ id (PK)             │  │ id (PK)              │
│ employee_code│  │ latitude            │  │ user_id (FK→users)   │
│ username     │  │ longitude           │  │ record_date          │
│ password_hash│  │ radius_meters       │  │ check_in_time/lat/lng│
│ role         │  │ check_in_start/end  │  │ check_in_distance_m  │
│ created_at   │  │ check_out_start/end │  │ check_in_accuracy    │
└──────────────┘  │ standard_checkin_time│  │ check_in_qr_token    │
                  │ work_day_start/end   │  │ check_out_time/lat/lng│
                  │ updated_at           │  │ check_out_distance_m │
                  └─────────────────────┘  │ check_out_accuracy   │
                                           │ check_out_qr_token   │
┌──────────────┐  ┌─────────────────────┐  │ UNIQUE(user_id, date)│
│ qr_sessions  │  │  refresh_tokens     │  └──────────────────────┘
├──────────────┤  ├─────────────────────┤
│ id (PK)      │  │ id (PK)             │  ┌──────────────────────┐
│ token (UUID) │  │ user_id (FK→users)  │  │   notifications      │
│ type         │  │ token_hash          │  ├──────────────────────┤
│ issued_at    │  │ expires_at          │  │ id (PK)              │
│ expires_at   │  │ revoked_at          │  │ user_id (FK→users)   │
│ used_at      │  │ replaced_by_token_id│  │ type                 │
│ used_by_uid  │  └─────────────────────┘  │ title                │
│ created_by_uid└──────────────────────────│ message              │
                                           │ sent_at / read_at    │
                                           │ is_read              │
                                           └──────────────────────┘
```

---

### 1.1. Bảng `users` (giữ nguyên)

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| id | BIGSERIAL | PK | |
| employee_code | VARCHAR(20) | NOT NULL, UNIQUE | Mã NV, VD: NV001 |
| username | VARCHAR(50) | NOT NULL, UNIQUE | Tên đăng nhập |
| password_hash | VARCHAR(255) | NOT NULL | BCrypt hash |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'EMPLOYEE' | EMPLOYEE / ADMIN |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

### 1.2. Bảng `company_location` (thêm cấu hình giờ giấc)

```sql
CREATE TABLE company_location (
    id BIGSERIAL PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters INT NOT NULL DEFAULT 10,
    check_in_start TIME NOT NULL DEFAULT '07:30',
    check_in_end TIME NOT NULL DEFAULT '09:00',
    check_out_start TIME NOT NULL DEFAULT '16:30',
    check_out_end TIME NOT NULL DEFAULT '20:00',
    standard_checkin_time TIME NOT NULL DEFAULT '08:30',
    work_day_start TIME NOT NULL DEFAULT '08:00',
    work_day_end TIME NOT NULL DEFAULT '17:30',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| id | BIGSERIAL | PK | |
| latitude | DOUBLE PRECISION | NOT NULL | Vĩ độ |
| longitude | DOUBLE PRECISION | NOT NULL | Kinh độ |
| radius_meters | INT | NOT NULL, DEFAULT 10 | Bán kính cho phép (m) |
| check_in_start | TIME | NOT NULL, DEFAULT '07:30' | Bắt đầu khung giờ check-in |
| check_in_end | TIME | NOT NULL, DEFAULT '09:00' | Kết thúc khung giờ check-in |
| check_out_start | TIME | NOT NULL, DEFAULT '16:30' | Bắt đầu khung giờ check-out |
| check_out_end | TIME | NOT NULL, DEFAULT '20:00' | Kết thúc khung giờ check-out |
| standard_checkin_time | TIME | NOT NULL, DEFAULT '08:30' | Giờ chuẩn → tính ON_TIME/LATE |
| work_day_start | TIME | NOT NULL, DEFAULT '08:00' | Bắt đầu giờ làm việc |
| work_day_end | TIME | NOT NULL, DEFAULT '17:30' | Kết thúc giờ làm việc |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

> **Quy tắc:** Chỉ 1 dòng duy nhất (single-location). Cấu hình giờ có thể thay đổi qua Admin API mà không cần deploy lại.

---

### 1.3. Bảng `attendance_record` (thêm accuracy, qr_token)

```sql
CREATE TABLE attendance_record (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    record_date DATE NOT NULL,
    check_in_time TIMESTAMPTZ NULL,
    check_in_lat DOUBLE PRECISION NULL,
    check_in_lng DOUBLE PRECISION NULL,
    check_in_distance_m DOUBLE PRECISION NULL,
    check_in_accuracy DOUBLE PRECISION NULL,
    check_in_qr_token UUID NULL,
    check_out_time TIMESTAMPTZ NULL,
    check_out_lat DOUBLE PRECISION NULL,
    check_out_lng DOUBLE PRECISION NULL,
    check_out_distance_m DOUBLE PRECISION NULL,
    check_out_accuracy DOUBLE PRECISION NULL,
    check_out_qr_token UUID NULL,
    UNIQUE(user_id, record_date)
);
CREATE INDEX idx_attendance_user_date ON attendance_record(user_id, record_date);
```

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| id | BIGSERIAL | PK | |
| user_id | BIGINT | FK → users(id), NOT NULL | |
| record_date | DATE | NOT NULL | Ngày chấm công (timezone server) |
| check_in_time | TIMESTAMPTZ | NULLABLE | Giờ vào |
| check_in_lat | DOUBLE PRECISION | NULLABLE | Vĩ độ khi check-in |
| check_in_lng | DOUBLE PRECISION | NULLABLE | Kinh độ khi check-in |
| check_in_distance_m | DOUBLE PRECISION | NULLABLE | Khoảng cách tới CT (m) |
| check_in_accuracy | DOUBLE PRECISION | NULLABLE | Sai số GPS khi check-in (m) |
| check_in_qr_token | UUID | NULLABLE | QR token đã dùng để check-in |
| check_out_time | TIMESTAMPTZ | NULLABLE | Giờ ra |
| check_out_lat | DOUBLE PRECISION | NULLABLE | Vĩ độ khi check-out |
| check_out_lng | DOUBLE PRECISION | NULLABLE | Kinh độ khi check-out |
| check_out_distance_m | DOUBLE PRECISION | NULLABLE | Khoảng cách tới CT (m) |
| check_out_accuracy | DOUBLE PRECISION | NULLABLE | Sai số GPS khi check-out (m) |
| check_out_qr_token | UUID | NULLABLE | QR token đã dùng để check-out |
| UNIQUE(user_id, record_date) | | | 1 người / 1 ngày |

---

### 1.4. Bảng `qr_sessions` (mới — quản lý QR động)

```sql
CREATE TABLE qr_sessions (
    id BIGSERIAL PRIMARY KEY,
    token UUID NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ NULL,
    used_by_user_id BIGINT NULL REFERENCES users(id),
    created_by_user_id BIGINT NOT NULL REFERENCES users(id)
);
CREATE INDEX idx_qr_sessions_token ON qr_sessions(token);
CREATE INDEX idx_qr_sessions_expires ON qr_sessions(expires_at) WHERE used_at IS NULL;
```

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| id | BIGSERIAL | PK | |
| token | UUID | NOT NULL, UNIQUE | QR token ngẫu nhiên |
| type | VARCHAR(20) | NOT NULL | CHECK_IN / CHECK_OUT |
| issued_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Thời điểm tạo |
| expires_at | TIMESTAMPTZ | NOT NULL | Hết hiệu lực (issued_at + 15s) |
| used_at | TIMESTAMPTZ | NULLABLE | Thời điểm sử dụng |
| used_by_user_id | BIGINT | FK → users(id), NULLABLE | Người đã dùng |
| created_by_user_id | BIGINT | FK → users(id), NOT NULL | Người tạo QR |

---

### 1.5. Bảng `refresh_tokens` (mới — hỗ trợ revoke)

```sql
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ NULL,
    replaced_by_token_id BIGINT NULL REFERENCES refresh_tokens(id)
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
```

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| id | BIGSERIAL | PK | |
| user_id | BIGINT | FK → users(id), ON DELETE CASCADE | |
| token_hash | VARCHAR(255) | NOT NULL, UNIQUE | SHA-256(refreshToken) |
| expires_at | TIMESTAMPTZ | NOT NULL | Hết hạn (7 ngày) |
| revoked_at | TIMESTAMPTZ | NULLABLE | Thời điểm bị thu hồi |
| replaced_by_token_id | BIGINT | FK → self, NULLABLE | Token thay thế (chain) |

---

### 1.6. Bảng `notifications` (mới — lưu thông báo)

```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at TIMESTAMPTZ NULL,
    is_read BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE read_at IS NULL;
```

| Column | Type | Constraint | Mô tả |
|--------|------|------------|-------|
| id | BIGSERIAL | PK | |
| user_id | BIGINT | FK → users(id), ON DELETE CASCADE | |
| type | VARCHAR(30) | NOT NULL | CHECKIN_REMINDER / CHECKOUT_REMINDER |
| title | VARCHAR(255) | NOT NULL | Tiêu đề thông báo |
| message | TEXT | NOT NULL | Nội dung |
| sent_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Thời điểm gửi |
| read_at | TIMESTAMPTZ | NULLABLE | Thời điểm đọc |
| is_read | BOOLEAN | DEFAULT FALSE | Đã đọc chưa |

---

### 1.7. Seed Data

```sql
-- company_location: mặc định 10m, khung giờ 7:30-9:00, 16:30-20:00, standard 8:30
INSERT INTO company_location 
(latitude, longitude, radius_meters, check_in_start, check_in_end, 
 check_out_start, check_out_end, standard_checkin_time)
VALUES 
(10.7769, 106.7009, 10, '07:30', '09:00', '16:30', '20:00', '08:30');

-- users
INSERT INTO users (employee_code, username, password_hash, role) VALUES 
('ADMIN01', 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN'),
('NV001', 'nv001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'EMPLOYEE');
```

---

## 2. API Endpoints (10 endpoint, 5 module)

| # | Module | Method | Endpoint | Auth | RBAC | Mô tả |
|---|--------|--------|----------|------|------|--------|
| 1 | Auth | `POST` | `/api/auth/login` | ❌ | — | Đăng nhập |
| 2 | Auth | `POST` | `/api/auth/refresh` | ❌ | — | Làm mới token (revoke cũ) |
| 3 | Auth | `POST` | `/api/auth/logout` | ✅ | ALL | Đăng xuất (revoke refresh token) |
| 4 | QR | `GET` | `/api/qr/generate` | ✅ | ALL | Tạo QR mới (check-in/out) |
| 5 | Attendance | `POST` | `/api/attendance` | ✅ | ALL | Chấm công QR + GPS |
| 6 | Stats | `GET` | `/api/stats` | ✅ | EMPLOYEE (mình) | Thống kê tuần/tháng |
| 7 | Stats | `GET` | `/api/stats/day/{date}` | ✅ | EMPLOYEE (m mình) | Chi tiết 1 ngày |
| 8 | Admin | `PUT` | `/api/admin/company-location` | ✅ | ADMIN only | Cập nhật cấu hình công ty |
| 9 | Notification | `GET` | `/api/notifications` | ✅ | ALL | Lấy thông báo của user |
| 10 | Notification | `PUT` | `/api/notifications/{id}/read` | ✅ | ALL | Đánh dấu đã đọc |

---

## 3. Luồng chi tiết

### 🔐 3.1. Đăng nhập

```
FE → POST /api/auth/login {username, password}
  BE: check BCrypt password
  BE: generate accessToken (30p) + refreshToken (random)
  BE: lưu SHA-256(refreshToken) vào bảng refresh_tokens (expires_at = 7 ngày)
  FE ← {accessToken, refreshToken, expiresIn: 1800}
  FE: lưu token vào localStorage
```

### 🔄 3.2. Làm mới token

```
FE → POST /api/auth/refresh {refreshToken}
  BE: hash refreshToken, tìm trong DB
  BE: check revoked_at IS NULL và expires_at > now()
  BE: revoke token cũ (revoked_at = now())
  BE: generate accessToken mới + refreshToken mới
  BE: lưu refreshToken mới vào DB (replaced_by_token_id = old.id)
  FE ← {accessToken, refreshToken (mới), expiresIn}
```

### 🚪 3.3. Đăng xuất

```
FE → POST /api/auth/logout (Bearer token + body: {refreshToken})
  BE: hash refreshToken, set revoked_at = now()
  FE: xóa token khỏi localStorage
```

### 📱 3.4. Tạo QR (Endpoint mới)

```
FE → GET /api/qr/generate?type=CHECK_IN (hoặc CHECK_OUT)
  BE: validate JWT, lấy userId
  BE: tạo UUID token, set expires_at = now() + 15 giây
  BE: lưu vào bảng qr_sessions
  FE ← {token: "uuid-string", expiresIn: 15}
  FE: hiển thị mã QR (base64 hoặc image)
```

### ✅ 3.5. Chấm công (LUỒNG CHÍNH — QR động + GPS + accuracy)

```
FE → POST /api/attendance {qrToken, lat, lng, accuracy}
  │
  ├─ BE: decode JWT → userId
  │
  ├─ BE: validate qrToken:
  │    ├─ Query qr_sessions WHERE token = ?
  │    ├─ Nếu không có → 422 QR_INVALID
  │    ├─ Nếu now() > expires_at → 422 QR_EXPIRED
  │    ├─ Nếu used_at IS NOT NULL → 422 QR_ALREADY_USED
  │    ├─ Lấy type (CHECK_IN / CHECK_OUT)
  │
  ├─ BE: query company_location (1 dòng)
  │
  ├─ BE: tính khoảng cách Haversine + kiểm tra accuracy:
  │    ├─ distance = haversine(userLat, userLng, companyLat, companyLng)
  │    ├─ maxAllowed = radius_meters + max(accuracy, 5.0)  // tối thiểu 5m
  │    ├─ Nếu distance > maxAllowed → 422 LOCATION_OUT_OF_RANGE
  │    └─ Nếu accuracy quá thấp → 422 GPS_UNCERTAIN
  │
  ├─ BE: kiểm tra khung giờ:
  │    ├─ Nếu type = CHECK_IN và giờ hiện tại không nằm trong [check_in_start, check_in_end]
  │    │    → 422 OUTSIDE_CHECKIN_HOURS
  │    ├─ Tương tự với CHECK_OUT + [check_out_start, check_out_end]
  │
  ├─ BE: query attendance_record(userId, today theo timezone Asia/Ho_Chi_Minh)
  │
  ├─ Nếu type = CHECK_IN:
  │    ├─ Nếu record đã tồn tại → 409 ALREADY_CHECKED_IN
  │    └─ Else → INSERT mới (lưu time, lat, lng, distance, accuracy, qr_token)
  │
  ├─ Nếu type = CHECK_OUT:
  │    ├─ Nếu record NULL → 409 NOT_CHECKED_IN
  │    ├─ Nếu check_out_time NOT NULL → 409 ALREADY_CHECKED_OUT
  │    └─ Else → UPDATE set check_out_time, lat, lng, distance, accuracy, qr_token
  │
  ├─ BE: đánh dấu qr_sessions.used_at = now(), used_by_user_id = userId
  │
  └─ RETURN {ok: true, action: type, message, distanceMeters}
```

### 📊 3.6. Thống kê (sửa lỗi MISSING_CHECKOUT)

```
FE → GET /api/stats?mode=week|month&date=YYYY-MM-DD
  BE: extract userId từ JWT
  BE: tính khoảng ngày từ mode + date
       week: 7 ngày của tuần chứa date
       month: tất cả ngày trong tháng chứa date
  BE: query attendance_record(user_id, range)
  BE: map mỗi ngày thành DayStats:
       - T7/CN → DAY_OFF
       - Không có record → ABSENT
       - Có check_in, chưa check_out:
           ├─ record_date == today AND now() < work_day_end → IN_PROGRESS
           └─ Ngược lại → MISSING_CHECKOUT
       - Có check_in và check_out:
           ├─ check_in_time ≤ standard_checkin_time → ON_TIME
           └─ check_in_time > standard_checkin_time → LATE
  FE ← [{date, checkInTime, checkOutTime, status}, ...]
```

### 📅 3.7. Chi tiết ngày

```
FE → GET /api/stats/day/2026-08-10
  BE: extract userId từ JWT
  BE: query attendance_record(user_id, date)
  FE ← {date, checkInTime, checkOutTime, 
         checkInLat, checkInLng, checkInDistanceM, checkInAccuracy,
         checkOutLat, checkOutLng, checkOutDistanceM, checkOutAccuracy, status}
```

### 🏢 3.8. Admin cập nhật cấu hình

```
PUT /api/admin/company-location {
    latitude, longitude, radiusMeters,
    checkInStart, checkInEnd, checkOutStart, checkOutEnd,
    standardCheckinTime, workDayStart, workDayEnd
}
  BE: kiểm tra role == ADMIN →否则 403
  BE: update company_location (chỉ 1 dòng)
  BE: trả về ok: true
```

### 🔔 3.9. Thông báo

```
GET /api/notifications
  BE: query notifications(user_id) ORDER BY sent_at DESC
  FE ← [{id, type, title, message, sentAt, isRead}, ...]

PUT /api/notifications/{id}/read
  BE: UPDATE read_at = now(), is_read = TRUE
  FE ← {ok: true}
```

---

## 4. Business Rules

| Rule | Mô tả | Ở đâu |
|------|-------|-------|
| BR-01 | Giờ chuẩn lấy từ `standard_checkin_time` (mặc định 08:30) | Stats mapping |
| BR-02 | Không phạt đi trễ (chỉ hiển thị LATE, không block) | Stats |
| BR-03 | Tối đa 1 check-in và 1 check-out mỗi ngày, bắt buộc đúng loại QR | Attendance logic |
| BR-04 | QR có hiệu lực 15 giây, chỉ dùng 1 lần | QR validation |
| BR-05 | Check-in chỉ trong khung `check_in_start` → `check_in_end` | Attendance logic |
| BR-06 | Check-out chỉ trong khung `check_out_start` → `check_out_end` | Attendance logic |
| VAL-01 | GPS được chấp nhận nếu `distance ≤ radius + accuracy` | Checkin validation |
| VAL-02 | Phải có QR token hợp lệ (không hết hạn, chưa dùng) | Attendance logic |
| VAL-03 | Accuracy tối thiểu 5m (ngưỡng sàn防止 GPS quá tệ) | Checkin validation |
| PERM-01 | EMPLOYEE chỉ xem dữ liệu của mình (userId từ JWT) | Stats + Detail |

---

## 5. GPS Accuracy — Xử lý bán kính 10m

### Haversine Formula

```java
private double haversine(double lat1, double lng1, double lat2, double lng2) {
    final double R = 6_371_000; // Earth radius in meters
    double dLat = Math.toRadians(lat2 - lat1);
    double dLng = Math.toRadians(lng2 - lng1);
    double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
             + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
             * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
```

### Validate với accuracy

```java
double distance = haversine(userLat, userLng, companyLat, companyLng);
double maxAllowed = companyRadius + Math.max(accuracy, 5.0); // tối thiểu 5m

if (distance > maxAllowed) {
    throw new BusinessException("LOCATION_OUT_OF_RANGE",
        "Khoảng cách " + distance + "m vượt quá ngưỡng cho phép " + maxAllowed + "m");
}

// Nếu pass, lưu vào DB kèm accuracy và distance để audit
```

> **Lưu ý:**
> - `accuracy` là sai số GPS (ước lượng) do thiết bị cung cấp, đơn vị mét.
> - Với bán kính 10m, nếu accuracy = 15m → cho phép khoảng cách lên đến 25m (hợp lý vì GPS sai số lớn).
> - Nếu accuracy quá thấp (< 5m) nhưng thực tế vẫn có thể sai → đặt ngưỡng sàn 5m.
> - **Luôn lưu accuracy vào DB** để phục vụ kiểm tra sau.

---

## 6. Bảo mật QR (Chống replay/relay)

| Loại tấn công | Biện pháp |
|---------------|-----------|
| **Replay** (dùng lại QR cũ) | `used_at NOT NULL` → từ chối |
| **Relay** (chụp ảnh QR gửi cho người khác) | TTL = 15 giây, đủ ngắn để ngăn chuyển tiếp |
| **Giả mạo QR** | UUID ngẫu nhiên, không thể đoán |
| **Dùng QR sai loại** | Token có `type` riêng, chỉ cho phép đúng hành động tương ứng |

---

## 7. Refresh Token Stateful (Có DB)

- Access token vẫn là JWT stateless (30 phút).
- Refresh token là chuỗi ngẫu nhiên, lưu **SHA-256 hash** vào DB (`refresh_tokens`).
- Khi refresh: revoke token cũ (`revoked_at = now()`), tạo token mới → đảm bảo mỗi refresh token chỉ dùng 1 lần.
- Logout: revoke token hiện tại.
- Chain tracking: `replaced_by_token_id` theo dõi token thay thế.

---

## 8. Cronjob Thông Báo Nhắc Nhở

Sử dụng Spring `@Scheduled`:

| Thời gian | Loại | Logic |
|-----------|------|-------|
| **8:10 sáng** T2-T6 | `CHECKIN_REMINDER` | Tìm user chưa check-in hôm nay → tạo notification |
| **17:40 chiều** T2-T6 | `CHECKOUT_REMINDER` | Tìm user đã check-in nhưng chưa check-out → tạo notification |

FE gọi `GET /api/notifications` để lấy và hiển thị.

---

## 9. Stats Status Mapping

```java
public DayStats.Status mapStatus(LocalDate date, AttendanceRecord record,
                                   LocalTime standardCheckin, LocalTime workDayEnd,
                                   LocalDate today, LocalTime now) {
    DayOfWeek dow = date.getDayOfWeek();

    // T7, CN → DAY_OFF
    if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
        return Status.DAY_OFF;
    }

    // Không có record → ABSENT
    if (record == null) {
        return Status.ABSENT;
    }

    // Có check_in nhưng chưa check_out
    if (record.getCheckInTime() != null && record.getCheckOutTime() == null) {
        if (date.equals(today) && now.isBefore(workDayEnd)) {
            return Status.IN_PROGRESS;
        }
        return Status.MISSING_CHECKOUT;
    }

    // Đã check_out: so sánh check_in_time với standard_checkin_time
    LocalTime checkInLocal = record.getCheckInTime()
        .atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalTime();
    return checkInLocal.isBefore(standardCheckin) || checkInLocal.equals(standardCheckin)
        ? Status.ON_TIME
        : Status.LATE;
}
```

**Trạng thái có thể có:** `ON_TIME`, `LATE`, `ABSENT`, `DAY_OFF`, `MISSING_CHECKOUT`, `IN_PROGRESS`

---

## 10. Cấu trúc Code BE (6 Entity, 6 Repository, 6 Service, 6 Controller)

```
com.attendance/
├── AttendanceApplication.java
├── config/
│   ├── SecurityConfig.java              ← JWT filter, RBAC, whitelist
│   └── JwtConfig.java                   ← @ConfigurationProperties
├── security/
│   ├── JwtTokenProvider.java            ← generate/validate JWT
│   ├── JwtAuthenticationFilter.java     ← OncePerRequestFilter
│   └── CustomUserDetailsService.java    ← loadUserByUsername
├── entity/
│   ├── User.java
│   ├── CompanyLocation.java
│   ├── AttendanceRecord.java
│   ├── QrSession.java                   ← mới
│   ├── RefreshToken.java                ← mới
│   └── Notification.java                ← mới
├── repository/
│   ├── UserRepository.java
│   ├── CompanyLocationRepository.java
│   ├── AttendanceRecordRepository.java
│   ├── QrSessionRepository.java         ← mới
│   ├── RefreshTokenRepository.java      ← mới
│   └── NotificationRepository.java      ← mới
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── RefreshRequest.java
│   │   ├── LogoutRequest.java           ← mới
│   │   ├── AttendanceRequest.java       ← thay CheckinRequest
│   │   ├── UpdateLocationRequest.java   ← mở rộng (thêm giờ)
│   │   └── GenerateQrRequest.java       ← mới
│   └── response/
│       ├── LoginResponse.java
│       ├── AttendanceResponse.java      ← thay CheckinResponse
│       ├── QrResponse.java             ← mới
│       ├── DayStatsResponse.java
│       ├── DayDetailResponse.java
│       ├── NotificationResponse.java    ← mới
│       └── ErrorResponse.java
├── service/
│   ├── AuthService.java                 ← refresh token stateful
│   ├── QrService.java                   ← mới: tạo QR UUID + TTL
│   ├── AttendanceService.java           ← QR + GPS + accuracy + khung giờ
│   ├── StatsService.java               ← mapping status mới
│   ├── AdminService.java               ← cập nhật cấu hình giờ
│   └── NotificationScheduler.java       ← mới: cronjob nhắc nhở
├── controller/
│   ├── AuthController.java
│   ├── QrController.java               ← mới
│   ├── AttendanceController.java        ← thay CheckinController
│   ├── StatsController.java
│   ├── AdminController.java
│   └── NotificationController.java     ← mới
└── exception/
    ├── GlobalExceptionHandler.java
    └── BusinessException.java
```

### Mô tả từng lớp

| Lớp | Responsibility |
|-----|---------------|
| **SecurityConfig** | Cấu hình Spring Security: whitelist `/api/auth/**`, apply JWT filter, RBAC |
| **JwtTokenProvider** | Tạo, validate JWT; chứa secret + expiration từ `application.yml` |
| **JwtAuthenticationFilter** | `OncePerRequestFilter`: parse Authorization header, set SecurityContext |
| **JwtConfig** | `@ConfigurationProperties(prefix = "jwt")`: secret, access/refresh expiration |
| **Entity** | JPA mapping 6 bảng, `@Table`, `@Column`, relationship |
| **Repository** | Spring Data JPA: custom query theo user_id + date range, QR token lookup |
| **DTO** | Request/Response record classes, `@Valid`, `@NotNull` annotations |
| **QrService** | Tạo UUID, lưu QR session, validate TTL + used status |
| **AttendanceService** | Core logic: QR validate → Haversine → GPS+accuracy → khung giờ → state machine |
| **StatsService** | Query range, map status (ON_TIME/LATE/ABSENT/DAY_OFF/MISSING_CHECKOUT/IN_PROGRESS) |
| **NotificationScheduler** | `@Scheduled`: gửi CHECKIN_REMINDER 8:10, CHECKOUT_REMINDER 17:40 |
| **GlobalExceptionHandler** | `@RestControllerAdvice`: map `BusinessException` → `ErrorResponse` |

---

## 11. JPA Entities Mapping

### User.java
```java
@Entity
@Table(name = "users")
@Getter @Setter
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String employeeCode;
    private String username;
    private String passwordHash;
    private String role;          // EMPLOYEE / ADMIN
    private LocalDateTime createdAt;
}
```

### CompanyLocation.java
```java
@Entity
@Table(name = "company_location")
@Getter @Setter
public class CompanyLocation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Double latitude;
    private Double longitude;
    private Integer radiusMeters;
    private LocalTime checkInStart;
    private LocalTime checkInEnd;
    private LocalTime checkOutStart;
    private LocalTime checkOutEnd;
    private LocalTime standardCheckinTime;
    private LocalTime workDayStart;
    private LocalTime workDayEnd;
    private LocalDateTime updatedAt;
}
```

### AttendanceRecord.java
```java
@Entity
@Table(name = "attendance_record",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "record_date"}))
@Getter @Setter
public class AttendanceRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDate recordDate;

    // Check-in fields
    private LocalDateTime checkInTime;
    private Double checkInLat;
    private Double checkInLng;
    private Double checkInDistanceM;
    private Double checkInAccuracy;
    private UUID checkInQrToken;

    // Check-out fields
    private LocalDateTime checkOutTime;
    private Double checkOutLat;
    private Double checkOutLng;
    private Double checkOutDistanceM;
    private Double checkOutAccuracy;
    private UUID checkOutQrToken;
}
```

### QrSession.java
```java
@Entity
@Table(name = "qr_sessions")
@Getter @Setter
public class QrSession {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private UUID token;
    private String type;          // CHECK_IN / CHECK_OUT
    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime usedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "used_by_user_id")
    private User usedByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;
}
```

### RefreshToken.java
```java
@Entity
@Table(name = "refresh_tokens")
@Getter @Setter
public class RefreshToken {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String tokenHash;
    private LocalDateTime expiresAt;
    private LocalDateTime revokedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "replaced_by_token_id")
    private RefreshToken replacedByToken;
}
```

### Notification.java
```java
@Entity
@Table(name = "notifications")
@Getter @Setter
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String type;          // CHECKIN_REMINDER / CHECKOUT_REMINDER
    private String title;
    private String message;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
    private Boolean isRead;
}
```

---

## 12. Error Codes

| HTTP | Code | Mô tả | Khi nào |
|------|------|-------|---------|
| 401 | UNAUTHORIZED | Chưa đăng nhập / token hết hạn | Missing/invalid JWT |
| 403 | FORBIDDEN | Không có quyền | EMPLOYEE gọi admin endpoint |
| 404 | NOT_FOUND | Không có dữ liệu | Stats/day không tìm thấy |
| 400 | INVALID_INPUT | Dữ liệu sai format | Validation fail |
| 409 | ALREADY_CHECKED_IN | Đã check-in hôm nay | Gọi check-in lần 2 |
| 409 | NOT_CHECKED_IN | Chưa check-in | Gọi check-out khi chưa check-in |
| 409 | ALREADY_CHECKED_OUT | Đã check-out | Gọi check-out lần 2 |
| 422 | LOCATION_OUT_OF_RANGE | Ngoài bán kính GPS | distance > radius + accuracy |
| 422 | GPS_UNCERTAIN | Tín hiệu GPS yếu | accuracy quá cao hoặc vùng xám |
| 422 | OUTSIDE_CHECKIN_HOURS | Ngoài khung giờ check-in | Giờ hiện tại ngoài cấu hình |
| 422 | OUTSIDE_CHECKOUT_HOURS | Ngoài khung giờ check-out | Giờ hiện tại ngoài cấu hình |
| 422 | QR_EXPIRED | Mã QR hết hiệu lực | expires_at < now() |
| 422 | QR_ALREADY_USED | Mã QR đã dùng | used_at NOT NULL |
| 422 | QR_INVALID | Mã QR không tồn tại | token không có trong DB |
| 422 | QR_TYPE_MISMATCH | QR sai loại | Dùng QR CHECK_IN để check-out |

---

## 13. Kết Luận

Với các bổ sung và sửa lỗi trên, hệ thống:

- ✅ Trở thành **Chấm công QR thực thụ** với QR động, TTL 15s và one-time use.
- ✅ Xác thực vị trí chính xác hơn bằng cách sử dụng **accuracy GPS** (ngưỡng sàn 5m).
- ✅ Hỗ trợ **cấu hình giờ giấc linh hoạt**, có thể thay đổi qua Admin API mà không cần deploy lại.
- ✅ Có cơ chế **thông báo nhắc nhở** (cronjob), giảm thiểu sai sót check-in/check-out.
- ✅ Quản lý **refresh token an toàn** (stateful, hash DB, hỗ trợ revoke).
- ✅ Xử lý đúng trạng thái **IN_PROGRESS** và **MISSING_CHECKOUT** để không gây nhầm lẫn.
- ✅ **6 bảng**, **10 API endpoint**, **6 entity**, **6 service** — sẵn sàng triển khai.
