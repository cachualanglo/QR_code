# Stitch Prompt — SCR-09 Chi Tiết Nhân Viên

## GLOBAL DESIGN LOCK
- Font: Inter
- Colors: primary #003d9b, background #f9f9ff, surface #f9f9ff
- Border radius: 4px/8px/12px
- Mobile-first, 375px width
- Bottom Navigation: Dashboard | Nhân viên | Thống kê

---

## Screen: Employee Detail (Admin)

**Route:** `/admin/employees/:id`
**Screen ID:** SCR-09
**App Shell:** Yes (Header + Admin Bottom Nav)
**Actor:** ACT-02 (Admin)
**API:** admin.employeeAttendance

### Layout Description

Create a mobile employee detail page with:

1. **Header bar:**
   - Left: Back arrow icon (navigate to `/admin/employees`)
   - Center: "Chi tiết nhân viên" title (headline-lg, 24px, weight 600)
   - Right: More options icon (3-dot menu, outline color)

2. **Employee profile card (rounded-xl, white bg, padding 16px, margin 16px horizontal):**
   - **Top section (horizontal layout):**
     - Left: Avatar circle (56px, primary bg, white initials "NV", headline-md weight)
     - Left of avatar: Gap 12px
     - Right of avatar:
       - Name: "Nguyễn Văn A" (headline-md, 20px, weight 600, on-surface)
       - Code: "NV001" (label-md, 12px, primary color, weight 500)
   - **Divider (1px, outline-variant, margin 12px 0)**
   - **Info rows (gap 8px):**
     - Row: Icon (business, 18px, outline) | Label "Bộ phận:" (body-sm, 12px, on-surface-variant) | Value "Phòng Kỹ thuật" (body-md, 14px, weight 500)
     - Row: Icon (email, 18px, outline) | Label "Email:" | Value "nv001@company.com"
     - Row: Icon (phone, 18px, outline) | Label "Điện thoại:" | Value "0901 234 567"

3. **Date selector (margin-top 16px, padding 0 16px):**
   - Title: "Lịch sử điểm danh" (title-md, 16px, weight 600)
   - **Date navigation row (margin-top 8px):**
     - Left: Chevron left icon (24px, primary)
     - Center: "Tháng 8, 2026" (body-lg, 16px, weight 500)
     - Right: Chevron right icon (24px, primary)
   - **Month calendar grid (7 columns, gap 2px, margin-top 8px):**
     - Header row: T2 | T3 | T4 | T5 | T6 | T7 | CN (label-sm, 11px, on-surface-variant, centered)
     - Day cells (40px height, rounded-lg):
       - Day number (body-sm, 14px)
       - Status dot (8px circle, bottom-center):
         - ✓ Green dot: checked in (ON_TIME)
         - ◐ Orange dot: late (LATE)
         - ○ Red dot: absent (ABSENT)
         - Gray dot: day off / future
       - Selected day: primary bg, white text, rounded-lg
       - Today: primary border (2px)
       - Tap day → scroll to that day's detail below

4. **Attendance timeline (margin-top 16px, padding 0 16px):**
   - Section title: "Chi tiết theo ngày" (title-md, 16px, weight 600, margin-bottom 12px)
   - **Day group card (rounded-xl, white bg, padding 16px, margin-bottom 12px):**
     - **Day header:**
       - Date: "Thứ Hai, 10/08/2026" (body-lg, 14px, weight 600)
       - Status badge: "✓ Đúng giờ" (success-container, success text, rounded-full, padding 4px 10px)
     - **Divider (1px, outline-variant, margin 8px 0)**
     - **Check-in record:**
       - Left: Green vertical line (3px, 24px height) + Green dot (8px)
       - Right: Label "Check-in" (label-sm, 11px, on-surface-variant)
       - Right: Time "08:15:32" (body-lg, 16px, weight 500)
       - Right: Location icon + "Tầng 3, Tòa A" (body-sm, 12px, on-surface-variant)
       - Right: Distance icon + "3.5m" (body-sm, 12px, on-surface-variant)
     - **Check-out record (if exists):**
       - Left: Orange vertical line (3px, 24px height) + Orange dot (8px)
       - Right: Label "Check-out" (label-sm, 11px, on-surface-variant)
       - Right: Time "17:42:15" (body-lg, 16px, weight 500)
       - Right: Location icon + "Tầng 3, Tòa A"
       - Right: Duration icon + "9h 27m" (body-sm, 12px, primary color, weight 500)
     - **Missing checkout note (if applicable):**
       - Left: Red vertical line (3px, 24px height) + Red dot (8px)
       - Right: "Thiếu check-out" (body-sm, 12px, error color)
   - **Multiple day groups:** Repeat for each day with data

5. **Bottom Navigation (Admin):**
   - 3 tabs: Dashboard (dashboard icon) | Nhân viên (people icon) | Thống kê (bar_chart icon)
   - "Nhân viên" tab is active (primary color, filled icon)
   - Others: outline icon, outline color

### Color Tokens
- Background: #f9f9ff
- Card: #ffffff
- Primary: #003d9b
- On-surface: #151c27
- On-surface-variant: #434654
- Outline: #737685
- Outline-variant: #c3c6d6
- Success: #1a7c3e
- Success-container: #dcfce7
- Warning: #7c5c00
- Warning-container: #fff8e1
- Error: #ba1a1a
- Error-container: #ffdad6
- Surface-container: #e7eefe

### Typography
- Title: 24px/32px, weight 600
- Employee name: 20px/28px, weight 600
- Employee code: 12px/16px, weight 500
- Body: 14px/20px, weight 400
- Body bold: 16px/24px, weight 500
- Label: 11px/16px, weight 400
- Calendar day: 14px/20px, weight 400

### Spacing
- Page margin: 16px
- Card padding: 16px
- Card margin-bottom: 12px
- Row gap: 8px
- Divider margin: 8px 0
- Timeline left padding: 24px (for vertical line)

### Data Structure
| Field | Type | API Field |
|---|---|---|
| Employee ID | string | `id` |
| Full name | string | `fullName` |
| Employee code | string | `employeeCode` |
| Department | string | `department` |
| Email | string | `email` |
| Phone | string | `phone` |
| Attendance records | array | `attendance[]` |
| → Date | date | `attendance[].date` |
| → Check-in time | datetime | `attendance[].checkInTime` |
| → Check-out time | datetime | `attendance[].checkOutTime` |
| → Check-in location | string | `attendance[].checkInLocation` |
| → Check-out location | string | `attendance[].checkOutLocation` |
| → Check-in distance | number | `attendance[].checkInDistance` |
| → Check-out distance | number | `attendance[].checkOutDistance` |
| → Status | enum | `attendance[].status` |
| → Duration | number | `attendance[].durationMs` |

### Acceptance Criteria
- AC-01: Hiển thị thông tin nhân viên đầy đủ (tên, mã, bộ phận, email, SĐT)
- AC-02: Calendar hiển thị trạng thái điểm danh theo màu sắc
- AC-03: Tap vào ngày → scroll đến chi tiết ngày đó
- AC-04: Hiển thị check-in/check-out times với location và distance
- AC-05: Hiển thị duration (thời gian làm việc) cho mỗi ngày
- AC-06: Hiển thị "Thiếu check-out" nếu chỉ có check-in
- AC-07: Navigate giữa các tháng bằng mũi tên
- AC-08: Back button quay lại danh sách nhân viên
