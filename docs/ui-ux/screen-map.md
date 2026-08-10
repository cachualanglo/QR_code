# Screen Map — Chấm Công QR

**AUTO:** 01C
**Gate:** SCREEN_GATE

---

## Screen Inventory

| Screen ID | Name | Route | Actor | Permission | API | Use Case |
|---|---|---|---|---|---|---|
| SCR-01 | Login | `/login` | ACT-01 | Public | auth.login | — |
| SCR-02 | Chấm công QR | `/` | ACT-01 | PERM-01 | checkin.submit | UC-01 |
| SCR-03 | Thống kê Tuần/Tháng | `/stats` | ACT-01 | PERM-01 | stats.list | UC-02 |
| SCR-04 | Chi tiết ngày | `/stats/day/:date` | ACT-01 | PERM-01 | stats.dayDetail | UC-02 |
| SCR-05 | Hồ sơ cá nhân | `/profile` | ACT-01 | PERM-01 | — | UC-01 |
| SCR-06 | Đăng xuất | `/logout` | ACT-01 | PERM-01 | auth.logout | UC-01 |

---

## Screen → Use Case → Acceptance Criteria

| Screen | UC | AC |
|---|---|---|
| SCR-01 | — | Login thành công → redirect `/` |
| SCR-02 | UC-01 | AC-01, AC-02, AC-03, AC-04 |
| SCR-03 | UC-02 | AC-05, AC-06 |
| SCR-04 | UC-02 | AC-07 |
| SCR-05 | UC-01 | Hiển thị thông tin cá nhân, nút đăng xuất |
| SCR-06 | UC-01 | Xác nhận đăng xuất → xóa token → redirect `/login` |

---

## Screen → API Mapping

| Screen | Primary API | Secondary API |
|---|---|---|
| SCR-01 | auth.login | auth.refresh |
| SCR-02 | checkin.submit | — |
| SCR-03 | stats.list | — |
| SCR-04 | stats.dayDetail | — |
| SCR-05 | — (client-side) | — |
| SCR-06 | auth.logout | — |

---

## Screen States

### SCR-01 — Login
| State | Description |
|---|---|
| EMPTY | Form trống, sẵn sàng nhập |
| LOADING | Đang gửi request |
| SUCCESS | Đăng nhập thành công → redirect |
| ERROR | Sai username/password |

### SCR-02 — Checkin
| State | Description |
|---|---|
| READY | Sẵn sàng quét QR |
| CAMERA_OPEN | Đang mở camera |
| SCANNING | Đang quét QR |
| CHECKING_GPS | Đang kiểm tra GPS |
| SUCCESS_CHECKIN | Check-in thành công |
| SUCCESS_CHECKOUT | Check-out thành công |
| ERROR_OUT_OF_RANGE | Ngoài bán kính 10m |
| ERROR_ALREADY_COMPLETED | Đã chấm công đủ |

### SCR-03 — Stats
| State | Description |
|---|---|
| LOADING | Đang tải dữ liệu |
| WEEK_VIEW | Hiển thị tuần |
| MONTH_VIEW | Hiển thị tháng |
| EMPTY | Không có dữ liệu |

### SCR-04 — Day Detail
| State | Description |
|---|---|
| LOADING | Đang tải |
| HAS_DATA | Có giờ vào/ra |
| NO_DATA | Vắng mặt hoặc ngày nghỉ |

### SCR-05 — Profile
| State | Description |
|---|---|
| LOADED | Hiển thị thông tin cá nhân |
| EDITING | Đang chỉnh sửa profile |

### SCR-06 — Logout
| State | Description |
|---|---|
| CONFIRMING | Hiển thị dialog xác nhận |
| LOGGING_OUT | Đang xóa token |
| DONE | Đăng xuất thành công → redirect `/login` |
