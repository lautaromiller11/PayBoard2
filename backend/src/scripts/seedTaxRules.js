const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTaxRules() {
  console.log('🌱 Seeding tax rules...');

  // Limpiar reglas existentes
  await prisma.taxRule.deleteMany();

  // Reglas globales
  const globalRules = [
    {
      name: 'IVA General',
      tipoEnum: 'IVA',
      valuePct: 21.0,
      scope: 'global',
      active: true
    },
    {
      name: 'Impuesto PAIS',
      tipoEnum: 'PAIS',
      valuePct: 30.0,
      scope: 'global',
      active: true
    },
    {
      name: 'Percepción Ganancias/Bienes Personales',
      tipoEnum: 'PERCEPCION_GAN',
      valuePct: 35.0,
      scope: 'global',
      active: true
    }
  ];

  // Reglas provinciales - IVA
  const ivaProvincialRules = [
    {
      name: 'IVA Tierra del Fuego',
      tipoEnum: 'IVA',
      valuePct: 0.0,
      scope: 'provincia',
      provinceCode: 'Tierra del Fuego',
      active: true
    }
  ];

  // Reglas provinciales - IIBB
  const iibbRules = [
    {
      name: 'IIBB CABA',
      tipoEnum: 'IIBB',
      valuePct: 3.5,
      scope: 'provincia',
      provinceCode: 'CABA',
      active: true
    },
    {
      name: 'IIBB Buenos Aires',
      tipoEnum: 'IIBB',
      valuePct: 4.0,
      scope: 'provincia',
      provinceCode: 'Buenos Aires',
      active: true
    },
    {
      name: 'IIBB Córdoba',
      tipoEnum: 'IIBB',
      valuePct: 3.0,
      scope: 'provincia',
      provinceCode: 'Córdoba',
      active: true
    },
    {
      name: 'IIBB Mendoza',
      tipoEnum: 'IIBB',
      valuePct: 3.5,
      scope: 'provincia',
      provinceCode: 'Mendoza',
      active: true
    },
    {
      name: 'IIBB Tierra del Fuego',
      tipoEnum: 'IIBB',
      valuePct: 0.0,
      scope: 'provincia',
      provinceCode: 'Tierra del Fuego',
      active: true
    },
    {
      name: 'IIBB Santa Fe',
      tipoEnum: 'IIBB',
      valuePct: 4.0,
      scope: 'provincia',
      provinceCode: 'Santa Fe',
      active: true
    },
    {
      name: 'IIBB Tucumán',
      tipoEnum: 'IIBB',
      valuePct: 3.0,
      scope: 'provincia',
      provinceCode: 'Tucumán',
      active: true
    },
    {
      name: 'IIBB Salta',
      tipoEnum: 'IIBB',
      valuePct: 2.5,
      scope: 'provincia',
      provinceCode: 'Salta',
      active: true
    }
  ];

  // Insertar todas las reglas
  const allRules = [...globalRules, ...ivaProvincialRules, ...iibbRules];

  for (const rule of allRules) {
    await prisma.taxRule.create({ data: rule });
    console.log(`✅ Created rule: ${rule.name}`);
  }

  console.log(`🎉 Successfully seeded ${allRules.length} tax rules`);
}

async function main() {
  try {
    await seedTaxRules();
  } catch (error) {
    console.error('❌ Error seeding tax rules:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { seedTaxRules };
