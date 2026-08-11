# ============================================
# generate-selfsigned-cert.ps1
# Generate self-signed certificate for local development
# Usage: .\scripts\generate-selfsigned-cert.ps1
# Output: frontend/selfsigned.crt + frontend/selfsigned.key
# ============================================

param(
    [string]$Domain = "localhost",
    [int]$Days = 365,
    [string]$OutputDir = "frontend"
)

$ErrorActionPreference = "Stop"

$CertPath = Join-Path $OutputDir "selfsigned.crt"
$KeyPath = Join-Path $OutputDir "selfsigned.key"
$PfxPath = Join-Path $OutputDir "selfsigned.pfx"

Write-Host "🔐 Generating self-signed certificate for: $Domain" -ForegroundColor Cyan
Write-Host "   Valid for $Days days" -ForegroundColor Gray

# Generate private key (PEM)
$KeyFile = [System.IO.Path]::GetTempFileName()
openssl genrsa -out $KeyFile 2048 2>$null
if ($LASTEXITCODE -ne 0) { throw "openssl genrsa failed" }

# Generate self-signed certificate (PEM)
$CrtFile = [System.IO.Path]::GetTempFileName()
openssl req -new -x509 -key $KeyFile -out $CrtFile -days $Days -subj "/CN=$Domain/O=Attendance Dev/C=VN" -addext "subjectAltName=DNS:$Domain,IP:127.0.0.1" 2>$null
if ($LASTEXITCODE -ne 0) { throw "openssl req failed" }

# Copy to output directory
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
Copy-Item $CrtFile $CertPath -Force
Copy-Item $KeyFile $KeyPath -Force

# Also generate PFX (for Spring Boot keystore.p12 conversion)
openssl pkcs12 -export -out $PfxPath -inkey $KeyFile -in $CrtFile -password pass:changeit 2>$null
if ($LASTEXITCODE -ne 0) { throw "openssl pkcs12 failed" }

# Cleanup temp files
Remove-Item $KeyFile -Force -ErrorAction SilentlyContinue
Remove-Item $CrtFile -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ Certificate generated successfully!" -ForegroundColor Green
Write-Host "   CRT: $CertPath"
Write-Host "   KEY: $KeyPath"
Write-Host "   PFX: $PfxPath (password: changeit)"
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Copy $PfxPath to backend/src/main/resources/keystore.p12"
Write-Host "   2. Set SERVER_SSL_ENABLED=true in .env for direct SSL"
Write-Host "   3. Or use Nginx TLS termination via Docker Compose"
Write-Host ""
