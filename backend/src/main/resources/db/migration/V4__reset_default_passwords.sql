-- V4: Thêm cột buộc đổi mật khẩu ở lần đăng nhập kế tiếp
-- LƯU Ý: KHÔNG hardcode mật khẩu mới vào migration (migration nằm trong git).
-- Sau khi chạy migration này, DevOps phải đổi mật khẩu qua DB trực tiếp:
--   docker compose exec postgres psql -U attendance_user -d attendance_db -c \
--     "UPDATE users SET password_hash = '<hash_bcrypt_moi>' WHERE username = 'admin';"
-- Rồi ghi mật khẩu mới vào password manager nội bộ, KHÔNG commit vào git.

ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE users SET must_change_password = TRUE WHERE username IN ('admin', 'nv001');
