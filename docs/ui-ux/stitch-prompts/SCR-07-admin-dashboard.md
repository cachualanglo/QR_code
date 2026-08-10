# Stitch Prompt — SCR-07 Admin Dashboard

## GLOBAL DESIGN LOCK
- Font: Inter
- Colors: primary #003d9b, background #f9f9ff, surface #f9f9ff
- Border radius: 4px/8px/12px
- Mobile-first, 375px width
- Bottom Navigation: Dashboard | Nhân viên | Thống kê

---

## Screen: Admin Dashboard

**Route:** `/admin`
**Screen ID:** SCR-07
**App Shell:** Yes (Header + Admin Bottom Nav)
**Actor:** ACT-02 (Admin)

### Layout Description

Create a mobile admin dashboard page with:

1. **Header bar:**
   - Left: Admin shield icon (24px, primary color)
   - Center: "Quản trị" title (headline-lg, 24px, weight 600)
   - Right: Notification bell icon (outline color)

2. **Greeting section (margin-top 8px):**
   - Greeting: "Xin chào, Admin!" (headline-md, 20px, weight 600, on-surface)
   - Subtitle: "Tổng quan điểm danh hôm nay" (body-sm, 14px, on-surface-variant)

3. **Summary stats row (3 cards, horizontal scroll, gap 12px):**
   - **Card 1 - Total Employees:**
     - Icon: people (32px, primary color)
     - Value: "24" (headline-xl, 28px, weight 700, primary color)
     - Label: "Tổng nhân viên" (label-md, 12px, on-surface-variant)
     - Background: surface-container (#e7eefe)
     - Border radius: rounded-xl (16px)
     - Padding: 16px
   - **Card 2 - Checked In:**
     - Icon: check_circle (32px, success color #1a7c3e)
     - Value: "18" (headline-xl, 28px, weight 700, success color)
     - Label: "Đã điểm danh" (label-md, 12px, on-surface-variant)
     - Background: success-container (#dcfce7)
     - Border radius: rounded-xl
     - Padding: 16px
   - **Card 3 - Pending:**
     - Icon: pending (32px, warning color #7c5c00)
     - Value: "6" (headline-xl, 28px, weight 700, warning color)
     - Label: "Chưa điểm danh" (label-md, 12px, on-surface-variant)
     - Background: warning-container (#fff8e1)
     - Border radius: rounded-xl
     - Padding: 16px

4. **Quick actions section (margin-top 24px):**
   - Section title: "Thao tác nhanh" (title-md, 16px, weight 600, on-surface)
   - **Action 1 - View all employees:**
     - Row card (rounded-xl, white bg, padding 16px)
     - Left: Icon (people, primary color)
     - Center: Title "Danh sách nhân viên" (body-lg, 16px, weight 500)
     - Center: Subtitle "Xem tất cả nhân viên" (body-sm, 12px, on-surface-variant)
     - Right: Chevron right icon (outline color)
     - Tap → Navigate `/admin/employees`
   - **Action 2 - Today's attendance:**
     - Row card (rounded-xl, white bg, padding 16px)
     - Left: Icon (event_available, success color)
     - Center: Title "Điểm danh hôm nay" (body-lg, 16px, weight 500)
     - Center: Subtitle "18/24 đã điểm danh" (body-sm, 12px, on-surface-variant)
     - Right: Chevron right icon (outline color)
     - Tap → Navigate `/admin/employees?filter=checked-in`

5. **Recent check-ins section (margin-top 24px):**
   - Section title: "Điểm danh gần đây" (title-md, 16px, weight 600, on-surface)
   - **List (gap 8px):**
     - **Item 1:**
       - Left: Avatar circle (40px, primary bg, white initials "NVA")
       - Center: Name "Nguyễn Văn A" (body-lg, 16px, weight 500)
       - Center: Time "Check-in lúc 08:15" (body-sm, 12px, on-surface-variant)
       - Right: Status badge "✓ Đúng giờ" (success-container bg, success text, rounded-full, padding 4px 12px)
     - **Item 2:**
       - Left: Avatar circle (40px, primary bg, white initials "TVB")
       - Center: Name "Trần Văn B" (body-lg, 16px, weight 500)
       - Center: Time "Check-in lúc 08:42" (body-sm, 12px, on-surface-variant)
       - Right: Status badge "◐ Đi trễ" (warning-container bg, warning text, rounded-full)
     - **Item 3:**
       - Left: Avatar circle (40px, primary bg, white initials "LTC")
       - Center: Name "Lê Thị C" (body-lg, 16px, weight 500)
       - Center: Time "Check-in lúc 08:28" (body-sm, 12px, on-surface-variant)
       - Right: Status badge "✓ Đúng giờ" (success-container bg, success text, rounded-full)
   - Divider between items (1px, outline-variant)

6. **Bottom Navigation (Admin):**
   - 3 tabs: Dashboard (dashboard icon) | Nhân viên (people icon) | Thống kê (bar_chart icon)
   - "Dashboard" tab is active (primary color, filled icon)
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
- Surface-container: #e7eefe

### Typography
- Title: 24px/32px, weight 600
- Headline: 20px/28px, weight 600
- Stat value: 28px/36px, weight 700
- Body: 16px/24px, weight 400
- Body bold: 16px/24px, weight 500
- Label: 12px/16px, weight 400

### Spacing
- Page margin: 16px
- Card padding: 16px
- Card gap: 12px
- Section margin-top: 24px
- Row gap: 8px
