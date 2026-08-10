# Architecture & Database — Web Chấm Công Bằng QR (v2)

**Module:** MOD-01 Chấm công QR
**AUTO:** 01B — Architecture, Database & API Contract
**Gate:** CONTRACT_GATE (chờ chạy Flyway + build thật để PASS)
**Stack:** Docker Compose + PostgreSQL + Spring Boot (Java) + React + JWT

> Đây là bản thiết kế lại thay cho bản Django/SQLite trước đó, theo đúng quy ước Gated Factory V2 (Docker, PostgreSQL, Flyway, OpenAPI, RBAC, Playwright-ready).

---

## 1. Kiến trúc tổng thể

**Kiểu:** Tách rời Backend (Spring Boot REST API) và Frontend (React SPA), giao tiếp qua JSON + JWT, chạy trong Docker Compose.

```
Trình duyệt (điện thoại)
   │
   ├── React SPA (served qua Nginx container hoặc dev server)
   │     ├── /login              → gọi POST /api/auth/login
   │     ├── /                   → trang chấm công (yêu cầu JWT hợp lệ)
   │     ├── /stats               → lịch tuần/tháng
   │     └── /stats/day/:date     → chi tiết 1 ngày
   │
   ▼ (Authorization: Bearer <JWT>)
Spring Boot Backend (REST API, stateless)
   ├── AuthController        POST /api/auth/login, POST /api/auth/refresh
   ├── CheckinController     POST /api/checkin
   ├── StatsController       GET  /api/stats, GET /api/stats/day/{date}
   ├── Spring Security       JWT filter, xác thực mọi endpoint trừ /api/auth/login
   └── Flyway                chạy migration khi backend khởi động
   │
   ▼
PostgreSQL (container `postgres`)
```

**Vì sao tách REST API + React (khác bản Django cũ)?**
- Đúng chuẩn Gated Factory V2: Frontend code theo Screen Map/Screen Spec + Stitch mapping, Backend code theo OpenAPI — hai bên không phụ thuộc lẫn nhau về template engine.
- JWT stateless giúp backend không cần lưu session, dễ scale, và tách biệt hoàn toàn vòng đời deploy Frontend/Backend.
- Toàn bộ giao tiếp UI ↔ Server đi qua đúng 1 hợp đồng OpenAPI, thuận tiện cho Playwright E2E test qua browser thật (Browser → Frontend → Backend → PostgreSQL).

**Auth:** không dùng `auth_user` của Django nữa. Backend tự quản lý bảng `users` (Spring Security + JWT), có RBAC tối thiểu (1 role `EMPLOYEE`, có thể mở rộng `ADMIN` sau này cho việc sửa `CompanyLocation`).

---

## 2. Database Model (PostgreSQL, quản lý bằng Flyway)

### Bảng `users`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `employee_code` | VARCHAR(20) UNIQUE NOT NULL | Mã nhân viên hiển thị (VD: NV001) |
| `username` | VARCHAR(50) UNIQUE NOT NULL | Dùng để đăng nhập |
| `password_hash` | VARCHAR(255) NOT NULL | BCrypt |
| `role` | VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE' | `EMPLOYEE` \| `ADMIN` |
| `created_at` | TIMESTAMPTZ NOT NULL DEFAULT now() | |

→ Đáp ứng **ACT-01**, **VAL-02**. Thay thế `EmployeeProfile` + `auth_user` của bản Django.

### Bảng `company_location`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | BIGSERIAL PK | Chỉ 1 dòng (single-location) |
| `latitude` | DOUBLE PRECISION NOT NULL | |
| `longitude` | DOUBLE PRECISION NOT NULL | |
| `radius_meters` | INT NOT NULL DEFAULT 10 | Sửa qua endpoint `ADMIN` (thay cho Django Admin) |
| `updated_at` | TIMESTAMPTZ NOT NULL DEFAULT now() | |

→ Đáp ứng **VAL-01**. Vì không còn Django Admin, cần một endpoint quản trị tối thiểu — xem mục 3 (`admin.updateLocation`).

### Bảng `attendance_record`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `user_id` | BIGINT NOT NULL REFERENCES users(id) | |
| `record_date` | DATE NOT NULL | |
| `check_in_time` | TIMESTAMPTZ NULL | |
| `check_in_lat` / `check_in_lng` / `check_in_distance_m` | DOUBLE PRECISION NULL | |
| `check_out_time` | TIMESTAMPTZ NULL | |
| `check_out_lat` / `check_out_lng` / `check_out_distance_m` | DOUBLE PRECISION NULL | |

**Ràng buộc:** `UNIQUE (user_id, record_date)` — 1 bản ghi/người/ngày.

→ Đáp ứng **UC-01, UC-02, BR-01, BR-02, BR-03**.

### Quan hệ

```
users (1) ──── (*) attendance_record
company_location  (bảng độc lập, 1 dòng duy nhất — dùng để tính khoảng cách Haversine)
```

### Ví dụ Flyway migration (`V1__init_schema.sql`)

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE company_location (
    id BIGSERIAL PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters INT NOT NULL DEFAULT 10,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE attendance_record (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    record_date DATE NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_in_lat DOUBLE PRECISION,
    check_in_lng DOUBLE PRECISION,
    check_in_distance_m DOUBLE PRECISION,
    check_out_time TIMESTAMPTZ,
    check_out_lat DOUBLE PRECISION,
    check_out_lng DOUBLE PRECISION,
    check_out_distance_m DOUBLE PRECISION,
    UNIQUE (user_id, record_date)
);

CREATE INDEX idx_attendance_user_date ON attendance_record(user_id, record_date);
```

> Quy tắc bắt buộc theo Gated Factory: Hibernate dùng `ddl-auto=validate`, **không** dùng `update`/`create`. Mọi thay đổi schema đi qua file Flyway mới, không sửa migration đã chạy.

---

## 3. API / Route Contract (OpenAPI)

| operationId | Method + Path | Requirement ID | Auth | Request | Response |
|---|---|---|---|---|---|
| `auth.login` | POST `/api/auth/login` | VAL-02 | Không | `{username, password}` | `{accessToken, refreshToken, expiresIn}` |
| `auth.refresh` | POST `/api/auth/refresh` | VAL-02 | Refresh token | `{refreshToken}` | `{accessToken, expiresIn}` |
| `checkin.submit` | POST `/api/checkin` | UC-01, AC-01→AC-04, VAL-01, BR-03 | Bearer JWT | `{lat, lng, accuracy}` | `{ok, action, message, distanceMeters}` |
| `stats.list` | GET `/api/stats?mode=week\|month&date=YYYY-MM-DD` | UC-02, AC-05, AC-06 | Bearer JWT | query param | `[{date, checkInTime, checkOutTime, status}]` |
| `stats.dayDetail` | GET `/api/stats/day/{date}` | UC-02, AC-07 | Bearer JWT | path param | chi tiết giờ vào/ra + toạ độ |
| `admin.updateLocation` | PUT `/api/admin/company-location` | VAL-01 | Bearer JWT (role `ADMIN`) | `{latitude, longitude, radiusMeters}` | `{ok}` |

**Error mapping (`checkin.submit`):**

| Tình huống | HTTP status | Requirement |
|---|---|---|
| Ngoài bán kính cho phép | 403 `LOCATION_OUT_OF_RANGE` | AF-01, AC-03 |
| Đã đủ vào+ra hôm nay | 409 `ALREADY_COMPLETED` | AF checkin lần 3, AC-04 |
| Token không hợp lệ/hết hạn | 401 `UNAUTHORIZED` | VAL-02 |

**Error mapping chung (mọi endpoint có Bearer JWT):**

| Tình huống | HTTP status |
|---|---|
| Thiếu/sai JWT | 401 |
| Đúng JWT nhưng thiếu role (VD: gọi `admin.updateLocation` khi không phải ADMIN) | 403 |

**Permission (RBAC):** JWT payload chứa `sub` (user id), `employeeCode`, `role`. `stats.list`/`stats.dayDetail`/`checkin.submit` chỉ thao tác trên `userId` lấy từ token, **không nhận `userId`/`employeeId` từ client** — đáp ứng **PERM-01**, chống sửa URL để xem dữ liệu người khác. `admin.updateLocation` yêu cầu `role = ADMIN`.

---

## 4. Đối chiếu Requirement ↔ Database ↔ API

| Requirement ID | Database | API |
|---|---|---|
| UC-01 | `attendance_record`, `company_location` | `checkin.submit` |
| UC-02 | `attendance_record` | `stats.list`, `stats.dayDetail` |
| BR-01, BR-02, BR-03 | `attendance_record` (UNIQUE user_id+record_date, cột in/out riêng biệt) | `checkin.submit` (logic đếm lần quét) |
| VAL-01 | `company_location.radius_meters` | `checkin.submit` (Haversine), `admin.updateLocation` |
| VAL-02 | `users` | `auth.login`, `auth.refresh`, JWT filter trên mọi route trừ `/api/auth/*` |
| PERM-01 | `attendance_record.user_id` | mọi query lọc theo `userId` trong JWT, không nhận ID từ client |

**Không còn endpoint nào ở trạng thái BLOCKED.**

---

## 5. Docker & Môi trường chạy

```
docker-compose.yml
├── postgres        (postgres:16, volume: pgdata, port 5432)
├── backend          (Spring Boot, build từ ./backend, port 8080)
│     └── depends_on: postgres
└── frontend         (React build, Nginx, port 80/3000)
      └── depends_on: backend
```

| File | Vai trò |
|---|---|
| `docker-compose.yml` | Định nghĩa postgres, backend, frontend + network/volume |
| `.env` | `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `JWT_SECRET` — không commit |
| `.env.example` | Mẫu biến môi trường dùng chung |
| `application-local.yml` | Backend chạy ngoài Docker, DB host = `localhost` |
| `application-docker.yml` | Backend trong Docker, DB host = **`postgres`** (tên service, không dùng `localhost`) |
| `backend/src/main/resources/db/migration/` | Flyway migration |

**Ví dụ `application-docker.yml`:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://postgres:5432/${POSTGRES_DB}
    username: ${POSTGRES_USER}
    password: ${POSTGRES_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true
jwt:
  secret: ${JWT_SECRET}
  access-token-expiration-minutes: 30
  refresh-token-expiration-days: 7
```

**Quy tắc bắt buộc:** trong container backend, kết nối PostgreSQL qua tên service `postgres`, không dùng `localhost`. Flyway chạy tự động khi backend start; Hibernate chỉ `validate`, không tự sinh schema.

---

## 6. Việc còn lại để CONTRACT_GATE = PASS

- [ ] Dựng `docker-compose.yml` (postgres + backend + frontend), chạy `docker compose up`, xác nhận backend kết nối PostgreSQL thành công qua service name.
- [ ] Chạy Flyway migration thật (`V1__init_schema.sql`), insert thử 1 user + 1 attendance_record để xác nhận schema hoạt động đúng ràng buộc UNIQUE.
- [ ] Sinh file OpenAPI (`openapi.yaml`) đầy đủ từ bảng API ở mục 3, dùng làm nguồn cho cả Backend DTO/Controller lẫn Frontend service/types (Contract test sau này).
- [ ] Xác nhận với bạn: có cần role `ADMIN` ngay từ đầu để sửa `company_location` qua API, hay tạm thời vẫn sửa trực tiếp trong DB cho giai đoạn đầu (giảm việc code màn Admin)?
- [ ] Xác nhận thời hạn JWT access token / refresh token (đang đề xuất 30 phút / 7 ngày) có phù hợp với cách nhân viên dùng app (quét mã 2 lần/ngày, có thể tắt trình duyệt giữa 2 lần) không — nếu access token hết hạn giữa buổi, FE cần tự gọi `auth.refresh` trước khi POST `checkin.submit`.