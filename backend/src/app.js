const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const setupSecurityMiddleware = require('./middleware/security');
const authRoutes = require('./routes/auth');
const serviciosRoutes = require('./routes/servicios');
const pagosRoutes = require('./routes/pagos');
const transaccionesRoutes = require('./routes/transacciones');

const app = express();

// Configuración dinámica de CORS con lista blanca
const rawOrigins = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || ''
const whitelist = rawOrigins
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

// En desarrollo, permitir localhost por defecto
if (process.env.NODE_ENV !== 'production') {
  if (!whitelist.includes('http://localhost:5173')) whitelist.push('http://localhost:5173')
  if (!whitelist.includes('http://127.0.0.1:5173')) whitelist.push('http://127.0.0.1:5173')
}

app.use(cors({
  origin(origin, callback) {
    // Permitir requests sin origen (curl, healthchecks)
    if (!origin) return callback(null, true)
    if (whitelist.includes(origin)) return callback(null, true)
    return callback(new Error(`Not allowed by CORS: ${origin}`))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}))
app.use(express.json());
app.use(morgan('dev'));

// Aplicar middleware de seguridad
setupSecurityMiddleware(app);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'pricecalc-backend' });
});

// Ruta raíz para testeo
app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/transacciones', transaccionesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;


