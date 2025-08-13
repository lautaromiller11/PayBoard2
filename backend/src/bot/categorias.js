// Categorías válidas según la API
const CATEGORIAS_GASTOS = [
  'Servicios',
  'Hogar',
  'Impuestos',
  'Salud',
  'Educación',
  'Alimentación',
  'Transporte',
  'Ocio y entretenimiento',
  'Trabajo y negocios',
  'Tecnología y electrónica',
  'Ropa y accesorios',
  'Viajes y vacaciones',
  'Ahorros e inversiones',
  'Deudas y préstamos',
  'Donaciones y caridad',
  'Seguros',
  'Cuidado personal y belleza',
  'Mascotas',
  'Mantenimiento y reparaciones',
  'Facturas y suscripciones',
  'Regalos y celebraciones',
  'Otros'
];

const CATEGORIAS_INGRESOS = [
  'Sueldo y salario',
  'Bonificaciones y comisiones',
  'Negocios propios',
  'Freelance o trabajos independientes',
  'Inversiones (dividendos, intereses)',
  'Alquileres recibidos',
  'Venta de bienes',
  'Regalos y herencias',
  'Reembolsos',
  'Subsidios y ayudas',
  'Otros ingresos'
];

const CATEGORIAS_VALIDAS = {
    gasto: CATEGORIAS_GASTOS,
    ingreso: CATEGORIAS_INGRESOS
};

// Mapeo de nuestras categorías reconocidas a las categorías válidas de la API
const CATEGORIA_MAPPING = {
    // Gastos
    'supermercado': 'Alimentación',
    'Supermercado': 'Alimentación',
    'Transporte': 'Transporte',
    'transporte': 'Transporte',
    'uber': 'Transporte',
    'taxi': 'Transporte',
    'Servicios': 'Servicios',
    'servicios': 'Servicios',
    'Alquiler': 'Hogar',
    'alquiler': 'Hogar',
    'Entretenimiento': 'Ocio y entretenimiento',
    'entretenimiento': 'Ocio y entretenimiento',
    'restaurante': 'Ocio y entretenimiento',
    'bar': 'Ocio y entretenimiento',
    'Salud': 'Salud',
    'salud': 'Salud',
    'farmacia': 'Salud',
    'Educación': 'Educación',
    'educacion': 'Educación',
    'Educacion': 'Educación',
    'Ropa': 'Ropa y accesorios',
    'ropa': 'Ropa y accesorios',
    'Viajes': 'Viajes y vacaciones',
    'viajes': 'Viajes y vacaciones',
    'Mascotas': 'Mascotas',
    'mascotas': 'Mascotas',
    'perro': 'Mascotas',
    'gato': 'Mascotas',
    'veterinaria': 'Mascotas',
    'veterinario': 'Mascotas',
    'Otros gastos': 'Otros',
    'otros gastos': 'Otros',
    
    // Ingresos
    'Sueldo': 'Sueldo y salario',
    'sueldo': 'Sueldo y salario',
    'Freelance': 'Freelance o trabajos independientes',
    'freelance': 'Freelance o trabajos independientes',
    'Inversiones': 'Inversiones (dividendos, intereses)',
    'inversiones': 'Inversiones (dividendos, intereses)',
    'Otros ingresos': 'Otros ingresos',
    'otros ingresos': 'Otros ingresos'
};

/**
 * Mapea una categoría detectada a una categoría válida para la API
 * @param {string} categoria Categoría detectada por el NLP
 * @param {string} tipo Tipo de transacción ('gasto' o 'ingreso')
 * @returns {string} Categoría válida para la API
 */
function mapearCategoria(categoria, tipo) {
    if (!categoria) {
        console.log('[DEBUG] Categoría no proporcionada, usando categoría por defecto');
        return tipo === 'gasto' ? 'Otros' : 'Otros ingresos';
    }
    
    console.log('[DEBUG] Mapeando categoría:', categoria, 'para tipo:', tipo);
    
    // Intentamos mapear usando nuestro diccionario
    const categoriaFormateada = CATEGORIA_MAPPING[categoria];
    if (categoriaFormateada) {
        console.log('[DEBUG] Categoría mapeada a:', categoriaFormateada);
        return categoriaFormateada;
    }
    
    // Si la categoría ya está en el formato correcto y es válida, la devolvemos directamente
    if (CATEGORIAS_VALIDAS[tipo]?.includes(categoria)) {
        console.log('[DEBUG] Categoría ya válida:', categoria);
        return categoria;
    }
    
    console.log('[DEBUG] No se pudo mapear la categoría, usando categoría por defecto');
    // Si no podemos mapear, devolvemos la categoría por defecto
    return tipo === 'gasto' ? 'Otros' : 'Otros ingresos';
}

module.exports = {
    CATEGORIAS_VALIDAS,
    CATEGORIA_MAPPING,
    mapearCategoria
};

module.exports = {
    CATEGORIAS_VALIDAS,
    CATEGORIA_MAPPING,
    mapearCategoria
};

module.exports = {
    CATEGORIAS_VALIDAS,
    CATEGORIA_MAPPING,
    mapearCategoria
};
