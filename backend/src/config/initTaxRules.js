// Script para inicializar reglas de impuestos en la base de datos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const taxRules = [
    // Reglas globales
    {
        name: 'IVA General',
        tipo_enum: 'IVA',
        value_pct: 21.0,
        scope: 'global',
        province_code: null
    },
    {
        name: 'Impuesto PAIS',
        tipo_enum: 'PAIS',
        value_pct: 30.0,
        scope: 'global',
        province_code: null
    },
    {
        name: 'Percepción Ganancias',
        tipo_enum: 'PERCEPCION_GAN',
        value_pct: 30.0,
        scope: 'global',
        province_code: null
    },

    // Reglas por provincia - IIBB
    {
        name: 'IIBB CABA',
        tipo_enum: 'IIBB',
        value_pct: 2.0,
        scope: 'provincia',
        province_code: 'CABA'
    },
    {
        name: 'IIBB Buenos Aires',
        tipo_enum: 'IIBB',
        value_pct: 2.0,
        scope: 'provincia',
        province_code: 'BA'
    },
    {
        name: 'IIBB Córdoba',
        tipo_enum: 'IIBB',
        value_pct: 3.0,
        scope: 'provincia',
        province_code: 'CBA'
    },
    {
        name: 'IIBB Mendoza',
        tipo_enum: 'IIBB',
        value_pct: 0.0,
        scope: 'provincia',
        province_code: 'MDZ'
    },
    {
        name: 'IIBB Santa Fe',
        tipo_enum: 'IIBB',
        value_pct: 4.5,
        scope: 'provincia',
        province_code: 'SFE'
    },
    {
        name: 'IIBB Tucumán',
        tipo_enum: 'IIBB',
        value_pct: 0.0,
        scope: 'provincia',
        province_code: 'TUC'
    },
    {
        name: 'IIBB Entre Ríos',
        tipo_enum: 'IIBB',
        value_pct: 0.0,
        scope: 'provincia',
        province_code: 'ENR'
    },
    {
        name: 'IIBB Salta',
        tipo_enum: 'IIBB',
        value_pct: 3.6,
        scope: 'provincia',
        province_code: 'SAL'
    },
    {
        name: 'IIBB Chaco',
        tipo_enum: 'IIBB',
        value_pct: 5.5,
        scope: 'provincia',
        province_code: 'CHA'
    },
    {
        name: 'IIBB Misiones',
        tipo_enum: 'IIBB',
        value_pct: 2.4,
        scope: 'provincia',
        province_code: 'MIS'
    },
    {
        name: 'IIBB Corrientes',
        tipo_enum: 'IIBB',
        value_pct: 0.0,
        scope: 'provincia',
        province_code: 'COR'
    },
    {
        name: 'IIBB San Juan',
        tipo_enum: 'IIBB',
        value_pct: 0.0,
        scope: 'provincia',
        province_code: 'SJN'
    },
    {
        name: 'IIBB Jujuy',
        tipo_enum: 'IIBB',
        value_pct: 0.0,
        scope: 'provincia',
        province_code: 'JUJ'
    },
    {
        name: 'IIBB San Luis',
        tipo_enum: 'IIBB',
        value_pct: 0.0,
        scope: 'provincia',
        province_code: 'SLS'
    },
    {
        name: 'IIBB Río Negro',
        tipo_enum: 'IIBB',
        value_pct: 5.0,
        scope: 'provincia',
        province_code: 'RNE'
    },
    {
        name: 'IIBB Formosa',
        tipo_enum: 'IIBB',
        value_pct: 0.0,
        scope: 'provincia',
        province_code: 'FOR'
    },
    {
        name: 'IIBB Neuquén',
        tipo_enum: 'IIBB',
        value_pct: 4.0,
        scope: 'provincia',
        province_code: 'NEU'
    },
    {
        name: 'IIBB Chubut',
        tipo_enum: 'IIBB',
        value_pct: 0.0,
        scope: 'provincia',
        province_code: 'CHU'
    },
    {
        name: 'IIBB La Pampa',
        tipo_enum: 'IIBB',
        value_pct: 1.1,
        scope: 'provincia',
        province_code: 'LPA'
    },
    {
        name: 'IIBB Santa Cruz',
        tipo_enum: 'IIBB',
        value_pct: 0.0,
        scope: 'provincia',
        province_code: 'SCR'
    },
    {
        name: 'IIBB La Rioja',
        tipo_enum: 'IIBB',
        value_pct: 0.0,
        scope: 'provincia',
        province_code: 'LAR'
    },
    {
        name: 'IIBB Catamarca',
        tipo_enum: 'IIBB',
        value_pct: 0.0,
        scope: 'provincia',
        province_code: 'CAT'
    },
    {
        name: 'IIBB Tierra del Fuego',
        tipo_enum: 'IIBB',
        value_pct: 3.0,
        scope: 'provincia',
        province_code: 'TDF'
    },
    // Casos especiales para TDF (exenta de IVA)
    {
        name: 'IVA Tierra del Fuego',
        tipo_enum: 'IVA',
        value_pct: 0.0,
        scope: 'provincia',
        province_code: 'TDF'
    }
];

async function initTaxRules() {
    console.log('Inicializando reglas de impuestos...');

    // Verificar si ya existen reglas en la base de datos
    const existingRulesCount = await prisma.TaxRules.count();

    if (existingRulesCount > 0) {
        console.log(`Ya existen ${existingRulesCount} reglas de impuestos. Omitiendo inicialización.`);
        return;
    }

    // Crear reglas en la base de datos
    const createdRules = await prisma.TaxRules.createMany({
        data: taxRules,
        skipDuplicates: true
    });

    console.log(`Creadas ${createdRules.count} reglas de impuestos.`);
}

module.exports = { initTaxRules };
