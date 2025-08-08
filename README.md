# PayBoard - Gestión de Servicios y Pagos

Una aplicación web moderna para gestionar servicios recurrentes y sus pagos, construida con React + TypeScript en el frontend y Express + Prisma en el backend.

## 🚀 Características

- **Autenticación JWT**: Sistema de registro y login seguro
- **Gestión de Servicios**: Tablero Kanban para organizar servicios por estado (Por Pagar, Pagado, Vencido)
- **Drag & Drop**: Mover servicios entre columnas arrastrando y soltando
- **Seguimiento de Pagos**: Registrar pagos y cambiar estados de servicios
- **Finanzas Personales**: Página dedicada para el control de ingresos y gastos personales
- **Navegación Intuitiva**: Menú de navegación entre Servicios y Finanzas Personales
- **UI Moderna**: Interfaz construida con React, TypeScript y Tailwind CSS
- **Responsive**: Diseño adaptable a diferentes tamaños de pantalla

## 🛠️ Tecnologías

### Frontend
- React 18 + TypeScript
- Vite (bundler)
- Tailwind CSS (estilos)
- React Router (navegación)
- Axios (cliente HTTP)
- React Beautiful DnD (drag & drop)
- Recharts (gráficos)

### Backend
- Node.js + Express
- Prisma ORM + SQLite
- JWT (autenticación)
- bcryptjs (hash de contraseñas)
- CORS (cross-origin)

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o yarn

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd PriceCalc
```

### 2. Instalar dependencias
```bash
npm run install:all
```

### 3. Configurar variables de entorno

#### Backend
Copia el archivo de ejemplo y configúralo:
```bash
cd backend
cp env.example .env
```

Edita `.env` con tus valores:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu-super-secreto-jwt-aqui-cambialo-en-produccion"
PORT=4000
CORS_ORIGIN="http://localhost:5173"
```

#### Frontend
Copia el archivo de ejemplo y configúralo:
```bash
cd frontend
cp env.example .env
```

Edita `.env` con tus valores:
```env
VITE_API_URL=http://localhost:4000/api
```

### 4. Configurar la base de datos
```bash
npm run setup
```

Este comando:
- Instala todas las dependencias
- Genera el cliente de Prisma
- Ejecuta las migraciones de la base de datos

## 🏃‍♂️ Desarrollo

### Levantar ambos servicios (recomendado)
```bash
npm run dev
```

Esto levanta:
- Backend en http://localhost:4000
- Frontend en http://localhost:5173

### Levantar servicios por separado

#### Solo Backend
```bash
npm run dev:backend
```

#### Solo Frontend
```bash
npm run dev:frontend
```

## 📁 Estructura del Proyecto

```
PriceCalc/
├── backend/                 # Servidor Express
│   ├── prisma/             # Esquema y migraciones de BD
│   ├── src/
│   │   ├── config/         # Configuración de Prisma
│   │   ├── middleware/     # Middleware de autenticación
│   │   ├── routes/         # Rutas de la API
│   │   ├── app.js          # Configuración de Express
│   │   └── index.js        # Punto de entrada
│   └── package.json
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── context/        # Contexto de autenticación
│   │   ├── lib/           # Utilidades y API
│   │   ├── pages/         # Páginas de la aplicación
│   │   └── styles/        # Estilos CSS
│   └── package.json
└── package.json           # Scripts principales
```

## 🔧 Comandos Útiles

### Base de Datos
```bash
# Generar cliente Prisma
cd backend && npm run prisma:generate

# Ejecutar migraciones
cd backend && npm run prisma:migrate

# Abrir Prisma Studio (interfaz visual de BD)
cd backend && npm run prisma:studio
```

### Desarrollo
```bash
# Instalar dependencias de todos los proyectos
npm run install:all

# Configurar todo (instalar + BD)
npm run setup

# Levantar en desarrollo
npm run dev

# Build de producción
npm run build
```

## 🌐 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Servicios
- `GET /api/servicios` - Listar servicios del usuario
- `POST /api/servicios` - Crear servicio
- `PUT /api/servicios/:id` - Actualizar servicio
- `DELETE /api/servicios/:id` - Eliminar servicio
- `PATCH /api/servicios/:id/estado` - Cambiar estado

### Pagos
- `GET /api/pagos` - Listar pagos
- `POST /api/pagos` - Registrar pago

## 🔐 Autenticación

La aplicación usa JWT para autenticación. Los tokens se envían en el header `Authorization: Bearer <token>`.

## 📊 Base de Datos

El esquema incluye:
- **Users**: Usuarios del sistema
- **Servicios**: Servicios con periodicidad y estado
- **Pagos**: Registro de pagos realizados

## 🚀 Despliegue

### Backend
1. Configurar variables de entorno de producción
2. Cambiar DATABASE_URL a una base de datos de producción
3. Ejecutar migraciones
4. Build y deploy

### Frontend
1. Configurar VITE_API_URL para producción
2. Ejecutar `npm run build`
3. Desplegar los archivos generados en `dist/`

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
