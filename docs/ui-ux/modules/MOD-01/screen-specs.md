# Screen Specs — MOD-01 Chấm Công QR

**AUTO:** 01C
**Module:** MOD-01

---

## SCR-01 — Login

**Route:** `/login`
**Actor:** ACT-01 (Nhân viên)
**API:** auth.login

### Layout
```
┌─────────────────────────┐
│                         │
│      [Logo/Icon]        │
│                         │
│   Chấm Công QR          │
│                         │
│  ┌───────────────────┐  │
│  │ Username          │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Password          │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │    Đăng nhập      │  │
│  └───────────────────┘  │
│                         │
│  [Loading spinner]      │
│  [Error message]        │
│                         │
└─────────────────────────┘
```

### Fields
| Field | Type | Required | Validation | API Field |
|---|---|---|---|---|
| Username | text | Yes | Not empty | `username` |
| Password | password | Yes | Not empty | `password` |

### Actions
| Action | Trigger | API Call | Success | Error |
|---|---|---|---|---|
| Login | Click "Đăng nhập" | POST /api/auth/login | Store JWT → Redirect `/` | Show error message |

### States
| State | UI |
|---|---|
| EMPTY | Form enabled, button enabled |
| LOADING | Form disabled, spinner on button |
| SUCCESS | Redirect to `/` |
| ERROR | Form enabled, error message below form |

### Acceptance Criteria
- Nhập đúng username/password → login thành công → redirect `/`
- Nhập sai → hiển thị lỗi "Username hoặc password không đúng"
- Form trống → button disabled hoặc show validation

---

## SCR-02 — Chấm Công QR (Trang chính)

**Route:** `/`
**Actor:** ACT-01 (Nhân viên)
**API:** checkin.submit
**Use Case:** UC-01

### Layout
```
┌─────────────────────────┐
│ Header: Chấm Công QR 👤│
├─────────────────────────┤
│                         │
│  Chào mừng, NV001!      │
│                         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │   [QR Code Icon]  │  │
│  │                   │  │
│  │  Quét mã QR       │  │
│  │  để chấm công     │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │   Quét ngay       │  │
│  └───────────────────┘  │
│                         │
│  [Status message]       │
│  [Distance info]        │
│                         │
├─────────────────────────┤
│ Bottom Nav: 📷 📊 👤   │
└─────────────────────────┘
```

### Fields
| Field | Type | Display | API |
|---|---|---|---|
| Employee name | text | Header | JWT sub |
| Status | text | Below button | Response message |
| Distance | text | Below status | Response distanceMeters |

### Actions
| Action | Trigger | API Call | Success | Error |
|---|---|---|---|---|
| Open Camera | Click "Quét ngay" | — | Open camera view | Request camera permission |
| Submit Checkin | QR scanned + GPS captured | POST /api/checkin | Show success (CHECK_IN/CHECK_OUT) | Show error |
| Refresh | Pull to refresh | GET /api/stats (today) | Update status | — |

### States
| State | UI |
|---|---|
| READY | Button enabled, no status |
| CAMERA_OPEN | Camera viewfinder active |
| SCANNING | Camera active, processing QR |
| CHECKING_GPS | Spinner, "Đang kiểm tra vị trí..." |
| SUCCESS_CHECKIN | Green ✓, "Check-in thành công lúc HH:mm" |
| SUCCESS_CHECKOUT | Green ✓, "Check-out thành công lúc HH:mm" |
| ERROR_OUT_OF_RANGE | Red ✗, "Bạn cách công tri X m" |
| ERROR_ALREADY_COMPLETED | Orange ⚠, "Bạn đã chấm công hôm nay" |

### Acceptance Criteria
- AC-01: Quét lần 1, trong 10m → check-in thành công
- AC-02: Quét lần 2, trong 10m → check-out thành công
- AC-03: Quét ngoài 10m → từ chối + khoảng cách
- AC-04: Quét lần 3+ → từ chối + "đã hoàn tất"

---

## SCR-03 — Thống kê Tuần/Tháng

**Route:** `/stats`
**Actor:** ACT-01 (Nhân viên)
**API:** stats.list
**Use Case:** UC-02

### Layout
```
┌─────────────────────────┐
│ Header: Thống kê 👤     │
├─────────────────────────┤
│                         │
│  ┌─────┬─────────┐     │
│  │ Tuần│  Tháng  │     │
│  └─────┴─────────┘     │
│                         │
│  ← Tuần 10/08 - 16/08 →│
│                         │
│  ┌───┬───┬───┬───┬───┐ │
│  │ T2│ T3│ T4│ T5│ T6│ │
│  │ ✓ │ ✓ │ ◐ │   │ ✓ │ │
│  └───┴───┴───┴───┴───┘ │
│  ┌───┬───┐             │
│  │ T7│ CN│             │
│  │ 🏖│ 🏖│             │
│  └───┴───┘             │
│                         │
│  Legend:                │
│  ✓ Đúng giờ            │
│  ◐ Đi trễ              │
│  ○ Vắng                │
│  🏖 Ngày nghỉ          │
│  ◑ Thiếu check-out    │
│                         │
├─────────────────────────┤
│ Bottom Nav: 📷 📊 👤   │
└─────────────────────────┘
```

### Fields
| Field | Type | Source |
|---|---|---|
| Date | date | stats.list[].date |
| Check-in time | time | stats.list[].checkInTime |
| Check-out time | time | stats.list[].checkOutTime |
| Status | enum | stats.list[].status |

### Day Status Display
| Status | Icon/Color | Condition |
|---|---|---|
| ON_TIME | ✓ Green | Check-in ≤ 08:30 |
| LATE | ◐ Orange | Check-in > 08:30 |
| ABSENT | ○ Red | T2-T6, no check-in |
| DAY_OFF | 🏖 Gray | T7, CN |
| MISSING_CHECKOUT | ◑ Yellow | Check-in but no check-out |

### Actions
| Action | Trigger | API Call |
|---|---|---|
| Switch Week/Month | Click tab | GET /api/stats?mode=week\|month&date=... |
| Navigate period | Click arrows | GET /api/stats with new date |
| View day detail | Click on day cell | Navigate `/stats/day/:date` |

### States
| State | UI |
|---|---|
| LOADING | Skeleton/spinner |
| WEEK_VIEW | 7-day grid (T2-CN) |
| MONTH_VIEW | Calendar grid |
| EMPTY | "Không có dữ liệu" |

### Acceptance Criteria
- AC-05: Mở thống kê → mặc định lịch tuần hiện tại
- AC-06: Chuyển tháng → hiển thị đúng trạng thái

---

## SCR-04 — Chi Tiết Ngày

**Route:** `/stats/day/:date`
**Actor:** ACT-01 (Nhân viên)
**API:** stats.dayDetail
**Use Case:** UC-02

### Layout
```
┌─────────────────────────┐
│ ← Chi tiết 10/08/2026  │
├─────────────────────────┤
│                         │
│  Trạng thái: Đúng giờ  │
│                         │
│  ┌───────────────────┐  │
│  │  Giờ vào          │  │
│  │  08:15:32         │  │
│  │  📍 10.7769,      │  │
│  │     106.7009      │  │
│  │  📏 3.5m          │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │  Giờ ra           │  │
│  │  17:30:15         │  │
│  │  📍 10.7770,      │  │
│  │     106.7010      │  │
│  │  📏 2.1m          │  │
│  └───────────────────┘  │
│                         │
│  [Không có dữ liệu]    │
│  (nếu vắng/nghỉ)       │
│                         │
└─────────────────────────┘
```

### Fields
| Field | Source | Display |
|---|---|---|
| Date | path param | Header |
| Status | computed | Badge |
| Check-in time | dayDetail.checkInTime | Card |
| Check-in coordinates | dayDetail.checkInLat, checkInLng | Card |
| Check-in distance | dayDetail.checkInDistanceM | Card |
| Check-out time | dayDetail.checkOutTime | Card |
| Check-out coordinates | dayDetail.checkOutLat, checkOutLng | Card |
| Check-out distance | dayDetail.checkOutDistanceM | Card |

### States
| State | UI |
|---|---|
| LOADING | Skeleton |
| HAS_DATA | Two cards (in/out) with details |
| NO_DATA | "Không có dữ liệu chấm công" |

### Acceptance Criteria
- AC-07: Bấm ngày → hiển thị giờ vào/ra hoặc trạng thái Vắng/Nghỉ

---

## SCR-05 — Hồ Sơ Cá Nhân

**Route:** `/profile`
**Actor:** ACT-01 (Nhân viên)
**Use Case:** UC-01

### Layout
```
┌─────────────────────────┐
│ Header: Cá nhân 👤     │
├─────────────────────────┤
│                         │
│      [Avatar Circle]    │
│       NV001             │
│                         │
│  ┌───────────────────┐  │
│  │ Họ tên            │  │
│  │ Nguyễn Văn A      │  │
│  ├───────────────────┤  │
│  │ Mã nhân viên      │  │
│  │ NV001             │  │
│  ├───────────────────┤  │
│  │ Bộ phận           │  │
│  │ Phòng Kỹ thuật    │  │
│  ├───────────────────┤  │
│  │ Email             │  │
│  │ nv001@company.com │  │
│  ├───────────────────┤  │
│  │ Số điện thoại      │  │
│  │ 0901 234 567      │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │  🚪 Đăng xuất     │  │
│  └───────────────────┘  │
│                         │
├─────────────────────────┤
│ Bottom Nav: 📷 📊 👤   │
└─────────────────────────┘
```

### Fields
| Field | Source | Display |
|---|---|---|
| Avatar | JWT / placeholder | Circle icon with initials |
| Employee code | JWT sub | Header + info card |
| Full name | JWT / user data | Info card |
| Department | user data | Info card |
| Email | user data | Info card |
| Phone | user data | Info card |

### Actions
| Action | Trigger | API Call | Success | Error |
|---|---|---|---|---|
| Logout | Click "Đăng xuất" | — | Navigate `/logout` | — |

### States
| State | UI |
|---|---|
| LOADED | All fields displayed |
| ERROR | "Không thể tải thông tin" |

### Acceptance Criteria
- Hiển thị đúng thông tin từ JWT token và user data
- Nút "Đăng xuất" navigate sang `/logout`
- Không có API call mới — dùng data từ auth context

---

## SCR-06 — Đăng Xuất

**Route:** `/logout`
**Actor:** ACT-01 (Nhân viên)
**API:** auth.logout
**Use Case:** UC-01

### Layout
```
┌─────────────────────────┐
│ Header: Cá nhân 👤     │
├─────────────────────────┤
│                         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │  🚪               │  │
│  │                   │  │
│  │  Đăng xuất        │  │
│  │  Bạn có chắc      │  │
│  │  muốn đăng xuất?  │  │
│  │                   │  │
│  │  ┌─────┬────────┐ │  │
│  │  │ Hủy │  Đồng ý│ │  │
│  │  └─────┴────────┘ │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

### Fields
| Field | Type | Display |
|---|---|---|
| Confirmation message | text | "Bạn có chắc muốn đăng xuất?" |
| Cancel button | button | "Hủy" (secondary) |
| Confirm button | button | "Đồng ý" (error/destructive) |

### Actions
| Action | Trigger | API Call | Success | Error |
|---|---|---|---|---|
| Cancel | Click "Hủy" | — | Navigate back `/profile` | — |
| Confirm Logout | Click "Đồng ý" | POST /api/auth/logout | Clear JWT → Redirect `/login` | Clear JWT anyway → Redirect `/login` |

### States
| State | UI |
|---|---|
| CONFIRMING | Dialog shown, buttons enabled |
| LOGGING_OUT | Buttons disabled, spinner |
| DONE | Redirect to `/login` |

### Acceptance Criteria
- Hiển thị dialog xác nhận trước khi đăng xuất
- Bấm "Hủy" → quay lại trang Profile
- Bấm "Đồng ý" → gọi API logout → xóa JWT → redirect `/login`
- Nếu API lỗi → vẫn xóa JWT client-side → redirect `/login`
