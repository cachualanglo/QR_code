# AI Project — Gated Software Factory V2

This template automates a Java/Spring Boot + React + PostgreSQL project with Claude Code/MiMo, MarkItDown MCP, Google Stitch MCP, Graphify, Playwright, Flyway, and Docker Compose.

## Why V2 is gated

A two-prompt, fully unattended pipeline is not reliable for requirements interpretation or visual implementation. V2 keeps one root prompt file but divides execution into controlled AUTO stages. Each stage stops at an evidence-based gate.

## Human actions

1. Place `Requirement.docx` in `requirements/source/`.
2. Run prompts from `AUTOMATION_PROMPTS.md` in order.
3. Approve requirement/screen gates when requested.
4. Copy generated Stitch prompts into Google Stitch and approve the visual design.
5. Add the exact Stitch project ID and screen mapping.
6. Continue the Phase 02 prompts until release readiness.

## Sources of truth

- Requirements: business behavior.
- OpenAPI: API request/response/error contract.
- Flyway: database schema evolution.
- Screen specifications: functional UI behavior.
- Approved Stitch: visual source of truth.
- Source code: implementation.
- Playwright/test reports: runtime evidence.
- Graphify: code navigation, dependency exploration, and impact analysis only.

Graphify is **not** allowed to claim requirement coverage unless explicit IDs are linked in project artifacts.

---

## Quick Start (Local Development)

### Prerequisites
- Java 17+ (JDK)
- Node.js 20+ & npm
- PostgreSQL 17
- Redis 7

### 1. Start infrastructure
```bash
docker compose up postgres redis -d
```

### 2. Backend
```bash
cd backend
mvn spring-boot:run
# → http://localhost:8080/api
```

### 3. Frontend
```bash
cd frontend
npm ci
npm run dev
# → http://localhost:5173
```

### 4. Default credentials
| Role | Username | Password |
|------|----------|----------|
| Admin | admin | *(đặt qua kênh nội bộ, xem TASK-03)* |
| Employee | nv001 | *(đặt qua kênh nội bộ)* |

---

## Docker Compose Deployment

### Build & Start all services
```bash
# Start DB + Frontend first (backend depends on healthy DB)
docker compose up --build postgres frontend -d

# Start backend after DB is healthy
docker compose up --build backend -d
```

### Full stack
```bash
docker compose up --build -d
```

### Service URLs
| Service | Internal | External |
|---------|----------|----------|
| Frontend (Nginx + TLS) | `https://frontend:443` | `https://52.237.113.201` |
| Backend API | `http://backend:8080` | via Nginx proxy |
| PostgreSQL | `postgres:5432` | `localhost:5432` |
| Redis | `redis:6379` | `localhost:6379` |

---

## HTTPS / TLS

TLS termination is handled at the **Nginx layer** (frontend container).

### Generate self-signed certificate (local dev)
```powershell
.\scripts\generate-selfsigned-cert.ps1
```
This produces:
- `frontend/selfsigned.crt` — certificate
- `frontend/selfsigned.key` — private key
- `frontend/selfsigned.pfx` — PKCS12 (for Spring Boot keystore)

### Nginx TLS settings
- Protocols: TLSv1.2, TLSv1.3
- HSTS enabled (1 year)
- Security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection

### Direct Spring Boot HTTPS (optional)
Set in `.env`:
```
SERVER_SSL_ENABLED=true
SERVER_SSL_KEYSTORE=classpath:keystore.p12
SERVER_SSL_KEYSTORE_PASSWORD=changeit
```
Copy `frontend/selfsigned.pfx` → `backend/src/main/resources/keystore.p12`.

---

## GPS & Geofence

### How it works
1. Employee scans QR code → frontend captures GPS via `navigator.geolocation`.
2. Frontend sends `{token, latitude, longitude, accuracy}` to `POST /api/attendance/scan`.
3. Backend calculates distance to company location using **Haversine formula**.
4. If distance > configured radius → rejects with `GEO_OUT_OF_RANGE` error.

### Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `COMPANY_LAT` | 10.7769 | Company latitude |
| `COMPANY_LNG` | 106.7009 | Company longitude |
| `COMPANY_RADIUS_METERS` | 80 | Max distance in meters |

Update via Admin Dashboard → Vị trí tab, or via API `PUT /api/admin/location`.

### Error codes
| Code | Meaning |
|------|---------|
| `GEO_OUT_OF_RANGE` | GPS distance exceeds geofence radius |
| `QR_EXPIRED` | QR token TTL expired (300s) |
| `QR_ALREADY_USED` | Token already consumed |
| `ALREADY_CHECKED_IN` | Duplicate check-in on same day |

---

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Login → JWT tokens |
| `POST` | `/api/auth/refresh` | Refresh access token |

### Employee (requires Bearer JWT)
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/attendance/scan` | Check-in / Check-out with GPS |
| `GET` | `/api/attendance/stats` | Day stats (query: from, to) |
| `GET` | `/api/attendance/detail` | Day detail (query: date) |
| `GET` | `/api/profile` | Current user profile |

### Admin (requires Bearer JWT + ADMIN role)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/employees` | List all employees |
| `GET` | `/api/admin/employees/:id/stats` | Employee stats |
| `GET` | `/api/admin/employees/:id/detail` | Employee day detail |
| `POST` | `/api/admin/qr/generate` | Generate QR (CHECK_IN / CHECK_OUT) |
| `GET` | `/api/admin/location` | Get company location |
| `PUT` | `/api/admin/location` | Update company location + radius |
| `GET/POST/PUT/DELETE` | `/api/admin/shifts/**` | Shift CRUD |

---

## Rate Limiting

In-memory sliding window rate limiter applied to all requests:
- **Default**: 100 requests per 60 seconds per client IP.
- Exceeds limit → HTTP `429 Too Many Requests` with JSON error body.
- Filter registered before JWT filter in Spring Security chain.

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend  │────▶│   Nginx TLS  │────▶│    Backend   │
│  React + TS │     │  (port 443)  │     │  Spring Boot │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                │
                                    ┌───────────┴───────────┐
                                    │                       │
                              ┌─────▼─────┐          ┌──────▼──────┐
                              │ PostgreSQL │          │    Redis    │
                              │  (5432)    │          │   (6379)    │
                              └───────────┘          └─────────────┘
```

---

## Testing

### Unit tests
```bash
cd backend
mvn test
```

### E2E tests (Playwright)
```bash
npm ci
npx playwright test
```

### Build without tests
```bash
cd backend && mvn -DskipTests package
cd frontend && npm ci && npm run build
```