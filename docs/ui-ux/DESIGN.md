# DESIGN.md — Chấm Công QR

**AUTO:** 01C
**Purpose:** Lock App Shell, tokens, components — dùng chung toàn app
**Source of Truth cho Visual:** Approved Stitch sẽ là visual source, DESIGN.md là functional/structural source

---

## 1. App Shell

```
┌─────────────────────────────────┐
│  Header (sticky top)            │
│  - Height: 56px                 │
│  - Background: #1E293B (dark)   │
│  - Text: white                  │
│  - Logo (left) + Title (center) │
│  - User avatar/icon (right)     │
├─────────────────────────────────┤
│  Content (scrollable)           │
│  - Padding: 16px                │
│  - Max-width: 480px (centered)  │
│  - Background: #F8FAFC          │
├─────────────────────────────────┤
│  Bottom Nav (fixed bottom)      │
│  - Height: 56px                 │
│  - Background: white            │
│  - Border-top: 1px #E2E8F0     │
│  - 3 tabs: 📷 📊 👤            │
│  - Active: #3B82F6 (blue)       │
│  - Inactive: #94A3B8 (gray)    │
└─────────────────────────────────┘
```

---

## 2. Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#3B82F6` | Buttons, active nav, links |
| `--color-primary-dark` | `#2563EB` | Hover/active states |
| `--color-success` | `#22C55E` | Check-in/out success |
| `--color-warning` | `#F59E0B` | Late, missing checkout |
| `--color-error` | `#EF4444` | Out of range, absent |
| `--color-info` | `#3B82F6` | Informational |
| `--color-bg` | `#F8FAFC` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, forms |
| `--color-border` | `#E2E8F0` | Borders, dividers |
| `--color-text` | `#1E293B` | Primary text |
| `--color-text-secondary` | `#64748B` | Secondary text |
| `--color-header-bg` | `#1E293B` | Header background |

---

## 3. Typography

| Style | Font | Size | Weight | Usage |
|---|---|---|---|---|
| H1 | Inter | 24px | 700 | Page titles |
| H2 | Inter | 20px | 600 | Section headers |
| H3 | Inter | 16px | 600 | Card titles |
| Body | Inter | 14px | 400 | Default text |
| Caption | Inter | 12px | 400 | Secondary text |
| Button | Inter | 14px | 600 | Button labels |

---

## 4. Spacing

| Token | Value | Usage |
|---|---|---|
| `--space-xs` | 4px | Tight gaps |
| `--space-sm` | 8px | Small gaps |
| `--space-md` | 16px | Default padding |
| `--space-lg` | 24px | Section spacing |
| `--space-xl` | 32px | Page margins |

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 4px | Small elements |
| `--radius-md` | 8px | Cards, inputs |
| `--radius-lg` | 12px | Modals |
| `--radius-full` | 9999px | Pills, circles |

---

## 6. Components

### Button
```css
.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 14px;
  width: 100%;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Card
```css
.card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: var(--space-md);
}
```

### Input
```css
.input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
}

.input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### Status Badge
```css
.badge-success { background: #DCFCE7; color: #166534; }
.badge-warning { background: #FEF3C7; color: #92400E; }
.badge-error   { background: #FEE2E2; color: #991B1B; }
.badge-info    { background: #DBEAFE; color: #1E40AF; }
```

### Calendar Cell
```css
.calendar-cell {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.calendar-cell.on-time   { background: #DCFCE7; }
.calendar-cell.late      { background: #FEF3C7; }
.calendar-cell.absent    { background: #FEE2E2; }
.calendar-cell.day-off   { background: #F1F5F9; color: #94A3B8; }
.calendar-cell.missing   { background: #FEF9C3; }
```

---

## 7. States

| State | Behavior |
|---|---|
| Loading | Skeleton placeholder hoặc spinner |
| Empty | "Không có dữ liệu" với icon |
| Error | Red banner + retry button |
| Success | Green checkmark + message |
| Disabled | opacity: 0.5, cursor: not-allowed |

---

## 8. Accessibility

- Minimum touch target: 44x44px
- Color contrast: WCAG AA (4.5:1 for text)
- Focus visible on all interactive elements
- Screen reader labels on all buttons
- Keyboard navigation support

---

## 9. Responsive

- Mobile-first design (375px base)
- Max-width container: 480px centered
- Bottom nav fixed on mobile
- Header sticky on scroll
