# Script de configuración para PriceCalc en Windows

Write-Host "🚀 Configurando PriceCalc..." -ForegroundColor Green

# Verificar que Node.js esté instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor instala Node.js 18+ primero." -ForegroundColor Red
    exit 1
}

# Instalar dependencias del proyecto principal
Write-Host "📦 Instalando dependencias del proyecto principal..." -ForegroundColor Yellow
npm install

# Instalar dependencias del backend
Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Yellow
Set-Location backend
npm install

# Configurar variables de entorno del backend
if (-not (Test-Path ".env")) {
    Write-Host "⚙️ Configurando variables de entorno del backend..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✅ Archivo .env creado en backend/" -ForegroundColor Green
} else {
    Write-Host "✅ Archivo .env ya existe en backend/" -ForegroundColor Green
}

# Generar cliente Prisma
Write-Host "🗄️ Generando cliente Prisma..." -ForegroundColor Yellow
npm run prisma:generate

# Ejecutar migraciones
Write-Host "🗄️ Ejecutando migraciones de la base de datos..." -ForegroundColor Yellow
npm run prisma:migrate

Set-Location ..

# Instalar dependencias del frontend
Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install

# Configurar variables de entorno del frontend
if (-not (Test-Path ".env")) {
    Write-Host "⚙️ Configurando variables de entorno del frontend..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✅ Archivo .env creado en frontend/" -ForegroundColor Green
} else {
    Write-Host "✅ Archivo .env ya existe en frontend/" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Revisa y ajusta los archivos .env si es necesario"
Write-Host "2. Ejecuta 'npm run dev' para levantar ambos servicios"
Write-Host "3. Abre http://localhost:5173 en tu navegador"
Write-Host ""
Write-Host "🔧 Comandos útiles:" -ForegroundColor Cyan
Write-Host "- npm run dev          # Levantar ambos servicios"
Write-Host "- npm run dev:backend  # Solo backend"
Write-Host "- npm run dev:frontend # Solo frontend"
Write-Host "- cd backend && npm run prisma:studio  # Abrir interfaz de BD"
