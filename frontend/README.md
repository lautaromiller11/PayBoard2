# PriceCalc Frontend

Aplicación React con TypeScript para la gestión de servicios y pagos.

## 🚀 Inicio Rápido

### Instalación
```bash
npm install
```

### Configuración
```bash
# Copiar variables de entorno
cp env.example .env
```

### Desarrollo
```bash
npm run dev
```

## 🛠️ Tecnologías

- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Bundler y servidor de desarrollo
- **Tailwind CSS** - Framework de estilos
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **React Beautiful DnD** - Drag & drop
- **Recharts** - Gráficos

## 📁 Estructura

```
src/
├── components/     # Componentes reutilizables
├── context/       # Contexto de autenticación
├── lib/          # Utilidades y configuración de API
├── pages/        # Páginas de la aplicación
├── styles/       # Estilos globales
└── ui/           # Componentes de UI
```

## 🌐 Páginas

- **Login** - Autenticación de usuarios
- **Register** - Registro de nuevos usuarios
- **Dashboard** - Panel principal con servicios y estadísticas

## 🔐 Autenticación

La aplicación maneja la autenticación JWT automáticamente:
- Los tokens se almacenan en localStorage
- Se incluyen automáticamente en las peticiones HTTP
- Redirección automática a login si no hay token válido

## 📝 Variables de Entorno

```env
VITE_API_URL=http://localhost:4000/api
```

## 🛠️ Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build

## 🎨 Estilos

La aplicación usa Tailwind CSS para los estilos. Los archivos principales son:
- `src/styles/index.css` - Estilos globales
- `tailwind.config.js` - Configuración de Tailwind

## 📊 Componentes Principales

- **AuthContext** - Manejo de estado de autenticación
- **FinancePanel** - Panel de estadísticas financieras
- **ServiceForm** - Formulario para crear/editar servicios
