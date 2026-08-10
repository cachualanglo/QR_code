# Stitch Prompt — SCR-06 Đăng Xuất

## GLOBAL DESIGN LOCK
- Font: Inter
- Colors: primary #003d9b, background #f9f9ff, surface #f9f9ff
- Border radius: 4px/8px/12px
- Mobile-first, 375px width
- Bottom Navigation: Chấm công | Thống kê | Cá nhân

---

## Screen: Logout Confirmation

**Route:** `/logout`
**Screen ID:** SCR-06
**App Shell:** Yes (Header + Bottom Nav)

### Layout Description

Create a mobile logout confirmation page with:

1. **Header bar:**
   - Left: Avatar circle (blue bg, white initials "NV")
   - Center: "Cá nhân" title (headline-lg, 24px, weight 600)
   - Right: Notification bell icon (outline color)

2. **Confirmation card (centered, rounded-xl, white bg, padding 24px):**
   - Icon: Logout icon (64px, error color #ba1a1a, centered)
   - Title: "Đăng xuất" (headline-lg, 24px, weight 600, on-surface, centered)
   - Subtitle: "Bạn có chắc muốn đăng xuất khỏi hệ thống?" (body-md, 14px, on-surface-variant, centered)
   - Vertical spacing: 24px between icon and title, 8px between title and subtitle

3. **Action buttons (horizontal, gap 12px, margin-top 32px):**
   - Left button: "Hủy" (secondary style)
     - Background: surface-container (#e7eefe)
     - Text: primary color (#003d9b)
     - Weight: 600
     - Padding: 12px 24px, rounded-lg
     - Width: 50%
   - Right button: "Đồng ý" (destructive style)
     - Background: error (#ba1a1a)
     - Text: white (#ffffff)
     - Weight: 600
     - Padding: 12px 24px, rounded-lg
     - Width: 50%

4. **Bottom Navigation:**
   - 3 tabs: Chấm công (camera icon) | Thống kê (bar_chart icon) | Cá nhân (person icon)
   - "Cá nhân" tab is active (primary color, filled icon)
   - Others: outline icon, outline color

### Color Tokens
- Background: #f9f9ff
- Card: #ffffff
- Primary: #003d9b
- On-surface: #151c27
- On-surface-variant: #434654
- Error: #ba1a1a
- Surface-container: #e7eefe

### Typography
- Title: 24px/32px, weight 600
- Subtitle: 14px/20px, weight 400
- Button text: 14px/20px, weight 600

### Spacing
- Page margin: 16px
- Card padding: 24px
- Button gap: 12px
- Button padding: 12px 24px
