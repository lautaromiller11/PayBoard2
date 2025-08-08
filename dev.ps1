# Script para levantar PriceCalc en desarrollo (Windows)

Write-Host "🚀 Levantando PriceCalc en modo desarrollo..." -ForegroundColor Green

# Verificar que los archivos .env existen
if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠️  Archivo backend\.env no encontrado. Copiando desde ejemplo..." -ForegroundColor Yellow
    Copy-Item "backend\env.example" "backend\.env"
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "⚠️  Archivo frontend\.env no encontrado. Copiando desde ejemplo..." -ForegroundColor Yellow
    Copy-Item "frontend\env.example" "frontend\.env"
}

# Verificar que la base de datos esté configurada
if (-not (Test-Path "backend\dev.db")) {
    Write-Host "⚠️  Base de datos no encontrada. Configurando..." -ForegroundColor Yellow
    Set-Location backend
    npm run prisma:generate
    npm run prisma:migrate
    Set-Location ..
}

Write-Host "✅ Configuración verificada" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Levantando servicios..." -ForegroundColor Cyan
Write-Host "- Backend: http://localhost:4000" -ForegroundColor White
Write-Host "- Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Presiona Ctrl+C para detener ambos servicios" -ForegroundColor Yellow
Write-Host ""

# Levantar ambos servicios usando concurrently
try {
    npx concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
} catch {
    Write-Host "❌ Error al levantar los servicios" -ForegroundColor Red
    Write-Host "Intenta ejecutar los servicios por separado:" -ForegroundColor Yellow
    Write-Host "  Terminal 1: cd backend && npm run dev" -ForegroundColor White
    Write-Host "  Terminal 2: cd frontend && npm run dev" -ForegroundColor White
}
