---
name: Chấm Công QR
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#434654'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#505f7b'
  on-secondary: '#ffffff'
  secondary-container: '#ceddfe'
  on-secondary-container: '#52617d'
  tertiary: '#7b2600'
  on-tertiary: '#ffffff'
  tertiary-container: '#a33500'
  on-tertiary-container: '#ffc6b2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#b7c7e7'
  on-secondary-fixed: '#0b1c34'
  on-secondary-fixed-variant: '#384762'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59b'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#812800'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
---

## Brand & Style
The design system is built on a **Modern Corporate** aesthetic with a heavy emphasis on **Functional Minimalism**. It is designed for high-frequency, mobile-first utility where speed of task completion (checking in/out) is the primary metric of success.

The visual language evokes a sense of reliability and institutional trust. It avoids decorative clutter, favoring generous whitespace and a clear information hierarchy. The interface utilizes a "Surface-on-Surface" approach, using subtle tonal shifts to separate content blocks, ensuring that the primary action—the QR scan—remains the focal point of the user experience.

## Colors
The palette is anchored by a high-contrast **Corporate Blue** (#0052CC) to signify professionalism and stability. 

### Semantic Roles
- **Success (Green):** Used for confirmed check-ins, "on-time" status badges, and completed actions.
- **Warning (Amber):** Identifies pending actions, late arrivals, or missing "check-out" entries.
- **Error (Red):** Flags absence, out-of-range attempts, or system failures.
- **Neutral (Grays):** Reserved for background surfaces, secondary text, and inactive states (e.g., weekends or public holidays).

Backgrounds utilize a very light gray (#F9FAFB) to reduce screen glare while maintaining a crisp, professional look.

## Typography
This design system utilizes **Inter** for its exceptional legibility on mobile screens and its neutral, systematic character.

- **Scale:** Headings use a tighter letter-spacing to appear more cohesive, while labels use slightly increased tracking to ensure readability at small sizes.
- **Mobile Optimization:** Headline sizes are capped at 30px to prevent awkward text wrapping on narrow devices.
- **Hierarchy:** Use `label-bold` in all-caps for category headers or status indicators to provide a strong visual anchor without requiring large font sizes.

## Layout & Spacing
The layout follows an **8pt grid system** to maintain vertical rhythm. 

- **Mobile Layout:** Uses a 4-column fluid grid with 16px side margins and 16px gutters.
- **Touch Targets:** All interactive elements (buttons, list items) must maintain a minimum height of 48px to ensure ease of use during high-activity periods (e.g., morning rush check-ins).
- **Padding:** Use `md` (16px) for internal card padding and `lg` (24px) for vertical section spacing.

## Elevation & Depth
Hierarchy is established through **Tonal Layering** supplemented by **Ambient Shadows**.

1.  **Level 0 (Background):** #F9FAFB. The lowest layer.
2.  **Level 1 (Cards/Sheet):** White (#FFFFFF) with a soft, diffused shadow (0px 2px 4px rgba(0,0,0,0.05)).
3.  **Level 2 (Interactive/Floating):** White (#FFFFFF) with a more pronounced shadow (0px 4px 12px rgba(0,0,0,0.1)) to indicate "pressable" depth.

Bottom Navigation uses a subtle top border (#E5E7EB) instead of a heavy shadow to maintain a clean transition from the main content area.

## Shapes
The design system employs a **Rounded** corner strategy (8px) to soften the professional aesthetic and make the application feel more modern and accessible.

- **Buttons & Cards:** 8px (rounded-md).
- **Status Badges:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.
- **Input Fields:** 8px to match the button language for a unified form-entry experience.

## Components

### Buttons
- **Primary:** Solid Corporate Blue with white text. High-contrast, 48px minimum height.
- **Secondary:** Transparent background with Blue border and text. Used for "Cancel" or "View History."
- **States:** 
  - *Loading:* Replace text with a centered spinner; maintain button width.
  - *Disabled:* #E5E7EB background with #9CA3AF text; remove shadow.

### Cards
- Used for individual attendance records. 
- Must include a left-hand color "accent bar" (2px width) that matches the semantic status (Success, Warning, Error).

### Bottom Navigation
- Fixed 56px height.
- Active state uses Primary Blue for both icon and label; inactive state uses Neutral Gray.

### Attendance Grid (Calendar)
- Use a 7-column grid with circular day indicators. 
- Indicators use a small 4px dot below the date to signify status (Green/Amber/Red) to ensure the text remains legible.

### QR Scanner Overlay
- Dark semi-transparent mask with a clear, rounded-corner "viewfinder" in the center. 
- Include a haptic feedback trigger and a visual "Green Flash" frame upon successful scan.