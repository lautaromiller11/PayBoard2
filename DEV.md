# 🚀 Guía Rápida de Desarrollo - PriceCalc

## Configuración Inicial (Solo la primera vez)

### Opción 1: Script Automático (Recomendado)
```bash
# En Windows (PowerShell)
.\setup.ps1

# En Linux/Mac
chmod +x setup.sh
./setup.sh
```

### Opción 2: Manual
```bash
# 1. Instalar dependencias
npm run install:all

# 2. Configurar variables de entorno
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env

# 3. Configurar base de datos
cd backend
npm run prisma:generate
npm run prisma:migrate
cd ..
```

## 🏃‍♂️ Desarrollo Diario

### Windows (PowerShell)
```bash
# Opción 1: Script específico para Windows
.\dev.ps1

# Opción 2: Usando npm (si concurrently funciona)
npm run dev

# Opción 3: Servicios por separado (recomendado si hay problemas)
# Terminal 1:
cd backend; npm run dev

# Terminal 2:
cd frontend; npm run dev
```

### Linux/Mac
```bash
# Levantar ambos servicios
npm run dev

# Solo Backend (puerto 4000)
npm run dev:backend

# Solo Frontend (puerto 5173)
npm run dev:frontend
```

## 🔧 Herramientas de Desarrollo

### Base de Datos
```bash
# Abrir interfaz visual de la BD
cd backend && npm run prisma:studio

# Ver estado de migraciones
cd backend && npx prisma migrate status

# Resetear BD (¡CUIDADO! Borra todos los datos)
cd backend && npx prisma migrate reset
```

### Logs y Debugging
```bash
# Ver logs del backend
cd backend && npm run dev

# Ver logs del frontend
cd frontend && npm run dev
```

## 📁 Estructura de Archivos Importantes

```
PriceCalc/
├── backend/
│   ├── .env                    # Variables de entorno (crear desde env.example)
│   ├── prisma/schema.prisma    # Esquema de la base de datos
│   └── src/routes/            # Endpoints de la API
├── frontend/
│   ├── .env                   # Variables de entorno (crear desde env.example)
│   └── src/pages/            # Páginas de la aplicación
└── package.json              # Scripts principales
```

## 🌐 URLs de Desarrollo

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000/api
- **Prisma Studio**: http://localhost:5555 (cuando esté corriendo)

## 🔐 Autenticación

La app usa JWT. Para probar la API:

1. Registra un usuario: `POST /api/auth/register`
2. Inicia sesión: `POST /api/auth/login`
3. Usa el token en el header: `Authorization: Bearer <token>`

## 🐛 Troubleshooting

### Error: "concurrently no se reconoce como comando"
```bash
# Reinstalar dependencias
npm install

# O usar el script específico de Windows
.\dev.ps1
```

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
npm run install:all
```

### Error: "Database connection failed"
```bash
# Verificar que el archivo .env existe en backend/
# Verificar que la migración se ejecutó
cd backend && npm run prisma:migrate
```

### Error: "CORS error"
```bash
# Verificar que CORS_ORIGIN en backend/.env apunte a http://localhost:5173
```

### Puerto ocupado
```bash
# Cambiar puerto en el archivo .env correspondiente
# O matar el proceso que usa el puerto
```

### Problemas con PowerShell
```bash
# Usar el script específico de Windows
.\dev.ps1

# O ejecutar servicios por separado en diferentes terminales
```

## 📝 Comandos Útiles

```bash
# Ver todos los scripts disponibles
npm run

# Build de producción
npm run build

# Limpiar node_modules (si hay problemas)
rm -rf node_modules */node_modules && npm run install:all
```
