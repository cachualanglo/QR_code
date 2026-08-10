# Stitch Prompt — SCR-05 Hồ Sơ Cá Nhân

## GLOBAL DESIGN LOCK
- Font: Inter
- Colors: primary #003d9b, background #f9f9ff, surface #f9f9ff
- Border radius: 4px/8px/12px
- Mobile-first, 375px width
- Bottom Navigation: Chấm công | Thống kê | Cá nhân

---

## Screen: Profile Page

**Route:** `/profile`
**Screen ID:** SCR-05
**App Shell:** Yes (Header + Bottom Nav)

### Layout Description

Create a mobile profile page with:

1. **Header bar:**
   - Left: Avatar circle (blue bg, white initials "NV")
   - Center: "Cá nhân" title (headline-lg, 24px, weight 600)
   - Right: Notification bell icon (outline color)

2. **User info card:**
   - Centered avatar (64px circle, primary bg)
   - Employee code below avatar: "NV001" (label-bold, 12px, primary color)
   - Full name: "Nguyễn Văn A" (headline-md, 20px, weight 600, on-surface)

3. **Info list card (rounded-xl, white bg, padding 16px):**
   - Row: Icon (person) | Label "Họ tên" | Value "Nguyễn Văn A"
   - Divider (1px, outline-variant)
   - Row: Icon (badge) | Label "Mã nhân viên" | Value "NV001"
   - Divider
   - Row: Icon (business) | Label "Bộ phận" | Value "Phòng Kỹ thuật"
   - Divider
   - Row: Icon (email) | Label "Email" | Value "nv001@company.com"
   - Divider
   - Row: Icon (phone) | Label "Số điện thoại" | Value "0901 234 567"

4. **Logout button:**
   - Full width, rounded-xl
   - Background: error-container (#ffdad6)
   - Text: "Đăng xuất" (error color #ba1a1a)
   - Icon: logout (error color)
   - Padding: 16px vertical

5. **Bottom Navigation:**
   - 3 tabs: Chấm công (camera icon) | Thống kê (bar_chart icon) | Cá nhân (person icon)
   - "Cá nhân" tab is active (primary color, filled icon)
   - Others: outline icon, outline color

### Color Tokens
- Background: #f9f9ff
- Card: #ffffff
- Primary: #003d9b
- On-surface: #151c27
- On-surface-variant: #434654
- Outline: #737685
- Outline-variant: #c3c6d6
- Error: #ba1a1a
- Error-container: #ffdad6

### Typography
- Title: 24px/32px, weight 600
- Name: 20px/28px, weight 600
- Label: 12px/16px, weight 500
- Value: 16px/24px, weight 400

### Spacing
- Page margin: 16px
- Card padding: 16px
- Row gap: 12px
- Divider margin: 12px 0
