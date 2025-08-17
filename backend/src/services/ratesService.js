const Redis = require('redis');
const axios = require('axios');
const prisma = require('../config/prisma');

const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '600', 10);
const DOLARAPI_BASE = process.env.DOLARAPI_BASE || 'https://dolarapi.com/v1/dolares';

// Configuración de Redis
let redisClient = null;

async function initRedis() {
  if (!redisClient) {
    try {
      redisClient = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379/0'
      });
      
      redisClient.on('error', (err) => {
        console.error('Redis Error:', err);
      });
      
      await redisClient.connect();
      console.log('Redis connected successfully');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // Continuar sin Redis si no está disponible
      redisClient = null;
    }
  }
  return redisClient;
}

// Mapeo de método de pago a tipo de cotización
const METODO_TO_COTIZACION = {
  'tarjeta_pesificado': 'tarjeta',
  'tarjeta_dolares_cuenta': 'oficial',
  'mep': 'bolsa',
  'ccl': 'ccl',
  'blue': 'blue',
  'crypto': 'cripto',
  'mercado_pago': 'oficial',
  'efectivo': 'blue'
};

/**
 * Obtiene la cotización desde la API externa o cache
 */
async function getCotizacion(tipo) {
  const redis = await initRedis();
  const cacheKey = `cotizacion:${tipo}`;
  
  try {
    // Intentar obtener desde cache
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        const age = Date.now() - new Date(data.fetchedAt).getTime();
        
        // Si está dentro del TTL, devolverlo
        if (age < CACHE_TTL * 1000) {
          return { ...data, isStale: false };
        }
        
        // Si está stale pero disponible, guardarlo como fallback
        return { ...data, isStale: true };
      }
    }
    
    // Intentar obtener desde API principal (dolarapi.com)
    try {
      const response = await axios.get(`${DOLARAPI_BASE}/${tipo}`, {
        timeout: 5000
      });
      
      const cotizacionData = {
        tipo,
        compra: response.data.compra || null,
        venta: response.data.venta,
        source: 'dolarapi.com',
        fetchedAt: new Date(),
        isStale: false
      };
      
      // Guardar en cache
      if (redis) {
        await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(cotizacionData));
      }
      
      // Guardar en base de datos
      await prisma.rate.create({
        data: {
          tipo: cotizacionData.tipo,
          compra: cotizacionData.compra,
          venta: cotizacionData.venta,
          source: cotizacionData.source,
          fetchedAt: cotizacionData.fetchedAt
        }
      });
      
      return cotizacionData;
      
    } catch (apiError) {
      console.error(`Error fetching from dolarapi for ${tipo}:`, apiError.message);
      
      // Fallback: obtener último valor de la base de datos
      const lastRate = await prisma.rate.findFirst({
        where: { tipo },
        orderBy: { fetchedAt: 'desc' }
      });
      
      if (lastRate) {
        return {
          tipo: lastRate.tipo,
          compra: lastRate.compra,
          venta: lastRate.venta,
          source: lastRate.source,
          fetchedAt: lastRate.fetchedAt,
          isStale: true
        };
      }
      
      throw new Error(`No se pudo obtener cotización para ${tipo}`);
    }
    
  } catch (error) {
    console.error(`Error in getCotizacion for ${tipo}:`, error);
    throw error;
  }
}

/**
 * Obtiene la cotización basada en el método de pago
 */
async function getCotizacionPorMetodo(metodoPago) {
  const tipoCotizacion = METODO_TO_COTIZACION[metodoPago];
  
  if (!tipoCotizacion) {
    throw new Error(`Método de pago no válido: ${metodoPago}`);
  }
  
  return await getCotizacion(tipoCotizacion);
}

/**
 * Fuerza la actualización de todas las cotizaciones
 */
async function refreshAllRates() {
  const tipos = Object.values(METODO_TO_COTIZACION);
  const uniqueTipos = [...new Set(tipos)];
  
  const results = [];
  
  for (const tipo of uniqueTipos) {
    try {
      // Limpiar cache
      const redis = await initRedis();
      if (redis) {
        await redis.del(`cotizacion:${tipo}`);
      }
      
      const cotizacion = await getCotizacion(tipo);
      results.push({ tipo, status: 'success', data: cotizacion });
    } catch (error) {
      results.push({ tipo, status: 'error', error: error.message });
    }
  }
  
  return results;
}

module.exports = {
  getCotizacion,
  getCotizacionPorMetodo,
  refreshAllRates,
  initRedis,
  METODO_TO_COTIZACION
};
