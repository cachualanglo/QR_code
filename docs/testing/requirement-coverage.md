# Requirement Coverage Matrix

**AUTO:** 01A
**Gate:** REQUIREMENT_GATE
**Status:** ✅ PASS

---

## Coverage Summary

| Requirement Type | Count | Covered | Gap |
|---|---|---|---|
| Actors | 1 | 1 | 0 |
| Use Cases | 2 | 2 | 0 |
| Business Rules | 3 | 3 | 0 |
| Validations | 2 | 2 | 0 |
| Permissions | 1 | 1 | 0 |
| Acceptance Criteria | 7 | 7 | 0 |

---

## Actor Coverage

| Actor ID | Name | Used By UC | Status |
|---|---|---|---|
| ACT-01 | Nhân viên | UC-01, UC-02 | ✅ |

---

## Use Case Coverage

| UC ID | Name | Actor | BR | VAL | PERM | AC | Status |
|---|---|---|---|---|---|---|---|
| UC-01 | Chấm công QR | ACT-01 | BR-01,02,03 | VAL-01,02 | PERM-01 | AC-01→04 | ✅ |
| UC-02 | Thống kê cá nhân | ACT-01 | BR-01,02 | — | PERM-01 | AC-05→07 | ✅ |

---

## Business Rule Coverage

| BR ID | Rule | Used By UC | API Endpoint | Status |
|---|---|---|---|---|
| BR-01 | Giờ làm chuẩn 08:30 | UC-01, UC-02 | stats.list | ✅ |
| BR-02 | Không phạt trễ/sớm | UC-01, UC-02 | checkin.submit | ✅ |
| BR-03 | Max 2 lần/ngày | UC-01 | checkin.submit | ✅ |

---

## Validation Coverage

| VAL ID | Validation | Used By UC | API Endpoint | Status |
|---|---|---|---|---|
| VAL-01 | GPS trong bán kính 10m | UC-01 | checkin.submit | ✅ |
| VAL-02 | Đăng nhập hợp lệ | UC-01 | auth.login | ✅ |

---

## Permission Coverage

| PERM ID | Permission | Used By UC | Enforcement | Status |
|---|---|---|---|---|
| PERM-01 | Chỉ xem của mình | UC-01, UC-02 | userId từ JWT | ✅ |

---

## Acceptance Criteria Coverage

| AC ID | Criterion | UC | Test Method | Status |
|---|---|---|---|---|
| AC-01 | Check-in lần 1 thành công | UC-01 | E2E Playwright | ✅ |
| AC-02 | Check-out lần 2 thành công | UC-01 | E2E Playwright | ✅ |
| AC-03 | Ngoài 10m bị từ chối | UC-01 | E2E Playwright | ✅ |
| AC-04 | Lần 3+ bị từ chối | UC-01 | E2E Playwright | ✅ |
| AC-05 | Lịch tuần mặc định | UC-02 | E2E Playwright | ✅ |
| AC-06 | Chuyển tháng đúng | UC-02 | E2E Playwright | ✅ |
| AC-07 | Chi tiết ngày đúng | UC-02 | E2E Playwright | ✅ |

---

## API ↔ Requirement Mapping

| operationId | Method | Path | Requirement IDs | Status |
|---|---|---|---|---|
| auth.login | POST | /api/auth/login | VAL-02 | ✅ |
| auth.refresh | POST | /api/auth/refresh | VAL-02 | ✅ |
| checkin.submit | POST | /api/checkin | UC-01, AC-01→04, VAL-01, BR-03 | ✅ |
| stats.list | GET | /api/stats | UC-02, AC-05,06 | ✅ |
| stats.dayDetail | GET | /api/stats/day/{date} | UC-02, AC-07 | ✅ |
| admin.updateLocation | PUT | /api/admin/company-location | VAL-01 | ✅ |

---

## Gate Criteria

- [x] Every module has requirement file
- [x] Every use case has actor, precondition, main flow, alt flow, BR, VAL, PERM, AC
- [x] No critical gaps hidden by assumptions
- [x] Out of scope documented
- [x] All requirements traceable to API endpoints

**REQUIREMENT_GATE = PASS** ✅
