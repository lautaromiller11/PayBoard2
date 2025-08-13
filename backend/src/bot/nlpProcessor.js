// Versión completa del procesador NLP
const nlp = require('compromise');

// Diccionario de palabras clave para mapear a categorías
const CATEGORIA_KEYWORDS = {
    // Gastos
    'Alimentación': ['super', 'supermercado', 'mercado', 'alimentos', 'comida', 'groceries', 'almacen', 'verduleria', 'carniceria', 'kiosko', 'alimentacion'],
    'Transporte': ['transporte', 'combustible', 'nafta', 'gasolina', 'uber', 'taxi', 'remis', 'pasaje', 'colectivo', 'subte', 'tren', 'bondi', 'sube', 'estacionamiento'],
    'Servicios': ['luz', 'electricidad', 'agua', 'gas', 'internet', 'wifi', 'telefono', 'celular', 'servicio', 'factura', 'impuesto', 'cable', 'streaming', 'EPE', 'litoral gas', 'abono'],
    'Hogar': ['alquiler', 'renta', 'departamento', 'casa', 'expensas', 'hogar', 'muebles', 'decoracion', 'utiles'],
    'Ocio y entretenimiento': ['cine', 'teatro', 'concierto', 'salida', 'juego', 'netflix', 'disney', 'spotify', 'restaurante', 'bar', 'cafe', 'cerveza', 'entretenimiento', 'ocio'],
    'Salud': ['medico', 'doctor', 'farmacia', 'medicamento', 'consulta', 'hospital', 'clinica', 'dentista', 'prepaga', 'obra social', 'salud'],
    'Educación': ['colegio', 'escuela', 'universidad', 'curso', 'libro', 'material', 'clase', 'educacion', 'educación'],
    'Ropa y accesorios': ['ropa', 'zapato', 'vestido', 'pantalon', 'remera', 'camisa', 'calzado', 'indumentaria', 'accesorios'],
    'Viajes y vacaciones': ['viaje', 'hotel', 'hospedaje', 'vuelo', 'avion', 'turismo', 'vacaciones'],
    'Tecnología y electrónica': ['computadora', 'laptop', 'celular', 'telefono', 'gadget', 'tecnologia', 'electronica'],
    'Facturas y suscripciones': ['factura', 'suscripcion', 'membresía', 'mensualidad', 'pago recurrente'],
    'Mascotas': ['mascota', 'mascotas', 'perro', 'gato', 'veterinario', 'alimento', 'comida para perros', 'comida para gatos', 'veterinaria', 'pet', 'animales', 'animal', 'mascotita', 'peluquería canina', 'peluqueria canina'],
    'Otros': ['gasto', 'compra', 'pago', 'deuda', 'otros'],

    // Ingresos
    'Sueldo y salario': ['sueldo', 'salario', 'pago', 'nomina', 'trabajo', 'empleo'],
    'Freelance o trabajos independientes': ['freelance', 'proyecto', 'cliente', 'autonomo', 'independiente', 'honorario'],
    'Inversiones (dividendos, intereses)': ['inversion', 'dividendo', 'interes', 'plazo fijo', 'accion', 'bono', 'cedear', 'renta'],
    'Otros ingresos': ['ingreso', 'cobro', 'plata', 'entrada', 'venta']
};

// Palabras clave para determinar el tipo de transacción
const TIPO_KEYWORDS = {
    gasto: ['gasto', 'gasté', 'gasté', 'compré', 'compre', 'pagué', 'pague', 'consumí', 'consumi', 'aboné', 'abone', 'invertí', 'inverti'],
    ingreso: ['ingreso', 'cobré', 'cobre', 'recibí', 'recibi', 'entró', 'entro', 'deposito', 'depositaron', 'transferencia', 'me pagaron', 'me enviaron']
};

/**
 * Preprocesa el texto para separar números pegados a palabras
 */
function preprocessText(text) {
    // Separar números pegados a palabras (ej: "sueldo900.000" -> "sueldo 900.000")
    const processed = text.replace(/([a-zA-Z])(\d+)/g, '$1 $2')
                         .replace(/(\d+)([a-zA-Z])/g, '$1 $2');
    
    console.log('[DEBUG] Texto preprocesado:', processed);
    return processed;
}

/**
 * Extrae el monto de un texto utilizando expresiones regulares
 */
function extractAmount(text) {
    // Primero preprocesamos el texto para separar números pegados a palabras
    const processedText = preprocessText(text);
    console.log('[DEBUG] Buscando monto en:', processedText);
    
    // Patrón para encontrar montos
    const pattern = /\$?\s*(\d+(?:[.,]\d{1,3})*(?:[.,]\d{1,2})?)/;
    const match = processedText.match(pattern);
    
    if (match) {
        console.log('[DEBUG] Patrón principal encontró:', match[1]);
        // Limpiamos el monto de cualquier separador
        let rawAmount = match[1];
        
        // Si tiene un punto o coma decimal
        if (/[.,]\d{1,2}$/.test(rawAmount)) {
            const decimalMatch = rawAmount.match(/([.,])(\d{1,2})$/);
            if (decimalMatch) {
                // Procesamos correctamente
                const mainPart = rawAmount.replace(/[.,]/g, '');
                rawAmount = mainPart.slice(0, -decimalMatch[2].length) + '.' + decimalMatch[2];
            }
        } else {
            // Si no tiene decimales, simplemente eliminamos todos los separadores
            rawAmount = rawAmount.replace(/[.,\s]/g, '');
        }
        
        // Convertimos a número
        const amount = parseInt(rawAmount, 10);
        
        if (Number.isFinite(amount) && amount > 0) {
            console.log('[DEBUG] Monto extraído exitosamente:', amount);
            return amount;
        }
    }
    
    // Si el patrón principal falló, intentamos un enfoque más simple
    console.log('[DEBUG] Intentando patrón alternativo');
    const fallbackPattern = /\$?\s*(\d+)/;
    const fallbackMatch = processedText.match(fallbackPattern);
    
    if (fallbackMatch) {
        console.log('[DEBUG] Patrón alternativo encontró:', fallbackMatch[1]);
        const amount = parseInt(fallbackMatch[1], 10);
        
        if (Number.isFinite(amount) && amount > 0) {
            console.log('[DEBUG] Monto alternativo extraído:', amount);
            return amount;
        }
    }
    
    console.log('[DEBUG] No se pudo extraer un monto válido');
    return null;
}

/**
 * Detecta el tipo de transacción (gasto o ingreso) basado en palabras clave
 */
function detectTransactionType(text) {
    const textLower = text.toLowerCase();
    
    // Verificamos palabras clave para gasto
    for (const keyword of TIPO_KEYWORDS.gasto) {
        if (textLower.includes(keyword.toLowerCase())) {
            console.log('[DEBUG] Tipo detectado como gasto por palabra clave:', keyword);
            return 'gasto';
        }
    }
    
    // Verificamos palabras clave para ingreso
    for (const keyword of TIPO_KEYWORDS.ingreso) {
        if (textLower.includes(keyword.toLowerCase())) {
            console.log('[DEBUG] Tipo detectado como ingreso por palabra clave:', keyword);
            return 'ingreso';
        }
    }
    
    // Inferir por contexto mediante palabras relacionadas con categorías
    for (const [categoria, keywords] of Object.entries(CATEGORIA_KEYWORDS)) {
        // Solo revisar categorías de ingresos
        if (categoria.includes('Sueldo') || 
            categoria.includes('Freelance') || 
            categoria.includes('Inversiones')) {
            
            for (const keyword of keywords) {
                if (textLower.includes(keyword.toLowerCase())) {
                    console.log('[DEBUG] Tipo inferido como ingreso por categoría:', categoria);
                    return 'ingreso';
                }
            }
        }
    }
    
    // Si no encontramos palabras clave, intentamos inferir por el contexto
    if (textLower.includes('en') || textLower.includes('por') || textLower.includes('para')) {
        console.log('[DEBUG] Tipo inferido como gasto por preposición');
        return 'gasto'; // Asumimos que es un gasto si menciona "en", "por" o "para"
    }
    
    return null; // No pudimos determinar el tipo
}

/**
 * Detecta la categoría más probable basada en palabras clave y contexto
 */
function detectCategory(text, tipo) {
    const textLower = text.toLowerCase();
    console.log('[DEBUG] Detectando categoría para:', textLower);
    console.log('[DEBUG] Tipo de transacción:', tipo);
    
    // Detección especial para expresiones relacionadas con mascotas
    if (textLower.includes('comida') && (textLower.includes('perro') || textLower.includes('mascota'))) {
        console.log('[DEBUG] Detectada expresión especial relacionada con mascotas');
        return 'Mascotas';
    }

    // Detección especial para expresiones compuestas
    const expresionesEspeciales = {
        'comida para mascota': 'Mascotas',
        'comida para perro': 'Mascotas',
        'comida para gato': 'Mascotas',
        'alimento para mascota': 'Mascotas',
        'alimento para perro': 'Mascotas',
        'alimento para gato': 'Mascotas'
    };

    // Verificar si alguna expresión especial está en el texto
    for (const [expresion, categoria] of Object.entries(expresionesEspeciales)) {
        if (textLower.includes(expresion)) {
            console.log(`[DEBUG] Detectada expresión especial: "${expresion}", asignando categoría: "${categoria}"`);
            return categoria;
        }
    }
    
    // Iteramos por cada categoría en el diccionario
    for (const [categoria, keywords] of Object.entries(CATEGORIA_KEYWORDS)) {
        // Solo consideramos categorías relevantes al tipo de transacción
        if ((tipo === 'gasto' && categoria.startsWith('Otros ingresos')) || 
            (tipo === 'ingreso' && !categoria.startsWith('Sueldo') && 
                                  !categoria.startsWith('Freelance') && 
                                  !categoria.startsWith('Inversiones') && 
                                  !categoria.startsWith('Otros ingresos'))) {
            continue;
        }
        
        // Buscamos coincidencias con palabras clave de la categoría
        for (const keyword of keywords) {
            console.log(`[DEBUG] Verificando keyword "${keyword}" para categoría "${categoria}"`);
            
            // Hacemos una búsqueda más flexible - si la palabra clave está contenida en el texto
            if (textLower.includes(keyword.toLowerCase())) {
                console.log(`[DEBUG] ¡Coincidencia encontrada! Palabra clave: "${keyword}", Categoría: "${categoria}"`);
                return categoria;
            }
        }
    }
    
    console.log('[DEBUG] No se encontraron coincidencias específicas, usando categoría genérica');
    return tipo === 'gasto' ? 'Otros' : 'Otros ingresos';
}

/**
 * Extrae la descripción del mensaje eliminando palabras relacionadas al monto y tipo
 */
function extractDescription(text, amount) {
    // Primero preprocesamos el texto para separar números pegados a palabras
    const processedText = preprocessText(text);
    console.log('[DEBUG] Texto para extraer descripción:', processedText);
    
    // Recopilamos todas las palabras clave de categorías
    const allCategoryKeywords = [];
    for (const keywords of Object.values(CATEGORIA_KEYWORDS)) {
        allCategoryKeywords.push(...keywords);
    }
    
    // Creamos una función para verificar palabras clave de categorías
    const containsCategoryKeyword = (text) => {
        const lowerText = text.toLowerCase();
        return allCategoryKeywords.some(keyword => 
            lowerText.includes(keyword.toLowerCase()));
    };
    
    // Eliminamos el monto y palabras comunes
    let description = processedText
        .replace(new RegExp('\\$?\\s*' + amount + '\\b', 'g'), '')
        .replace(/\$?\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{1,2})?\b/g, '')
        .replace(/\b(gasté|gaste|pagué|pague|compré|compre|cobré|cobre|recibí|recibi)\b/gi, '')
        .replace(/\b(en el|en la|en|por|para|de)\b/gi, '')
        .trim();
    
    // Eliminar números al principio de la descripción
    description = description.replace(/^\d+\s+/, '');
        
    // Si la descripción está vacía o es muy corta, intentamos extraer palabras clave
    if (description.length < 3) {
        // Buscar palabras clave de categorías
        for (const [categoria, keywords] of Object.entries(CATEGORIA_KEYWORDS)) {
            for (const keyword of keywords) {
                if (processedText.toLowerCase().includes(keyword.toLowerCase())) {
                    console.log(`[DEBUG] Palabra clave de categoría encontrada: ${keyword}`);
                    return keyword;
                }
            }
        }
        
        // Si no encontramos palabras clave, usamos NLP para extraer sustantivos
        const doc = nlp(processedText);
        const nouns = doc.nouns().out('array');
        if (nouns.length > 0) {
            const filteredNouns = nouns.filter(noun => !(/^\d+$/.test(noun)));
            description = filteredNouns.join(' ');
        } else {
            description = processedText.replace(/\d+/g, '').trim();
        }
    }
    
    // Limpiar espacios múltiples
    description = description.replace(/\s+/g, ' ').trim();
    
    // Si la descripción sigue vacía, buscar palabras clave comunes
    if (!description) {
        const keywordMatch = text.match(/sueldo|salario|cobr[eé]|supermercado|verduleria|uber|restaurant|comida|transporte|mascota|perro|gato|veterinaria/i);
        if (keywordMatch) {
            description = keywordMatch[0];
        }
    }
    
    // Verificación especial para expresiones relacionadas con mascotas
    const lowerText = text.toLowerCase();
    if (lowerText.includes('comida') && 
        (lowerText.includes('perro') || 
         lowerText.includes('mascota') || 
         lowerText.includes('gato'))) {
         
        if (!description || description.length < 10) {
            // Usar la expresión completa relacionada con mascotas
            if (lowerText.includes('perro')) {
                description = 'comida para perro';
            } else if (lowerText.includes('gato')) {
                description = 'comida para gato';
            } else {
                description = 'comida para mascota';
            }
        }
    }
    
    // Verificar si la descripción es una versión truncada de una palabra clave
    if (description.length >= 3) {
        for (const keyword of allCategoryKeywords) {
            if (keyword.toLowerCase().startsWith(description.toLowerCase()) && 
                processedText.toLowerCase().includes(keyword.toLowerCase())) {
                console.log(`[DEBUG] Descripción truncada: "${description}" vs keyword: "${keyword}"`);
                description = keyword;
                break;
            }
        }
    }
    
    console.log('[DEBUG] Descripción después de limpieza:', description);
    return description.slice(0, 100);
}

/**
 * Procesa un mensaje en lenguaje natural para extraer información de transacción
 */
function processNaturalLanguage(message) {
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return null;
    }
    
    const text = message.trim();
    console.log('[DEBUG] Procesando mensaje original:', text);
    
    // Preprocesamos el texto
    const processedText = preprocessText(text);
    
    // Detectamos el tipo de transacción
    const type = detectTransactionType(processedText);
    console.log('[DEBUG] Tipo detectado:', type);
    
    // Extraemos el monto
    const amount = extractAmount(processedText);
    console.log('[DEBUG] Monto detectado:', amount);
    
    // Detectamos la categoría (solo si tenemos un tipo)
    const category = type ? detectCategory(processedText, type) : null;
    console.log('[DEBUG] Categoría detectada:', category);
    
    // Extraemos la descripción (solo si tenemos un monto)
    const description = amount ? extractDescription(processedText, amount) : null;
    console.log('[DEBUG] Descripción extraída:', description);
    
    // Construimos el resultado
    const result = {
        tipo: type,
        monto: amount,
        categoria: category,
        descripcion: description,
        missing: {
            tipo: !type,
            monto: !amount,
            categoria: !category
        },
        isComplete: Boolean(type && amount)
    };
    
    console.log('[DEBUG] Resultado del procesamiento:', JSON.stringify(result));
    return result;
}

// Exportaciones explícitas
module.exports = {
    processNaturalLanguage,
    extractAmount,
    detectTransactionType,
    detectCategory,
    extractDescription,
    CATEGORIA_KEYWORDS
};
