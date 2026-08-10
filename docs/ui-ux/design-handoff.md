# DESIGN HANDOFF — AUTO 02A

> Bằng chứng Visual Handoff từ Stitch export → React implementation
> Ngày tạo: 2026-08-10
> Trạng thái: ✅ PASS

---

## 1. Stitch Export Inventory

| Screen ID | Folder | Title | code.html | screen.png | Status |
|---|---|---|---|---|---|
| SCR-01 | SCR-01-login | Đăng nhập | ✅ | ✅ | APPROVED |
| SCR-02 | SCR-02-home-checkin | Chấm Công QR | ✅ | ✅ | APPROVED |
| SCR-03 | SCR-03-stats | Thống kê Chấm công | ✅ | ✅ | APPROVED |
| SCR-04 | SCR-04-day-detail | Chi Tiết Ngày | ✅ | ✅ | APPROVED |
| SCR-05 | SCR-05-profile | Hồ Sơ Cá Nhân | ✅ | ✅ | APPROVED |
| SCR-06 | SCR-06-logout | Đăng Xuất | ✅ | ✅ | APPROVED |

**Tổng:** 6/6 screens từ Stitch — đầy đủ code.html + screen.png

---

## 2. Design Tokens (extracted from code.html)

### 2.1 Color Tokens (Material Design 3)

| Token | Value | Usage |
|---|---|---|
| `primary` | `#003d9b` | Buttons, links, active nav |
| `primary-container` | `#0052cc` | Button backgrounds |
| `on-primary` | `#ffffff` | Text on primary |
| `background` | `#f9f9ff` | Page background |
| `surface` | `#f9f9ff` | Card background |
| `surface-container` | `#e7eefe` | Input backgrounds |
| `surface-container-low` | `#f0f3ff` | Light card bg |
| `on-surface` | `#151c27` | Primary text |
| `on-surface-variant` | `#434654` | Secondary text |
| `outline` | `#737685` | Borders, icons |
| `outline-variant` | `#c3c6d6` | Light borders |
| `error` | `#ba1a1a` | Error states |
| `error-container` | `#ffdad6` | Error bg |
| `success` | `#16a34a` | Success badge (SCR-04) |
| `success-container` | `#dcfce7` | Success bg |

### 2.2 Typography

| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `display` | 30px | 38px | 700 | Page titles |
| `headline-lg` | 24px | 32px | 600 | Section headers |
| `headline-md` | 20px | 28px | 600 | Card titles |
| `body-lg` | 16px | 24px | 400 | Body text |
| `body-md` | 14px | 20px | 400 | Secondary text |
| `label-bold` | 12px | 16px | 600 | Badges, labels |
| `label-md` | 12px | 16px | 500 | Small labels |
| Font Family | Inter | — | 400-700 | All text |

### 2.3 Spacing

| Token | Value | Usage |
|---|---|---|
| `xs` | 4px | Tight gaps |
| `sm` | 8px | Small gaps |
| `md` / `gutter` | 16px | Standard padding |
| `margin-mobile` | 16px | Mobile page margin |
| `lg` | 24px | Section spacing |
| `xl` | 32px | Large spacing |

### 2.4 Border Radius

| Token | Value | Usage |
|---|---|---|
| `DEFAULT` | 0.25rem (4px) | Small elements |
| `lg` | 0.5rem (8px) | Cards, inputs |
| `xl` | 0.75rem (12px) | Large cards |
| `full` | 9999px | Pills, avatars |

---

## 3. Screen-by-Screen Visual Analysis

### SCR-01 — Login (`/login`)

**Layout:** Centered card on light background
- QR icon in blue circle (primary color)
- Title: "Chấm Công QR" (display, 30px, bold)
- Subtitle: "Hệ thống quản lý chấm công nội bộ" (body-md)
- Username field with person icon (surface-container bg)
- Password field with lock icon
- "Đăng nhập" button (primary-container, full width, rounded-xl)
- "Quên mật khẩu?" link (primary color)

**Components:** InputField, Button, Link

---

### SCR-02 — Home Checkin (`/`)

**Layout:** App Shell + Bottom Nav
- **Header:** Hamburger menu | "Chấm Công QR" title | Avatar
- **Welcome:** "Chào mừng," (headline-lg) + "NV001!" (primary color)
- **QR Card:** Rounded card with QR placeholder, instruction text
- **CTA Button:** "Quét ngay" with camera icon (primary, full width)
- **Location Card:** Blue bg, location pin icon, "Vị trí hợp lệ", distance
- **Bottom Nav:** Check-in (active, green) | Thống kê | Cá nhân

**Components:** AppShell, BottomNav, QRCard, LocationBadge

---

### SCR-03 — Stats (`/stats`)

**Layout:** App Shell + Bottom Nav
- **Header:** Avatar | "Chấm Công QR" | Bell icon
- **Title:** "Thống kê" (headline-lg)
- **Toggle:** Tuần | Tháng (pill toggle, active = primary bg)
- **Week Navigator:** `<` Tuần 10/08 - 16/08 `>` (card)
- **Calendar Grid:** T2-T6 + CN, circular day markers with colored dots
  - Green = Đúng giờ
  - Yellow = Đi trễ/Về sớm
  - Orange = Thiếu Check-out
  - Red = Vắng mặt
  - Gray = Ngày nghỉ
- **Weekly Detail:** Cards with date, time range, status badge (Đúng giờ/Đi trễ/Thiếu ra)
- **Legend:** Color-coded status explanations
- **Bottom Nav:** Check-in | Thống kê (active, blue) | Cá nhân

**Components:** ToggleGroup, WeekNavigator, CalendarGrid, DayCard, StatusBadge, Legend

---

### SCR-04 — Day Detail (`/stats/day/:date`)

**Layout:** Back navigation + Detail content (no bottom nav)
- **Header:** Back arrow | "Chi tiết 10/08/2026" (headline-lg)
- **Status Badge:** "Đúng giờ" (green pill) + full date
- **Check-in Card:** Green left border
  - "Giờ vào" + time "08:15" (display) with seconds "32" (small)
  - Location info (pin icon, coordinates, address)
  - Distance (bus icon, "3.5m")
  - Device (phone icon, "iPhone 14 Pro Max")
- **Check-out Card:** Same layout as check-in
  - "Giờ ra" + time "17:35" with seconds "12"
- **Summary Card:** "Tổng kết ngày"
  - "Tổng thời gian làm việc" → "9h 20m" (headline)
  - "Ghi chú" → "Không có"

**Components:** BackHeader, AttendanceCard, TimeDisplay, InfoRow, SummaryCard

---

## 4. Design Handoff Mapping

| Screen ID | Route | React Page | Key Components | API Endpoints |
|---|---|---|---|---|
| SCR-01 | `/login` | `LoginPage` | InputField, Button | `auth.login`, `auth.refresh` |
| SCR-02 | `/` | `HomePage` | AppShell, BottomNav, QRCard, LocationBadge | `checkin.submit`, `admin.updateLocation` |
| SCR-03 | `/stats` | `StatsPage` | AppShell, BottomNav, ToggleGroup, CalendarGrid, DayCard | `stats.list` |
| SCR-04 | `/stats/day/:date` | `DayDetailPage` | BackHeader, AttendanceCard, SummaryCard | `stats.dayDetail` |
| SCR-05 | `/profile` | `ProfilePage` | AppShell, BottomNav, InfoCard, Avatar, LogoutButton | — (client-side) |
| SCR-06 | `/logout` | `LogoutPage` | ConfirmDialog, DestructiveButton | `auth.logout` |

---

## 5. MCP Capability Assessment

| Capability | Status | Notes |
|---|---|---|
| Full HTML | ✅ Available | code.html contains complete Tailwind markup |
| Screenshot | ✅ Available | screen.png for visual reference |
| Color Tokens | ✅ Extracted | Material Design 3 palette from tailwind.config |
| Typography | ✅ Extracted | Inter font family, 7 size tokens |
| Spacing | ✅ Extracted | 7 spacing tokens |
| Border Radius | ✅ Extracted | 4 radius tokens |
| Live API | ❌ Not available | Local export mode |
| Real-time Sync | ❌ Not available | Static export |

**Kết luận:** Đầy đủ visual data từ code.html + screen.png. Không cần Stitch MCP live.

---

## 6. DESIGN_HANDOFF_GATE Checklist

- [x] Đúng project (4 screens, QR Attendance System)
- [x] Đủ screen mapping (SCR-01 → SCR-04)
- [x] Biết rõ capability (local-export: HTML + PNG + tokens)
- [x] Có dữ liệu handoff thực tế (code.html, screen.png, color/typography/spacing tokens)
- [x] Route mapping rõ ràng
- [x] Component inventory đầy đủ

**✅ DESIGN_HANDOFF_GATE = PASS**
