#!/bin/bash
# ============================================
# 🔧 Server Setup Script — First Time Only
# ============================================
# Run this once on a fresh Ubuntu server
# Usage: bash setup-server.sh
# ============================================

set -e

echo "=========================================="
echo "🔧 Server Setup — Attendance System"
echo "=========================================="

# ─── Update System ────────────────────────────
echo ""
echo "📦 Updating system..."
sudo apt-get update
sudo apt-get upgrade -y

# ─── Install Docker ───────────────────────────
echo ""
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# ─── Install Docker Compose Plugin ────────────
echo ""
echo "📦 Installing Docker Compose plugin..."
if ! docker compose version &> /dev/null; then
    sudo apt-get install -y docker-compose-plugin
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose already installed"
fi

# ─── Install Git ──────────────────────────────
echo ""
echo "📋 Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt-get install -y git
    echo "✅ Git installed"
else
    echo "✅ Git already installed"
fi

# ─── Create Project Directory ─────────────────
echo ""
echo "📁 Setting up project directory..."
sudo mkdir -p /opt/attendance
sudo chown $USER:$USER /opt/attendance

# ─── Setup SSH Key ────────────────────────────
echo ""
echo "🔑 Setting up SSH key for GitHub..."
if [ ! -f ~/.ssh/id_ed25519 ]; then
    ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/id_ed25519 -N ""
    echo ""
    echo "📋 Copy this public key to GitHub (Settings → Deploy Keys):"
    echo "─────────────────────────────────────────────────────────"
    cat ~/.ssh/id_ed25519.pub
    echo "─────────────────────────────────────────────────────────"
else
    echo "✅ SSH key already exists"
fi

# ─── Configure Firewall ───────────────────────
echo ""
echo "🔥 Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp    # SSH
    sudo ufw allow 80/tcp    # HTTP
    sudo ufw allow 443/tcp   # HTTPS
    sudo ufw allow 3000/tcp  # Frontend
    sudo ufw allow 8080/tcp  # Backend
    sudo ufw --force enable
    echo "✅ Firewall configured"
else
    echo "⚠️  UFW not found. Please configure firewall manually."
fi

# ─── Done ─────────────────────────────────────
echo ""
echo "=========================================="
echo "✅ Server Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Next steps:"
echo "1. Add the SSH public key to GitHub"
echo "2. Clone the repository:"
echo "   cd /opt/attendance"
echo "   git clone git@github.com:cachualanglo/QR_code.git ."
echo "3. Run the deploy script:"
echo "   bash scripts/deploy-server.sh"
echo ""
