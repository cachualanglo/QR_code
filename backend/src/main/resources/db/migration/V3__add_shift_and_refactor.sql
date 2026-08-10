-- V3__add_shift_and_refactor.sql
-- Thêm bảng shift, thêm cột mới vào attendance_record

-- ============================================================
-- BẢNG MỚI: shift (Ca làm việc)
-- ============================================================
CREATE TABLE shift (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    checkin_cutoff  TIME NOT NULL,
    qr_rotation_seconds INT NOT NULL DEFAULT 60,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE shift IS 'Ca làm việc. Scheduler tự động tạo QR theo shift.';
COMMENT ON COLUMN shift.checkin_cutoff IS 'Sau giờ này không nhận check-in mới. Vẫn cho check-out.';
COMMENT ON COLUMN shift.qr_rotation_seconds IS 'Chu kỳ xoay QR (giây). Default 60s.';

-- ============================================================
-- SEED: Ca sáng mặc định
-- ============================================================
INSERT INTO shift (name, start_time, end_time, checkin_cutoff, qr_rotation_seconds)
VALUES ('Ca sáng', '08:00', '12:00', '10:00', 60);

-- ============================================================
-- ATTENDANCE_RECORD: Thêm cột mới
-- ============================================================
ALTER TABLE attendance_record
    ADD COLUMN shift_id BIGINT NULL REFERENCES shift(id),
    ADD COLUMN late_minutes INT NOT NULL DEFAULT 0,
    ADD COLUMN early_leave_minutes INT NOT NULL DEFAULT 0,
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PRESENT';

COMMENT ON COLUMN attendance_record.shift_id IS 'Ca làm việc liên kết. NULL = records cũ trước khi có shift.';
COMMENT ON COLUMN attendance_record.late_minutes IS 'Số phút đi muộn. 0 = đúng giờ hoặc trước giờ.';
COMMENT ON COLUMN attendance_record.early_leave_minutes IS 'Số phút về sớm. 0 = đúng giờ hoặc sau giờ.';
COMMENT ON COLUMN attendance_record.status IS 'PRESENT | LATE | EARLY_LEAVE | LATE_AND_EARLY | ABSENT | MISSING_CHECKOUT';

-- ============================================================
-- UNIQUE: user + date + shift (conditional — chỉ áp dụng khi shift_id NOT NULL)
-- Giữ nguyên constraint cũ uq_attendance_user_date cho records cũ
-- ============================================================
CREATE UNIQUE INDEX uq_attendance_user_date_shift
    ON attendance_record(user_id, record_date, shift_id)
    WHERE shift_id IS NOT NULL;
