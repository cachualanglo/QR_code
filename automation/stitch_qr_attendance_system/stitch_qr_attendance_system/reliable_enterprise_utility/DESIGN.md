---
name: Reliable Enterprise Utility
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444653'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#006e2d'
  on-secondary: '#ffffff'
  secondary-container: '#7cf994'
  on-secondary-container: '#007230'
  tertiary: '#611e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#872d00'
  on-tertiary-container: '#ffa582'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#7ffc97'
  secondary-fixed-dim: '#62df7d'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005320'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb599'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#7f2b00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
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
  2xl: 48px
  container-margin: 20px
  touch-target-min: 48px
---

## Brand & Style
The design system is built on a foundation of **Modern Corporate** efficiency, prioritizing speed, accuracy, and professional trust. As a mobile-first application for enterprise attendance, the aesthetic is clean and functional, stripping away unnecessary ornamentation to focus on the core user action: the scan.

The visual narrative centers on "Verification." Every UI element should feel deliberate and secure. We utilize a systematic approach with generous whitespace and a structured layout to reduce cognitive load for employees clocking in during high-pressure morning rushes. The emotional response should be one of reliability—the user must feel confident that their action has been recorded correctly and securely.

## Colors
The palette uses high-signal colors to provide instant feedback without requiring the user to read text. 

- **Primary (Blue):** Used for the main navigation, primary actions, and branding. It signifies the authoritative nature of the enterprise system.
- **Success (Green):** Reserved strictly for successful check-in/out confirmations.
- **Warning (Orange):** Used for late arrivals or grace-period notifications.
- **Error (Red):** Used for out-of-bounds locations, invalid QR codes, or failed synchronization.
- **Neutral (Slate):** A range of cool grays used for backgrounds (`#F8FAFC`), borders (`#E2E8F0`), and secondary text to maintain a professional, tech-forward environment.

## Typography
This design system utilizes **Inter** exclusively to leverage its exceptional legibility on mobile screens and its neutral, systematic tone. 

The type scale is optimized for "glanceability." Headlines are bold and slightly tracked-in for a punchy, modern feel. Body text maintains a generous line height to ensure readability in various lighting conditions (e.g., scanning a QR code outdoors or in bright lobbies). Labels use a medium-to-semibold weight to clearly distinguish metadata from primary content.

## Layout & Spacing
The layout follows a **fluid mobile-first grid** with a 4px baseline rhythm. 

- **Margins:** A standard 20px horizontal margin is maintained on mobile to prevent content from hitting the screen edges.
- **Touch Targets:** All interactive elements (buttons, inputs, toggles) must have a minimum height of 48px to accommodate one-handed thumb use, which is critical for an on-the-go attendance app.
- **Stacking:** Elements are vertically stacked using a 16px (md) gap to maintain clear separation between different data points or form fields.

## Elevation & Depth
Hierarchy is established using **Tonal Layering** supplemented by soft, functional shadows. 

- **Surface Level 0:** The main background (`#F8FAFC`).
- **Surface Level 1 (Cards/Inputs):** Pure white background with a thin `1px` border in Slate-200 (`#E2E8F0`).
- **Shadows:** Use a single, very soft shadow for interactive cards: `0px 4px 12px rgba(30, 64, 175, 0.05)`. Note the subtle blue tint in the shadow to tie back to the primary brand color.
- **Active State:** When a user presses a button, the elevation should decrease (inset shadow or slight scale down) to provide tactile feedback.

## Shapes
The shape language is "Soft-Corporate." We use 8px (`rounded`) as the standard radius for buttons and input fields, creating a balance between the rigid professional world and modern user-friendly app design. 

Large containers and cards utilize 16px (`rounded-lg`) to create a distinct visual "enclosure" for groups of information like attendance history or profile details.

## Components
- **Primary Action Button:** Full-width (on mobile), 52px height, Primary Blue background, white text, 8px border-radius. This is used for the "Start Scan" or "Confirm" actions.
- **Attendance Cards:** A white card with a 1px Slate border. It features a left-hand color-coded accent bar (Green, Orange, or Red) to indicate the status of that specific record at a glance.
- **QR Scanner Viewframe:** A centered square with 12px rounded corners and a Primary Blue "active" border that pulses slightly to indicate the camera is seeking a code.
- **Status Chips:** Small, 24px height pills with 100px radius. Use low-opacity backgrounds (e.g., 10% Green) with high-contrast text (e.g., 100% Green) for readability.
- **Input Fields:** 48px height, Slate-100 background, 8px radius. The label sits above the field in `label-sm` semibold Slate-600.
- **Quick-Stats Grid:** A 2-column layout on the dashboard showing "Days Present" and "Hours Worked" using `headline-md` for the numbers.