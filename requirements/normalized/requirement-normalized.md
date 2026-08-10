# Requirement Normalized — Web Chấm Công Bằng QR

**Source:** `docs/Requirement.docx` → MarkItDown converted
**Module:** MOD-01 Chấm công QR
**AUTO:** 01A
**Status:** REQUIREMENT_GATE = PASS

---

## Module Inventory

| Module ID | Name | Description |
|---|---|---|
| MOD-01 | Chấm công QR | Hệ thống chấm công bằng QR code + GPS, 1 nhân viên duy nhất, single-location |

---

## Actor Inventory

| Actor ID | Name | Description | Scope |
|---|---|---|---|
| ACT-01 | Nhân viên | Đăng nhập, chấm công QR, xem thống kê cá nhân | Toàn bộ hệ thống (1 role duy nhất) |

---

## Use Case Inventory

### UC-01 — Chấm công vào/ra bằng QR

| Field | Value |
|---|---|
| ID | UC-01 |
| Actor | ACT-01 |
| Trigger | Nhân viên bấm nút mở camera quét QR |
| Precondition | Đã đăng nhập; Camera + GPS đã cấp quyền |
| Main Flow | 1. Đăng nhập → 2. Mở camera → 3. Quét QR → 4. Kiểm tra GPS (10m) → 5. Đếm lần quét: Lần 1 = Check-in, Lần 2 = Check-out, Lần 3+ = Từ chối |
| AF-01 | Ngoài bán kính 10m → từ chối, hiển thị khoảng cách |
| AF-02 | Chưa cấp quyền Camera/GPS → hướng dẫn cấp quyền |
| AF-03 | Token hết hạn → yêu cầu đăng nhập lại |
| Business Rules | BR-01, BR-02, BR-03 |
| Validation | VAL-01, VAL-02 |
| Permission | PERM-01 |
| Acceptance Criteria | AC-01, AC-02, AC-03, AC-04 |

### UC-02 — Xem thống kê chấm công cá nhân

| Field | Value |
|---|---|
| ID | UC-02 |
| Actor | ACT-01 |
| Trigger | Nhân viên vào màn "Thống kê" |
| Precondition | Đã đăng nhập |
| Main Flow | 1. Mở thống kê → 2. Hiển thị lịch tuần hiện tại → 3. Chuyển Tuần/Tháng → 4. Bấm ngày → xem chi tiết |
| Business Rules | BR-01, BR-02 |
| Validation | — |
| Permission | PERM-01 |
| Acceptance Criteria | AC-05, AC-06, AC-07 |

---

## Business Rules

| ID | Rule | Applies To |
|---|---|---|
| BR-01 | Giờ làm chuẩn: 8h30 | UC-01, UC-02 |
| BR-02 | Đi trễ/về sớm chỉ ghi nhận thực tế, không phạt | UC-01, UC-02 |
| BR-03 | Mỗi ngày: 1 check-in + 1 check-out. Lần quét 3+ bị từ chối | UC-01 |

---

## Validations

| ID | Validation | Applies To |
|---|---|---|
| VAL-01 | GPS trong bán kính 10m quanh toạ độ công ty | UC-01 |
| VAL-02 | Phải đăng nhập hợp lệ trước khi quét QR | UC-01 |

---

## Permissions

| ID | Permission | Applies To |
|---|---|---|
| PERM-01 | Nhân viên chỉ xem dữ liệu của chính mình | UC-01, UC-02 |

---

## Acceptance Criteria

| ID | Criterion | Use Case |
|---|---|---|
| AC-01 | Quét lần 1, trong 10m → check-in thành công, hiển thị giờ vào | UC-01 |
| AC-02 | Quét lần 2, trong 10m → check-out thành công, hiển thị giờ ra | UC-01 |
| AC-03 | Quét ngoài 10m → từ chối + khoảng cách | UC-01 |
| AC-04 | Quét lần 3+ → từ chối + "đã hoàn tất" | UC-01 |
| AC-05 | Mở thống kê → lịch tuần hiện tại | UC-02 |
| AC-06 | Chuyển tháng → hiển thị đúng trạng thái | UC-02 |
| AC-07 | Bấm ngày → chi tiết giờ vào/ra hoặc trạng thái | UC-02 |

---

## Out of Scope (Explicit)

- Không có Quản lý/HR, không duyệt nghỉ phép
- Không tính lương, không phạt đi trễ/về sớm
- Single-location, không multi-branch
- Không quên mật khẩu, không MFA

---

## Open Questions

Không còn open question. Toàn bộ điểm mơ hồ đã được xác nhận + Out of scope ghi rõ.
