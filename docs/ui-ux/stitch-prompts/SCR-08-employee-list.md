# Stitch Prompt — SCR-08 Danh Sách Nhân Viên

## GLOBAL DESIGN LOCK
- Font: Inter
- Colors: primary #003d9b, background #f9f9ff, surface #f9f9ff
- Border radius: 4px/8px/12px
- Mobile-first, 375px width
- Bottom Navigation: Dashboard | Nhân viên | Thống kê

---

## Screen: Employee List (Admin)

**Route:** `/admin/employees`
**Screen ID:** SCR-08
**App Shell:** Yes (Header + Admin Bottom Nav)
**Actor:** ACT-02 (Admin)
**API:** admin.employees

### Layout Description

Create a mobile employee list page with:

1. **Header bar:**
   - Left: Back arrow icon (navigate to `/admin`)
   - Center: "Nhân viên" title (headline-lg, 24px, weight 600)
   - Right: Filter icon (outline color)

2. **Search bar (margin 16px horizontal):**
   - Full width, rounded-xl, white bg, border 1px outline-variant
   - Left: Search icon (20px, outline color)
   - Placeholder: "Tìm nhân viên..." (body-md, 14px, outline color)
   - Padding: 12px 16px
   - On focus: border primary color

3. **Filter tabs (horizontal, gap 8px, margin-top 12px, padding 0 16px):**
   - **Tab 1:** "Tất cả (24)" — active tab: bg primary, text white, rounded-full, padding 8px 16px
   - **Tab 2:** "Đã điểm danh (18)" — inactive: bg surface-container, text on-surface, rounded-full
   - **Tab 3:** "Chưa điểm danh (6)" — inactive: bg surface-container, text on-surface, rounded-full
   - Horizontal scroll if overflow

4. **Employee list (margin-top 12px, gap 1px, bg outline-variant):**
   - Each row (rounded-none, white bg, padding 16px):
     - **Left:** Avatar circle (40px, primary bg, white initials "NV")
     - **Center-Top:** Employee name "Nguyễn Văn A" (body-lg, 16px, weight 500)
     - **Center-Bottom:** Employee code "NV001 • Phòng Kỹ thuật" (body-sm, 12px, on-surface-variant)
     - **Right-Bottom:** Check-in time "08:15" (body-sm, 12px, on-surface-variant)
     - **Right-Top:** Status badge
       - "✓ Đúng giờ" → success-container bg (#dcfce7), success text (#1a7c3e), rounded-full, padding 4px 10px
       - "◐ Đi trễ" → warning-container bg (#fff8e1), warning text (#7c5c00), rounded-full
       - "○ Vắng" → error-container bg (#ffdad6), error text (#ba1a1a), rounded-full
       - "◑ Thiếu CO" → surface-container bg (#e7eefe), primary text (#003d9b), rounded-full
     - Tap row → Navigate `/admin/employees/:id`
   - First row: rounded-t-xl
   - Last row: rounded-b-xl

5. **Empty state (if no results):**
   - Centered illustration (search icon, 64px, outline-variant color)
   - Title: "Không tìm thấy" (headline-md, 20px, weight 600)
   - Subtitle: "Không có nhân viên phù hợp" (body-md, 14px, on-surface-variant)

6. **Bottom Navigation (Admin):**
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
- Employee name: 16px/24px, weight 500
- Employee info: 12px/16px, weight 400
- Badge text: 12px/16px, weight 500
- Tab text: 14px/20px, weight 500

### Spacing
- Page margin: 16px
- Search bar padding: 12px 16px
- Filter tab padding: 8px 16px
- Filter tab gap: 8px
- List row padding: 16px
- List row gap: 1px (divider)

### Data Structure
| Field | Type | API Field |
|---|---|---|
| Employee ID | string | `id` |
| Full name | string | `fullName` |
| Employee code | string | `employeeCode` |
| Department | string | `department` |
| Check-in time | time | `checkInTime` (null if not checked in) |
| Status | enum | `status` (ON_TIME / LATE / ABSENT / MISSING_CHECKOUT) |

### Acceptance Criteria
- AC-01: Hiển thị tất cả nhân viên khi chưa filter
- AC-02: Filter "Đã điểm danh" chỉ hiện nhân viên có check-in
- AC-03: Filter "Chưa điểm danh" chỉ hiện nhân viên chưa check-in
- AC-04: Search theo tên hoặc mã nhân viên (real-time filter)
- AC-05: Tap row → navigate đến chi tiết nhân viên
- AC-06: Hiển thị empty state khi không có kết quả
