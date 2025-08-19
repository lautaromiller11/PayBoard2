const prisma = require('../config/prisma');
const { getCotizacionPorMetodo } = require('./ratesService');

// Provincias válidas
const PROVINCIAS_VALIDAS = [
  'CABA', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Corrientes', 
  'Córdoba', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'San Juan', 'San Luis', 
  'Salta', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 
  'Tucumán'
];

// Métodos de pago válidos
const METODOS_PAGO_VALIDOS = [
  'tarjeta_pesificado', 'tarjeta_usd_cuenta', 'mercado_pago', 'cryptomonedas'
];

/**
 * Obtiene las reglas de impuestos desde la base de datos
 */
async function getTaxRules() {
  try {
    const rules = await prisma.taxRule.findMany({
      where: { active: true }
    });
    
    const rulesMap = {
      IVA: {},
      PAIS: {},
      PERCEPCION_GAN: {},
      IIBB: {}
    };
    
    rules.forEach(rule => {
      if (rule.scope === 'global') {
        rulesMap[rule.tipoEnum].global = rule.valuePct;
      } else if (rule.scope === 'provincia' && rule.provinceCode) {
        if (!rulesMap[rule.tipoEnum].provincias) {
          rulesMap[rule.tipoEnum].provincias = {};
        }
        rulesMap[rule.tipoEnum].provincias[rule.provinceCode] = rule.valuePct;
      }
    });
    
    return rulesMap;
  } catch (error) {
    console.error('Error getting tax rules:', error);
    // Fallback a valores por defecto
    return getDefaultTaxRules();
  }
}

/**
 * Reglas por defecto si no hay en la base de datos
 */
function getDefaultTaxRules() {
  return {
    IVA: {
      global: 21.0,
      provincias: {
        'Tierra del Fuego': 0.0
      }
    },
    PERCEPCION_GAN: {
      global: 30.0
    },
    IIBB: {
      provincias: {
        'CABA': 3.5,
        'Buenos Aires': 4.0,
        'Córdoba': 3.0,
        'Mendoza': 3.5,
        'Tierra del Fuego': 0.0,
        'Santa Fe': 4.0
      }
    }
  };
}

/**
 * Valida los parámetros de entrada
 */
function validateInput(precio, moneda, provincia, metodoPago) {
  const errors = [];
  
  if (!precio || precio <= 0) {
    errors.push('El precio debe ser mayor a 0');
  }
  
  if (!['USD', 'ARS'].includes(moneda)) {
    errors.push('La moneda debe ser USD o ARS');
  }
  
  if (!PROVINCIAS_VALIDAS.includes(provincia)) {
    errors.push(`Provincia no válida. Opciones: ${PROVINCIAS_VALIDAS.join(', ')}`);
  }
  
  if (!METODOS_PAGO_VALIDOS.includes(metodoPago)) {
    errors.push(`Método de pago no válido. Opciones: ${METODOS_PAGO_VALIDOS.join(', ')}`);
  }
  
  return errors;
}

/**
 * Convierte USD a ARS si es necesario
 */
async function convertirAARS(precio, moneda, metodoPago) {
  if (moneda === 'ARS') {
    return { precioARS: precio, cotizacion: null };
  }
  
  const cotizacion = await getCotizacionPorMetodo(metodoPago);
  const precioARS = precio * cotizacion.venta;
  
  return { precioARS, cotizacion };
}

/**
 * Calcula el IVA aplicable
 */
function calcularIVA(precioBase, provincia, taxRules) {
  let ivaRate = taxRules.IVA.global || 21.0;
  
  // Excepción para Tierra del Fuego
  if (provincia === 'Tierra del Fuego') {
    ivaRate = 0.0;
  }
  
  return {
    rate: ivaRate,
    amount: (precioBase * ivaRate) / 100
  };
}

/**
 * Calcula las percepciones a cuenta de Ganancias/Bienes Personales
 */
function calcularPercepcionGanancias(precioBase, moneda, metodoPago, taxRules) {
  // No se aplica a compras en ARS
  if (moneda === 'ARS') {
    return { rate: 0, amount: 0, applied: false, reason: 'No aplica para compras en ARS' };
  }
  
  // Excepción para ciertos métodos de pago
  if (["mercado_pago", "tarjeta_dolares_cuenta", "tarjeta_usd_cuenta"].includes(metodoPago)) {
    return { 
      rate: 0, 
      amount: 0, 
      applied: false, 
      reason: `No aplica para método de pago: ${metodoPago}` 
    };
  }
  
  const percepcionRate = taxRules.PERCEPCION_GAN.global || 30.0;
  return {
    rate: percepcionRate,
    amount: (precioBase * percepcionRate) / 100,
    applied: true
  };
}

/**
 * Calcula IIBB por provincia
 */
function calcularIIBB(precioBase, provincia, taxRules) {
  const iibbRates = taxRules.IIBB.provincias || {};
  const iibbRate = iibbRates[provincia] || 0;
  
  return {
    rate: iibbRate,
    amount: (precioBase * iibbRate) / 100
  };
}

/**
 * Función principal para calcular impuestos
 */
async function calcularImpuestos(precio, moneda, provincia, metodoPago, categoriaProducto = 'otro') {
  try {
    // Validar entrada
    const validationErrors = validateInput(precio, moneda, provincia, metodoPago);
    if (validationErrors.length > 0) {
      throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
    }
    
    // Obtener reglas de impuestos
    const taxRules = await getTaxRules();
    
    // Convertir a ARS si es necesario
    const { precioARS, cotizacion } = await convertirAARS(precio, moneda, metodoPago);

    // Si es cryptomonedas, no aplica ningún impuesto
    if (metodoPago === 'cryptomonedas') {
      return {
        input: {
          precio: parseFloat(precio),
          moneda,
          provincia,
          metodo_pago: metodoPago,
          categoria_producto: categoriaProducto
        },
        cotizacion: cotizacion ? {
          tipo: cotizacion.tipo,
          valor: parseFloat(cotizacion.venta),
          source: cotizacion.source,
          fetched_at: cotizacion.fetchedAt,
          is_stale: cotizacion.isStale
        } : null,
        desglose: {
          precio_base_ars: Math.round(precioARS * 100) / 100,
          iva: 0,
          percepcion_ganancias: 0,
          iibb: 0,
          total: Math.round(precioARS * 100) / 100
        },
        meta: {
          rules_used: [],
          warnings: ['No se aplican impuestos para pagos con criptomonedas.']
        }
      };
    }

    // Calcular cada impuesto
    const iva = calcularIVA(precioARS, provincia, taxRules);
    const percepcionGanancias = calcularPercepcionGanancias(precioARS, moneda, metodoPago, taxRules);
    const iibb = calcularIIBB(precioARS, provincia, taxRules);
    
    // Calcular total
    const total = precioARS + iva.amount + percepcionGanancias.amount + iibb.amount;
    
    // Preparar reglas usadas y warnings
    const rulesUsed = [];
    const warnings = [];
    
    if (iva.rate > 0) rulesUsed.push(`IVA:${iva.rate}%`);
    if (percepcionGanancias.rate > 0) rulesUsed.push(`PERCEPCION_GAN:${percepcionGanancias.rate}%`);
    if (iibb.rate > 0) rulesUsed.push(`IIBB:${provincia}:${iibb.rate}%`);
    
    // Warnings especiales
    if (provincia === 'Tierra del Fuego' && iva.rate === 0) {
      warnings.push('IVA no aplicado por exención en Tierra del Fuego');
    }
    
    if (!percepcionGanancias.applied) {
      warnings.push(percepcionGanancias.reason);
    }
    
    const resultado = {
      input: {
        precio: parseFloat(precio),
        moneda,
        provincia,
        metodo_pago: metodoPago,
        categoria_producto: categoriaProducto
      },
      cotizacion: cotizacion ? {
        tipo: cotizacion.tipo,
        valor: parseFloat(cotizacion.venta),
        source: cotizacion.source,
        fetched_at: cotizacion.fetchedAt,
        is_stale: cotizacion.isStale
      } : null,
      desglose: {
        precio_base_ars: Math.round(precioARS * 100) / 100,
        iva: Math.round(iva.amount * 100) / 100,
        percepcion_ganancias: Math.round(percepcionGanancias.amount * 100) / 100,
        iibb: Math.round(iibb.amount * 100) / 100,
        total: Math.round(total * 100) / 100
      },
      meta: {
        rules_used: rulesUsed,
        warnings: warnings
      }
    };
    
    return resultado;
    
  } catch (error) {
    console.error('Error calculating taxes:', error);
    throw error;
  }
}

/**
 * Guarda el log del cálculo
 */
async function logCalculation(userId, input, output, ratesSnapshot) {
  try {
    await prisma.calculationLog.create({
      data: {
        userId: userId || null,
        inputJson: JSON.stringify(input),
        outputJson: JSON.stringify(output),
        ratesSnapshotJson: JSON.stringify(ratesSnapshot)
      }
    });
  } catch (error) {
    console.error('Error logging calculation:', error);
    // No fallar por error de logging
  }
}

module.exports = {
  calcularImpuestos,
  logCalculation,
  getTaxRules,
  validateInput,
  PROVINCIAS_VALIDAS,
  METODOS_PAGO_VALIDOS
};
