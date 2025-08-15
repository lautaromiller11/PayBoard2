const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

// Obtener cotización desde DolarAPI
async function getCotizacion(tipo) {
    try {
        // URL base de la API (idealmente desde variables de entorno)
        const DOLARAPI_BASE = process.env.DOLARAPI_BASE || 'https://dolarapi.com/v1/dolares';

        // Si el tipo es específico, usar el endpoint específico
        const url = tipo ? `${DOLARAPI_BASE}/${tipo}` : DOLARAPI_BASE;

        const response = await axios.get(url);

        // Si es un array (respuesta para todos los tipos), encontrar el tipo solicitado
        if (Array.isArray(response.data)) {
            const cotizacion = response.data.find(c => c.casa === tipo);
            if (!cotizacion) {
                throw new Error(`Tipo de cotización no encontrado: ${tipo}`);
            }
            return {
                tipo: cotizacion.casa,
                valor: cotizacion.venta,
                source: "dolarapi.com",
                fetched_at: new Date().toISOString(),
                is_stale: false
            };
        }

        // Si es un objeto (respuesta para un tipo específico)
        return {
            tipo: response.data.casa,
            valor: response.data.venta,
            source: "dolarapi.com",
            fetched_at: new Date().toISOString(),
            is_stale: false
        };
    } catch (error) {
        console.error('Error al obtener cotización:', error.message);

        // En caso de error, buscar la última cotización en la base de datos
        const ultimaCotizacion = await prisma.Rates.findFirst({
            where: { tipo },
            orderBy: { fetched_at: 'desc' }
        });

        if (ultimaCotizacion) {
            return {
                tipo: ultimaCotizacion.tipo,
                valor: ultimaCotizacion.venta,
                source: ultimaCotizacion.source,
                fetched_at: ultimaCotizacion.fetched_at.toISOString(),
                is_stale: true
            };
        }

        throw new Error('No se pudo obtener la cotización y no hay datos en caché');
    }
}

// Mapear método de pago a tipo de cotización
function mapMetodoPagoACotizacion(metodoPago) {
    // Solo incluye los cuatro métodos de pago permitidos
    const mapping = {
        'tarjeta_pesificado': 'tarjeta',
        'tarjeta_dolares_cuenta': 'oficial',
        'crypto': 'cripto',
        'mercado_pago': 'oficial'
    };

    return mapping[metodoPago] || 'oficial';
}

// Obtener reglas de impuestos desde la DB
async function getTaxRules(provincia) {
    try {
        // Obtener reglas globales (aplicables a todas las provincias)
        const globalRules = await prisma.TaxRules.findMany({
            where: {
                scope: 'global',
                active: true
            }
        });

        // Obtener reglas específicas para la provincia
        const provinciaRules = await prisma.TaxRules.findMany({
            where: {
                scope: 'provincia',
                province_code: provincia,
                active: true
            }
        });

        // Combinar reglas
        return [...globalRules, ...provinciaRules];
    } catch (error) {
        console.error('Error al obtener reglas de impuestos:', error.message);

        // Valores por defecto en caso de error (hardcoded como fallback)
        return [
            { name: 'IVA', tipo_enum: 'IVA', value_pct: 21 },
            { name: 'Impuesto PAIS', tipo_enum: 'PAIS', value_pct: 30 },
            { name: 'IIBB CABA', tipo_enum: 'IIBB', value_pct: 2.0, province_code: 'CABA' },
            { name: 'IIBB Buenos Aires', tipo_enum: 'IIBB', value_pct: 2.0, province_code: 'BA' },
            { name: 'IIBB Córdoba', tipo_enum: 'IIBB', value_pct: 3.0, province_code: 'CBA' },
            { name: 'IIBB Mendoza', tipo_enum: 'IIBB', value_pct: 0.0, province_code: 'MDZ' }
        ].filter(rule => rule.province_code ? rule.province_code === provincia : true);
    }
}

// Función para preparar la respuesta
async function prepararRespuesta(precio, moneda, provincia, metodoPago, categoriaProducto, precioArs, cotizacion, 
                               ivaAmount, impuestoPaisAmount, percepcionGananciasAmount, iibbAmount, total, rulesUsed) {
    // Registrar el cálculo en la base de datos
    await prisma.CalculationsLog.create({
        data: {
            user_id: null,
            input_json: JSON.stringify({
                precio,
                moneda,
                provincia,
                metodoPago,
                categoriaProducto
            }),
            output_json: JSON.stringify({
                precio_base_ars: precioArs,
                iva: ivaAmount,
                pais: impuestoPaisAmount,
                percepcion_ganancias: percepcionGananciasAmount,
                iibb: iibbAmount,
                total: total
            }),
            rates_snapshot_json: JSON.stringify(cotizacion)
        }
    });

    // Preparar y devolver respuesta
    return {
        input: {
            precio,
            moneda,
            provincia,
            metodo_pago: metodoPago,
            categoria_producto: categoriaProducto
        },
        cotizacion,
        desglose: {
            precio_base_ars: parseFloat(precioArs.toFixed(2)),
            iva: parseFloat(ivaAmount.toFixed(2)),
            pais: parseFloat(impuestoPaisAmount.toFixed(2)),
            percepcion_ganancias: parseFloat(percepcionGananciasAmount.toFixed(2)),
            iibb: parseFloat(iibbAmount.toFixed(2)),
            total: parseFloat(total.toFixed(2))
        },
        meta: {
            rules_used: rulesUsed,
            warnings: []
        }
    };
}

// Calcular impuestos
async function calcularImpuestos(precio, moneda, provincia, metodoPago, categoriaProducto) {
    try {
        // Validar que el método de pago sea uno de los permitidos
        const metodosPermitidos = [
            'tarjeta_pesificado', 
            'tarjeta_dolares_cuenta', 
            'crypto',
            'mercado_pago'
        ];
        if (!metodosPermitidos.includes(metodoPago)) {
            throw new Error(`Método de pago no válido. Opciones disponibles: ${metodosPermitidos.join(', ')}`);
        }

        // 1. Mapear método de pago a tipo de cotización
        const tipoCotizacion = mapMetodoPagoACotizacion(metodoPago);

        // 2. Obtener cotización
        const cotizacion = await getCotizacion(tipoCotizacion);

        // 3. Convertir a ARS si es necesario
        let precioArs = moneda === 'USD' ? precio * cotizacion.valor : precio;

        // 4. Obtener reglas de impuestos
        const taxRules = await getTaxRules(provincia);

        // 5. Calcular impuestos según el método de pago
        // Para crypto, no se aplican impuestos
        if (metodoPago === 'crypto') {
            const ivaAmount = 0;
            const impuestoPaisAmount = 0;
            const percepcionGananciasAmount = 0;
            const iibbAmount = 0;
            const total = precioArs; // Sin impuestos adicionales
            
            const rulesUsed = ["Sin impuestos aplicables para pagos con crypto"];
            
            return await prepararRespuesta(
                precio, moneda, provincia, metodoPago, categoriaProducto,
                precioArs, cotizacion, ivaAmount, impuestoPaisAmount,
                percepcionGananciasAmount, iibbAmount, total, rulesUsed
            );
        }
        
        // Para otros métodos de pago, aplicar las reglas correspondientes
        // Primero buscar regla de IVA específica para la provincia
        let iva = taxRules.find(rule => rule.tipo_enum === 'IVA' && rule.province_code === provincia)?.value_pct;
        // Si no hay regla específica para la provincia, usar la regla global
        if (iva === undefined) {
            iva = taxRules.find(rule => rule.tipo_enum === 'IVA' && rule.scope === 'global')?.value_pct || 21;
        }
        const impuestoPais = taxRules.find(rule => rule.tipo_enum === 'PAIS')?.value_pct || 30;
        const percepcionGanancias = taxRules.find(rule => rule.tipo_enum === 'PERCEPCION_GAN')?.value_pct || 30;
        const iibb = taxRules.find(rule => rule.tipo_enum === 'IIBB')?.value_pct || 0;

        // Aplicar impuestos según el método de pago
        const ivaAmount = (precioArs * iva) / 100;
        
        // Impuesto PAIS: solo para tarjeta pesificada
        const impuestoPaisAmount = metodoPago === 'tarjeta_pesificado' ? (precioArs * impuestoPais) / 100 : 0;
        
        // Percepción Ganancias: solo aplicar a tarjeta_pesificado
        const percepcionGananciasAmount = 
            (metodoPago === 'tarjeta_pesificado') ? (precioArs * percepcionGanancias) / 100 : 0;
        
        // IIBB se aplica a todos menos crypto
        const iibbAmount = metodoPago !== 'crypto' ? (precioArs * iibb) / 100 : 0;

        // Calcular total
        const total = precioArs + ivaAmount + impuestoPaisAmount + percepcionGananciasAmount + iibbAmount;
        
        // Crear lista de reglas aplicadas
        const rulesUsed = [
            `IVA:${iva}%`,
            impuestoPaisAmount > 0 ? `PAIS:${impuestoPais}%` : null,
            percepcionGananciasAmount > 0 ? `PERCEPCION_GAN:${percepcionGanancias}%` : null,
            iibbAmount > 0 ? `IIBB:${provincia}:${iibb}%` : null
        ].filter(Boolean);

        // 6. Preparar y devolver respuesta usando la función reutilizable
        return await prepararRespuesta(
            precio, moneda, provincia, metodoPago, categoriaProducto,
            precioArs, cotizacion, ivaAmount, impuestoPaisAmount,
            percepcionGananciasAmount, iibbAmount, total, rulesUsed
        );
    } catch (error) {
        console.error('Error en cálculo de impuestos:', error);
        throw error;
    }
}

// Endpoint para calcular impuestos
router.get('/calc-impuestos', async (req, res) => {
    try {
        const { precio, moneda, provincia, metodo_pago, categoria_producto } = req.query;

        // Validaciones
        if (!precio || isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
            return res.status(400).json({ error: 'El precio debe ser un número mayor que 0' });
        }

        if (!moneda || !['USD', 'ARS'].includes(moneda.toUpperCase())) {
            return res.status(400).json({ error: 'La moneda debe ser USD o ARS' });
        }

        if (!provincia) {
            return res.status(400).json({ error: 'Debe especificar una provincia' });
        }

        if (!metodo_pago) {
            return res.status(400).json({ error: 'Debe especificar un método de pago' });
        }

        // Validar que el método de pago sea uno de los permitidos
        const metodosPermitidos = [
            'tarjeta_pesificado', 
            'tarjeta_dolares_cuenta', 
            'crypto',
            'mercado_pago'
        ];
        if (!metodosPermitidos.includes(metodo_pago)) {
            return res.status(400).json({
                error: `Método de pago no válido`,
                valid_options: metodosPermitidos
            });
        }

        const resultado = await calcularImpuestos(
            parseFloat(precio),
            moneda.toUpperCase(),
            provincia,
            metodo_pago,
            categoria_producto || 'otro'
        );

        res.json(resultado);
    } catch (error) {
        console.error('Error en endpoint calc-impuestos:', error);
        res.status(500).json({
            error: 'Error al calcular impuestos',
            message: error.message
        });
    }
});

// Endpoint para el panel de administración
router.get('/admin/tax-rules', async (req, res) => {
    try {
        const rules = await prisma.TaxRules.findMany();
        res.json(rules);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener reglas de impuestos' });
    }
});

// Endpoint para actualizar una regla de impuesto
router.put('/admin/tax-rules/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, tipo_enum, value_pct, scope, province_code, active } = req.body;

        const updatedRule = await prisma.TaxRules.update({
            where: { id: parseInt(id) },
            data: {
                name,
                tipo_enum,
                value_pct: parseFloat(value_pct),
                scope,
                province_code,
                active,
                updated_at: new Date()
            }
        });

        res.json(updatedRule);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar regla de impuesto' });
    }
});

// Endpoint para forzar actualización de cotizaciones
router.post('/admin/refresh-rates', async (req, res) => {
    try {
        const DOLARAPI_BASE = process.env.DOLARAPI_BASE || 'https://dolarapi.com/v1/dolares';
        const response = await axios.get(DOLARAPI_BASE);

        if (Array.isArray(response.data)) {
            // Guardar cada cotización en la base de datos
            for (const cotizacion of response.data) {
                await prisma.Rates.create({
                    data: {
                        tipo: cotizacion.casa,
                        compra: cotizacion.compra,
                        venta: cotizacion.venta,
                        source: 'dolarapi.com',
                        fetched_at: new Date()
                    }
                });
            }

            res.json({
                message: 'Cotizaciones actualizadas correctamente',
                count: response.data.length
            });
        } else {
            res.status(400).json({ error: 'Formato de respuesta inesperado' });
        }
    } catch (error) {
        console.error('Error al actualizar cotizaciones:', error);
        res.status(500).json({
            error: 'Error al actualizar cotizaciones',
            message: error.message
        });
    }
});

// Endpoint de salud para monitoreo
router.get('/health', async (req, res) => {
    try {
        // Verificar conexión a la base de datos
        await prisma.$queryRaw`SELECT 1`;

        // Verificar conexión a DolarAPI
        const DOLARAPI_BASE = process.env.DOLARAPI_BASE || 'https://dolarapi.com/v1/dolares';
        await axios.get(DOLARAPI_BASE);

        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            services: {
                database: 'connected',
                dolarapi: 'connected'
            }
        });
    } catch (error) {
        console.error('Error en health check:', error);
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            services: {
                database: error.message.includes('prisma') ? 'disconnected' : 'connected',
                dolarapi: error.message.includes('axios') ? 'disconnected' : 'connected'
            },
            message: error.message
        });
    }
});

// Endpoint para obtener los métodos de pago disponibles
router.get('/metodos-pago', async (req, res) => {
    try {
        // Devuelve los métodos de pago disponibles exactamente como en el frontend
        const metodosPago = [
            { 
                id: 'tarjeta_pesificado', 
                nombre: 'Tarjeta (pesificado)',
                descripcion: 'Tarjeta de crédito o débito regular',
                icono: 'credit-card'
            },
            { 
                id: 'tarjeta_dolares_cuenta', 
                nombre: 'Tarjeta (dólares cuenta)',
                descripcion: 'Ideal para Amazon y gastos en dólares',
                icono: 'bank'
            },
            { 
                id: 'crypto', 
                nombre: 'Crypto (promedio wallets)',
                descripcion: 'Ideal para tiendas gaming globales',
                icono: 'bitcoin',
                destacado: true
            },
            { 
                id: 'mercado_pago', 
                nombre: 'Mercado Pago',
                descripcion: 'Ideal para suscripciones y gaming regional',
                icono: 'wallet',
                etiqueta: 'Nuevo'
            }
        ];
        
        res.json(metodosPago);
    } catch (error) {
        console.error('Error al obtener métodos de pago:', error);
        res.status(500).json({
            error: 'Error al obtener métodos de pago',
            message: error.message
        });
    }
});

// Exportamos router y la función calcularImpuestos para poder utilizarla en pruebas
module.exports = router;
module.exports.calcularImpuestos = calcularImpuestos;
