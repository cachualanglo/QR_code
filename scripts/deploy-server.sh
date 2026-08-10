#!/bin/bash
# ============================================
# 🚀 Deploy Script — Run on Server
# ============================================
# Usage: bash deploy-server.sh
# ============================================

set -e

echo "=========================================="
echo "🚀 Attendance System — Deploy Script"
echo "=========================================="

# ─── Configuration ────────────────────────────
PROJECT_DIR="/opt/attendance"
REPO_URL="git@github.com:cachualanglo/QR_code.git"
BRANCH="main"

# ─── Check Docker ─────────────────────────────
echo ""
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. Please logout and login again."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose not found. Installing..."
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
fi

echo "✅ Docker: $(docker --version)"
echo "✅ Docker Compose: $(docker compose version)"

# ─── Clone or Pull ────────────────────────────
echo ""
echo "📥 Getting code..."

if [ -d "$PROJECT_DIR" ]; then
    echo "📁 Project exists. Pulling latest..."
    cd $PROJECT_DIR
    git pull origin $BRANCH
else
    echo "📥 Cloning repository..."
    sudo mkdir -p $PROJECT_DIR
    sudo chown $USER:$USER $PROJECT_DIR
    git clone -b $BRANCH $REPO_URL $PROJECT_DIR
    cd $PROJECT_DIR
fi

# ─── Setup Environment ────────────────────────
echo ""
echo "🔧 Setting up environment..."

if [ ! -f .env ]; then
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    
    # Generate random JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i "s/your_jwt_secret_min_32_chars_long/$JWT_SECRET/" .env
    
    # Generate random DB password
    DB_PASS=$(openssl rand -base64 16)
    sed -i "s/your_secure_password/$DB_PASS/" .env
    
    echo "✅ .env created with secure defaults"
    echo "⚠️  Please review and update .env if needed"
else
    echo "✅ .env already exists"
fi

# ─── Stop existing containers ─────────────────
echo ""
echo "🛑 Stopping existing containers..."
docker compose down 2>/dev/null || true

# ─── Build & Start ────────────────────────────
echo ""
echo "🏗️ Building and starting containers..."
docker compose build --no-cache
docker compose up -d

# ─── Wait for health ──────────────────────────
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 20

# ─── Check Status ─────────────────────────────
echo ""
echo "📊 Container Status:"
docker compose ps

# ─── Verify Services ──────────────────────────
echo ""
echo "🔍 Verifying services..."

# Check PostgreSQL
if docker compose exec -T postgres pg_isready -U attendance_user -d attendance_db > /dev/null 2>&1; then
    echo "✅ PostgreSQL: Healthy"
else
    echo "❌ PostgreSQL: Not ready"
fi

# Check Redis
if docker compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: Healthy"
else
    echo "❌ Redis: Not ready"
fi

# Check Backend
sleep 10
if curl -s http://localhost:8080/api/auth/login > /dev/null 2>&1; then
    echo "✅ Backend: Running"
else
    echo "❌ Backend: Not responding"
fi

# Check Frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend: Running"
else
    echo "❌ Frontend: Not responding"
fi

# ─── Done ─────────────────────────────────────
echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "🌐 Frontend:  http://$(hostname -I | awk '{print $1}'):3000"
echo "🔌 Backend:   http://$(hostname -I | awk '{print $1}'):8080/api"
echo "📊 Status:    docker compose ps"
echo "📋 Logs:      docker compose logs -f"
echo ""
