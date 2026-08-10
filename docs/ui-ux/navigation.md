# Navigation Architecture — Chấm Công QR

**AUTO:** 01C
**App Shell:** Mobile-first SPA, single role (EMPLOYEE)

---

## App Shell Structure

```
┌─────────────────────────────────┐
│  Header                         │
│  ┌─────┬───────────────┬─────┐ │
│  │ Logo │  Chấm Công QR │ User│ │
│  └─────┴───────────────┴─────┘ │
├─────────────────────────────────┤
│                                 │
│         <Outlet />              │
│       (Page Content)            │
│                                 │
├─────────────────────────────────┤
│  Bottom Navigation              │
│  ┌──────┬──────────┬──────────┐ │
│  │ Home │ Thống kê │ Profil  │ │
│  │  📷  │   📊    │   👤    │ │
│  └──────┴──────────┴──────────┘ │
└─────────────────────────────────┘
```

## Routes

| Route | Screen ID | Component | Auth Required |
|---|---|---|---|
| `/login` | SCR-01 | LoginPage | No |
| `/` | SCR-02 | CheckinPage | Yes |
| `/stats` | SCR-03 | StatsPage | Yes |
| `/stats/day/:date` | SCR-04 | DayDetailPage | Yes |
| `/profile` | SCR-05 | ProfilePage | Yes |
| `/logout` | SCR-06 | LogoutPage | Yes |

## Navigation Flow

```
Unauthenticated → /login
                     │
                     ▼ (success)
Authenticated → / (CheckinPage)
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
      /stats    (QR Scan)    /profile
         │                      │
         ▼                      ▼
   /stats/day/:date        /logout → /login
```

## Bottom Navigation Rules

| Tab | Route | Icon | Active When |
|---|---|---|---|
| Chấm công | `/` | 📷 | Route = `/` |
| Thống kê | `/stats` | 📊 | Route starts with `/stats` |
| Cá nhân | `/profile` | 👤 | Route = `/profile` |

## Auth Guard

- Tất cả routes trừ `/login` yêu cầu JWT hợp lệ
- Token hết hạn → redirect `/login`
- FE tự gọi `auth.refresh` trước khi token hết hạn (30 min)
