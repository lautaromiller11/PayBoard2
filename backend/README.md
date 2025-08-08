# PriceCalc Backend

Servidor Express con Prisma ORM para la gestión de servicios y pagos.

## 🚀 Inicio Rápido

### Instalación
```bash
npm install
```

### Configuración
```bash
# Copiar variables de entorno
cp env.example .env

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate
```

### Desarrollo
```bash
npm run dev
```

## 📊 Base de Datos

### Esquema
- **User**: Usuarios del sistema
- **Servicio**: Servicios con periodicidad y estado
- **Pago**: Registro de pagos realizados

### Comandos Prisma
```bash
# Generar cliente
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Abrir Prisma Studio
npm run prisma:studio

# Resetear base de datos
npx prisma migrate reset
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

La API usa JWT para autenticación. Incluye el token en el header:
```
Authorization: Bearer <token>
```

## 📝 Variables de Entorno

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu-super-secreto-jwt"
PORT=4000
CORS_ORIGIN="http://localhost:5173"
```

## 🛠️ Scripts Disponibles

- `npm run dev` - Servidor de desarrollo con nodemon
- `npm start` - Servidor de producción
- `npm run prisma:generate` - Generar cliente Prisma
- `npm run prisma:migrate` - Ejecutar migraciones
- `npm run prisma:studio` - Abrir interfaz de BD


