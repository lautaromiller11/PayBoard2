const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const serviciosRoutes = require('./routes/servicios');
const pagosRoutes = require('./routes/pagos');
const transaccionesRoutes = require('./routes/transacciones');

const app = express();

// Configuración dinámica de CORS
const allowedOrigin = process.env.NODE_ENV === 'production'
  ? process.env.CORS_ORIGIN || 'https://pay-board-7ph9.vercel.app'
  : process.env.CORS_ORIGIN || 'https://pay-board-7ph9.vercel.app';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());
app.use(morgan('dev'));

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


