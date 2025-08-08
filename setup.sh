#!/bin/bash

echo "🚀 Configurando PriceCalc..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ primero."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Instalar dependencias del proyecto principal
echo "📦 Instalando dependencias del proyecto principal..."
npm install

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd backend
npm install

# Configurar variables de entorno del backend
if [ ! -f .env ]; then
    echo "⚙️ Configurando variables de entorno del backend..."
    cp env.example .env
    echo "✅ Archivo .env creado en backend/"
else
    echo "✅ Archivo .env ya existe en backend/"
fi

# Generar cliente Prisma
echo "🗄️ Generando cliente Prisma..."
npm run prisma:generate

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones de la base de datos..."
npm run prisma:migrate

cd ..

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install

# Configurar variables de entorno del frontend
if [ ! -f .env ]; then
    echo "⚙️ Configurando variables de entorno del frontend..."
    cp env.example .env
    echo "✅ Archivo .env creado en frontend/"
else
    echo "✅ Archivo .env ya existe en frontend/"
fi

cd ..

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Revisa y ajusta los archivos .env si es necesario"
echo "2. Ejecuta 'npm run dev' para levantar ambos servicios"
echo "3. Abre http://localhost:5173 en tu navegador"
echo ""
echo "🔧 Comandos útiles:"
echo "- npm run dev          # Levantar ambos servicios"
echo "- npm run dev:backend  # Solo backend"
echo "- npm run dev:frontend # Solo frontend"
echo "- cd backend && npm run prisma:studio  # Abrir interfaz de BD"
