# Stitch Prompt INDEX — Chấm Công QR

**AUTO:** 01D
**Gate:** STITCH_PROMPT_GATE
**Total Screens:** 9
**Total Prompts:** 9

---

## Mapping: Screen ID → Prompt File → Module → Route

| Screen ID | Prompt File | Module | Route | operationId |
|---|---|---|---|---|
| SCR-01 | `SCR-01-login.md` | MOD-01 | `/login` | auth.login |
| SCR-02 | `SCR-02-checkin.md` | MOD-01 | `/` | checkin.submit |
| SCR-03 | `SCR-03-stats.md` | MOD-01 | `/stats` | stats.list |
| SCR-04 | `SCR-04-day-detail.md` | MOD-01 | `/stats/day/:date` | stats.dayDetail |
| SCR-05 | `SCR-05-profile.md` | MOD-01 | `/profile` | — |
| SCR-06 | `SCR-06-logout.md` | MOD-01 | `/logout` | auth.logout |
| SCR-07 | `SCR-07-admin-dashboard.md` | MOD-02 | `/admin` | admin.dashboard |
| SCR-08 | `SCR-08-employee-list.md` | MOD-02 | `/admin/employees` | admin.employees |
| SCR-09 | `SCR-09-employee-detail.md` | MOD-02 | `/admin/employees/:id` | admin.employeeAttendance |

---

## Gate Checklist

- [x] 100% screens have prompt (9/9)
- [x] No duplicate prompts
- [x] No missing fields/actions/states
- [x] Every prompt starts with GLOBAL DESIGN LOCK
- [x] No prompt redefines sidebar, branding, or app shell independently
- [x] Prompt count = screen count

---

## Prompt Inventory

| # | Screen | Prompt Size | Key Components |
|---|---|---|---|
| 1 | SCR-01 Login | ~200 lines | Form, validation, error states |
| 2 | SCR-02 Checkin | ~250 lines | QR scanner, GPS, status feedback |
| 3 | SCR-03 Stats | ~220 lines | Calendar, week/month toggle, legend |
| 4 | SCR-04 Day Detail | ~180 lines | Time cards, coordinates, status |
| 5 | SCR-05 Profile | ~150 lines | Avatar, info list, logout button |
| 6 | SCR-06 Logout | ~120 lines | Confirmation dialog, actions |
| 7 | SCR-07 Admin Dashboard | ~180 lines | Stats cards, quick actions, recent check-ins |
| 8 | SCR-08 Employee List | ~200 lines | Search, filter tabs, employee rows |
| 9 | SCR-09 Employee Detail | ~220 lines | Profile card, calendar, attendance timeline |

---

**STITCH_PROMPT_GATE = PASS** ✅
