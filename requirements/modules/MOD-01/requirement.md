# MOD-01 — Chấm công QR

**Module ID:** MOD-01
**Module Name:** Chấm công QR
**Actors:** ACT-01 (Nhân viên)
**Use Cases:** UC-01, UC-02

---

## Scope

Hệ thống chấm công bằng QR code + GPS cho nhân viên. Single-location, 1 role (EMPLOYEE).

## Use Cases

### UC-01 — Chấm công vào/ra bằng QR
- **Actor:** ACT-01
- **Flow:** Đăng nhập → Mở camera → Quét QR → Kiểm tra GPS → Ghi nhận check-in/check-out
- **Rules:** BR-01 (8h30), BR-02 (không phạt), BR-03 (max 2 lần/ngày)
- **Validations:** VAL-01 (10m GPS), VAL-02 (đăng nhập)
- **Permission:** PERM-01 (chỉ xem của mình)
- **AC:** AC-01 → AC-04

### UC-02 — Xem thống kê chấm công
- **Actor:** ACT-01
- **Flow:** Mở thống kê → Lịch tuần/tháng → Bấm ngày xem chi tiết
- **Rules:** BR-01, BR-02
- **Permission:** PERM-01
- **AC:** AC-05 → AC-07

## Traceability

| UC | BR | VAL | PERM | AC |
|---|---|---|---|---|
| UC-01 | BR-01, BR-02, BR-03 | VAL-01, VAL-02 | PERM-01 | AC-01→AC-04 |
| UC-02 | BR-01, BR-02 | — | PERM-01 | AC-05→AC-07 |
