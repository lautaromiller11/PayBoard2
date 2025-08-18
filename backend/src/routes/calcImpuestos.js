const express = require('express');
const router = express.Router();
const { calcularImpuestos, logCalculation, PROVINCIAS_VALIDAS, METODOS_PAGO_VALIDOS } = require('../services/taxCalculatorService');
const { refreshAllRates } = require('../services/ratesService');

// Rate limiting básico (en memoria)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests por minuto

function rateLimit(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Limpiar entradas viejas
  for (const [ip, requests] of rateLimitStore) {
    const filteredRequests = requests.filter(time => time > windowStart);
    if (filteredRequests.length === 0) {
      rateLimitStore.delete(ip);
    } else {
      rateLimitStore.set(ip, filteredRequests);
    }
  }
  
  // Verificar límite para la IP actual
  const requests = rateLimitStore.get(clientIP) || [];
  const recentRequests = requests.filter(time => time > windowStart);
  
  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests',
      message: `Límite de ${RATE_LIMIT_MAX_REQUESTS} requests por minuto excedido`
    });
  }
  
  // Agregar la request actual
  recentRequests.push(now);
  rateLimitStore.set(clientIP, recentRequests);
  
  next();
}

/**
 * GET /api/calc-impuestos
 * Endpoint principal para calcular impuestos
 */
router.get('/', rateLimit, async (req, res) => {
  try {
    const {
      precio,
      moneda = 'USD',
      provincia,
      metodo_pago,
      categoria_producto = 'otro'
    } = req.query;
    
    // Validaciones básicas
    if (!precio) {
      return res.status(400).json({
        error: 'Parámetro requerido',
        message: 'El parámetro "precio" es obligatorio'
      });
    }
    
    if (!provincia) {
      return res.status(400).json({
        error: 'Parámetro requerido',
        message: 'El parámetro "provincia" es obligatorio'
      });
    }
    
    if (!metodo_pago) {
      return res.status(400).json({
        error: 'Parámetro requerido',
        message: 'El parámetro "metodo_pago" es obligatorio'
      });
    }
    
    const precioNumerico = parseFloat(precio);
    if (isNaN(precioNumerico) || precioNumerico <= 0) {
      return res.status(400).json({
        error: 'Precio inválido',
        message: 'El precio debe ser un número mayor a 0'
      });
    }
    
    // Calcular impuestos
    const resultado = await calcularImpuestos(
      precioNumerico,
      moneda.toUpperCase(),
      provincia,
      metodo_pago,
      categoria_producto
    );
    
    // Log del cálculo (opcional, no fallar si hay error)
    try {
      const userId = req.user?.id || null; // Usuario autenticado si existe
      await logCalculation(userId, resultado.input, resultado, resultado.cotizacion);
    } catch (logError) {
      console.warn('Error logging calculation:', logError.message);
    }
    
    res.json(resultado);
    
  } catch (error) {
    console.error('Error in calc-impuestos endpoint:', error);
    
    if (error.message.includes('Errores de validación')) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: error.message
      });
    }
    
    if (error.message.includes('No se pudo obtener cotización')) {
      return res.status(503).json({
        error: 'Servicio no disponible',
        message: 'No se pudo obtener la cotización del dólar. Intente nuevamente en unos minutos.'
      });
    }
    
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Ocurrió un error al calcular los impuestos'
    });
  }
});

/**
 * GET /api/calc-impuestos/provincias
 * Lista de provincias válidas
 */
router.get('/provincias', (req, res) => {
  res.json({
    provincias: PROVINCIAS_VALIDAS.sort()
  });
});

/**
 * GET /api/calc-impuestos/metodos-pago
 * Lista de métodos de pago válidos
 */
router.get('/metodos-pago', (req, res) => {
  res.json({
    metodos: METODOS_PAGO_VALIDOS.map(metodo => ({
      value: metodo,
      label: formatMetodoPagoLabel(metodo)
    }))
  });
});

/**
 * POST /api/calc-impuestos/refresh-rates
 * Fuerza la actualización de cotizaciones (requiere autenticación)
 */
router.post('/refresh-rates', async (req, res) => {
  try {
    const results = await refreshAllRates();
    res.json({
      message: 'Cotizaciones actualizadas',
      results
    });
  } catch (error) {
    console.error('Error refreshing rates:', error);
    res.status(500).json({
      error: 'Error actualizando cotizaciones',
      message: error.message
    });
  }
});

/**
 * GET /api/calc-impuestos/health
 * Health check del servicio
 */
router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      redis: 'unknown',
      dolarapi: 'unknown'
    }
  };
  
  // Test database
  try {
    await require('../config/prisma').taxRule.count();
    health.services.database = 'ok';
  } catch (error) {
    health.services.database = 'error';
    health.status = 'degraded';
  }
  
  // Test Redis
  try {
    const { initRedis } = require('../services/ratesService');
    const redis = await initRedis();
    if (redis) {
      await redis.ping();
      health.services.redis = 'ok';
    } else {
      health.services.redis = 'disabled';
    }
  } catch (error) {
    health.services.redis = 'error';
  }
  
  // Test DolarAPI
  try {
    const axios = require('axios');
    const response = await axios.get('https://dolarapi.com/v1/dolares/oficial', { timeout: 3000 });
    health.services.dolarapi = response.status === 200 ? 'ok' : 'error';
  } catch (error) {
    health.services.dolarapi = 'error';
  }
  
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Helper function para formatear labels de métodos de pago
function formatMetodoPagoLabel(metodo) {
  const labels = {
    'tarjeta_pesificado': 'Tarjeta (Pesificado)',
    'tarjeta_usd_cuenta': 'Tarjeta (USD en cuenta)',
    'mercado_pago': 'Mercado Pago',
    'cryptomonedas': 'Cryptomonedas'
  };
  
  return labels[metodo] || metodo;
}

module.exports = router;
