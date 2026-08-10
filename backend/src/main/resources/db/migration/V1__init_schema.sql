-- V1__init_schema.sql
-- Module: MOD-01 Chấm công QR
-- Requirement: UC-01, UC-02, BR-01 ~ BR-06, VAL-01 ~ VAL-03, PERM-01
-- Phiên bản: v2 — 6 bảng, QR động, GPS accuracy, cấu hình giờ, notifications

-- ============================================================
-- BẢNG 1: users
-- ============================================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE users IS 'Tài khoản nhân viên. Role: EMPLOYEE (mặc định), ADMIN (quản trị company_location).';
COMMENT ON COLUMN users.employee_code IS 'Mã nhân viên hiển thị, VD: NV001';
COMMENT ON COLUMN users.password_hash IS 'BCrypt hash';

-- ============================================================
-- BẢNG 2: company_location (single-location + cấu hình giờ)
-- ============================================================
CREATE TABLE company_location (
    id BIGSERIAL PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters INT NOT NULL DEFAULT 10,
    -- Cấu hình giờ làm việc
    check_in_start TIME NOT NULL DEFAULT '07:30',
    check_in_end TIME NOT NULL DEFAULT '09:00',
    check_out_start TIME NOT NULL DEFAULT '16:30',
    check_out_end TIME NOT NULL DEFAULT '20:00',
    standard_checkin_time TIME NOT NULL DEFAULT '08:30',
    work_day_start TIME NOT NULL DEFAULT '08:00',
    work_day_end TIME NOT NULL DEFAULT '17:30',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE company_location IS 'Toạ độ công ty + cấu hình giờ (1 dòng duy nhất). Dùng để tính Haversine và validate khung giờ.';
COMMENT ON COLUMN company_location.standard_checkin_time IS 'Giờ chuẩn check-in, dùng để phân biệt ON_TIME / LATE';
COMMENT ON COLUMN company_location.check_in_start IS 'Bắt đầu khung giờ check-in hợp lệ';
COMMENT ON COLUMN company_location.check_in_end IS 'Kết thúc khung giờ check-in hợp lệ';
COMMENT ON COLUMN company_location.check_out_start IS 'Bắt đầu khung giờ check-out hợp lệ';
COMMENT ON COLUMN company_location.check_out_end IS 'Kết thúc khung giờ check-out hợp lệ';

-- ============================================================
-- BẢNG 3: attendance_record (thêm accuracy + qr_token)
-- ============================================================
CREATE TABLE attendance_record (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    record_date DATE NOT NULL,
    -- Check-in
    check_in_time TIMESTAMPTZ NULL,
    check_in_lat DOUBLE PRECISION NULL,
    check_in_lng DOUBLE PRECISION NULL,
    check_in_distance_m DOUBLE PRECISION NULL,
    check_in_accuracy DOUBLE PRECISION NULL,
    check_in_qr_token UUID NULL,
    -- Check-out
    check_out_time TIMESTAMPTZ NULL,
    check_out_lat DOUBLE PRECISION NULL,
    check_out_lng DOUBLE PRECISION NULL,
    check_out_distance_m DOUBLE PRECISION NULL,
    check_out_accuracy DOUBLE PRECISION NULL,
    check_out_qr_token UUID NULL,
    -- Constraint
    CONSTRAINT uq_attendance_user_date UNIQUE (user_id, record_date)
);

COMMENT ON TABLE attendance_record IS 'Bản ghi chấm công. Mỗi người mỗi ngày 1 dòng (check-in + check-out).';
COMMENT ON COLUMN attendance_record.record_date IS 'Ngày chấm công, timezone theo server';
COMMENT ON COLUMN attendance_record.check_in_accuracy IS 'Sai số GPS khi check-in (m), do thiết bị cung cấp';
COMMENT ON COLUMN attendance_record.check_in_qr_token IS 'QR token UUID đã dùng để check-in';
COMMENT ON COLUMN attendance_record.check_out_accuracy IS 'Sai số GPS khi check-out (m), do thiết bị cung cấp';
COMMENT ON COLUMN attendance_record.check_out_qr_token IS 'QR token UUID đã dùng để check-out';

-- Index cho query thống kê theo user + khoảng ngày
CREATE INDEX idx_attendance_user_date ON attendance_record(user_id, record_date);

-- ============================================================
-- BẢNG 4: qr_sessions (QR động, TTL 15s, one-time use)
-- ============================================================
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

COMMENT ON TABLE qr_sessions IS 'Phiên QR động. Mỗi QR có TTL 15s, chỉ dùng 1 lần. Type: CHECK_IN hoặc CHECK_OUT.';
COMMENT ON COLUMN qr_sessions.token IS 'UUID ngẫu nhiên, không thể đoán';
COMMENT ON COLUMN qr_sessions.type IS 'CHECK_IN hoặc CHECK_OUT — đúng loại mới được phép';
COMMENT ON COLUMN qr_sessions.expires_at IS 'Hết hiệu lực sau 15 giây từ issued_at';
COMMENT ON COLUMN qr_sessions.used_at IS 'Thời điểm QR được sử dụng. NULL = chưa dùng';

CREATE INDEX idx_qr_sessions_token ON qr_sessions(token);
CREATE INDEX idx_qr_sessions_expires ON qr_sessions(expires_at) WHERE used_at IS NULL;

-- ============================================================
-- BẢNG 5: refresh_tokens (stateful, hỗ trợ revoke)
-- ============================================================
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ NULL,
    replaced_by_token_id BIGINT NULL REFERENCES refresh_tokens(id)
);

COMMENT ON TABLE refresh_tokens IS 'Refresh token stateful. Lưu SHA-256 hash, hỗ trợ revoke và chain tracking.';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'SHA-256(refreshToken), không lưu plaintext';
COMMENT ON COLUMN refresh_tokens.revoked_at IS 'Thời điểm bị thu hồi. NULL = còn hiệu lực';
COMMENT ON COLUMN refresh_tokens.replaced_by_token_id IS 'ID token thay thế khi refresh (chain tracking)';

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- ============================================================
-- BẢNG 6: notifications (thông báo nhắc nhở)
-- ============================================================
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

COMMENT ON TABLE notifications IS 'Thông báo nhắc nhở check-in/check-out. Tạo bởi cronjob 8:10 và 17:40.';
COMMENT ON COLUMN notifications.type IS 'CHECKIN_REMINDER hoặc CHECKOUT_REMINDER';
COMMENT ON COLUMN notifications.is_read IS 'Deprecated — dùng read_at thay thế';

CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE read_at IS NULL;

-- ============================================================
-- SEED DATA
-- ============================================================

-- company_location: mặc định 10m, khung giờ 7:30-9:00, 16:30-20:00, standard 8:30
INSERT INTO company_location 
(latitude, longitude, radius_meters, check_in_start, check_in_end, 
 check_out_start, check_out_end, standard_checkin_time)
VALUES 
(10.7769, 106.7009, 10, '07:30', '09:00', '16:30', '20:00', '08:30');

-- Users: password mặc định admin123, nv001pass (BCrypt hash)
INSERT INTO users (employee_code, username, password_hash, role)
VALUES ('ADMIN01', 'admin', '$2a$10$/KXDoyOAyzbnu/020Am.Y.592EQ8NDu5P69OqMtHQTUg8T.FRW3CG', 'ADMIN');

INSERT INTO users (employee_code, username, password_hash, role)
VALUES ('NV001', 'nv001', '$2a$10$bhCb3JqPA9.f79MzRULSKunEoJw62pYEdJosjeun7tQa0jPts16HW', 'EMPLOYEE');
