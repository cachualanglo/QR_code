# 🚀 Hướng dẫn Deploy — Attendance QR System

## 📋 Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│                    Azure VM (Ubuntu 24.04)               │
│                    IP: 52.237.113.201                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │  Frontend   │  │   Backend   │  │   Database    │  │
│  │  (Nginx)    │  │ (Spring Boot)│  │  (PostgreSQL) │  │
│  │  Port: 3000 │  │  Port: 8080 │  │  Port: 5432   │  │
│  └─────────────┘  └─────────────┘  └───────────────┘  │
│                                                         │
│  ┌─────────────┐                                       │
│  │    Redis    │                                       │
│  │  Port: 6379 │                                       │
│  └─────────────┘                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Quy trình CI/CD

```
Developer Push → GitHub → GitHub Actions (Build + Test) → SSH Deploy → Server
```

### Flow chi tiết:

1. **Developer** push code lên `main` branch
2. **GitHub Actions** tự động:
   - Build Backend (Maven + JDK 17)
   - Build Frontend (Node.js + Vite)
   - Chạy tests
3. **Deploy Job** SSH vào server:
   - `git pull` code mới nhất
   - `docker compose build --no-cache`
   - `docker compose up -d`
4. **Verify** deployment thành công

---

## 🔧 Setup lần đầu (Server)

### Bước 1: Chuẩn bị Server

```bash
# SSH vào server
ssh azureuser@52.237.113.201

# Chạy script setup
bash <(curl -s raw.githubusercontent.com/cachualanglo/QR_code/main/scripts/setup-server.sh)
```

Script sẽ tự động:
- Cài Docker & Docker Compose
- Cài Git
- Tạo thư mục `/opt/attendance`
- Tạo SSH key
- Config firewall

### Bước 2: Thêm SSH Key vào GitHub

```bash
# Xem public key
cat ~/.ssh/id_ed25519.pub

# Copy key và thêm vào GitHub:
# Repository → Settings → Deploy Keys → Add deploy key
# ✅ Allow write access
```

### Bước 3: Clone Repository

```bash
cd /opt/attendance
git clone git@github.com:cachualanglo/QR_code.git .
```

### Bước 4: Deploy

```bash
bash scripts/deploy-server.sh
```

---

## 🚀 Deploy thường lệ (CI/CD)

### Trigger tự động

Khi push code lên `main` branch:

```bash
git add .
git commit -m "[ATTEND] Update feature XYZ"
git push origin main
```

GitHub Actions sẽ tự động build và deploy.

### Deploy thủ công (nếu cần)

```bash
# SSH vào server
ssh azureuser@52.237.113.201

# Vào project
cd /opt/attendance

# Pull code mới nhất
git pull origin main

# Rebuild & restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Kiểm tra
docker compose ps
docker compose logs -f
```

---

## 🐳 Docker Commands

```bash
# Xem status tất cả containers
docker compose ps

# Xem logs
docker compose logs -f              # Tất cả
docker compose logs -f backend      # Chỉ backend
docker compose logs -f frontend     # Chỉ frontend

# Restart service cụ thể
docker compose restart backend

# Stop tất cả
docker compose down

# Rebuild từ đầu
docker compose build --no-cache
docker compose up -d

# Vào container debug
docker compose exec backend bash
docker compose exec postgres psql -U attendance_user -d attendance_db
```

---

## 🌐 Access Points

| Service | URL | Mô tả |
|---------|-----|-------|
| Frontend | `http://52.237.113.201:3000` | Ứng dụng chính |
| Backend API | `http://52.237.113.201:8080/api` | REST API |
| Kiosk | `http://52.237.113.201:3000/kiosk/attendance` | Màn hình QR Kiosk |

### Tài khoản mặc định

| Username | Password | Role |
|----------|----------|------|
| admin | *(đặt qua kênh nội bộ, xem TASK-03)* | Admin |

---

## ⚙️ Configuration

### Environment Variables (`.env`)

```bash
# Database
POSTGRES_DB=attendance_db
POSTGRES_USER=attendance_user
POSTGRES_PASSWORD=<thay_mat_khau>

# JWT (QUAN TRỌNG: thay trong production!)
JWT_SECRET=<jwt_secret_32_ky_tu>

# Company GPS
COMPANY_LAT=10.7769
COMPANY_LNG=106.7009
COMPANY_RADIUS_METERS=80
```

### Thay đổi cấu hình

```bash
# Sửa .env
nano .env

# Restart services
docker compose down
docker compose up -d
```

---

## 🔥 Troubleshooting

### Backend không khởi động được

```bash
# Xem logs
docker compose logs backend

# Kiểm tra database
docker compose exec postgres pg_isready -U attendance_user

# Restart backend
docker compose restart backend
```

### Frontend không load được

```bash
# Xem logs nginx
docker compose logs frontend

# Kiểm tra backend có chạy không
curl http://localhost:8080/api/auth/login
```

### Port conflict

```bash
# Kiểm tra port đang dùng
sudo lsof -i :3000
sudo lsof -i :8080

# Kill process
sudo kill -9 <PID>
```

### Database migration

```bash
# Flyway tự chạy khi backend khởi động
# Nếu cần reset database:
docker compose down -v  # Xóa volumes
docker compose up -d    # Tạo lại từ đầu
```

---

## 📊 Monitoring

```bash
# Xem resource usage
docker stats

# Xem logs real-time
docker compose logs -f --tail=100

# Check health
curl -s http://localhost:3000 | head -5
curl -s http://localhost:8080/api/auth/login
```

---

## 🔐 Security Notes

1. **JWT Secret**: Thay `JWT_SECRET` trong `.env` bằng giá trị ngẫu nhiên mạnh
2. **Database Password**: Thay `POSTGRES_PASSWORD` trong production
3. **Firewall**: Chỉ mở các port cần thiết (22, 3000, 8080)
4. **HTTPS**: Cấu hình SSL/TLS với Let's Encrypt cho production
