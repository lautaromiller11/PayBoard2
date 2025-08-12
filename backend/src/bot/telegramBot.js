// Telegram bot integration for recording ingresos/gastos via existing API
const TelegramBot = require('node-telegram-bot-api')
const axios = require('axios')

// In-memory stores (MVP). For persistence, move to DB/Redis later.
const sessions = new Map() // chatId -> { token, user, step, tipo, descripcion, categoria, page }

function getApiBase(port) {
    const base = (process.env.BOT_API_BASE || '').trim()
    if (base) return base.replace(/\/+$/, '')
    const p = port || process.env.PORT || 4000
    return `http://localhost:${p}/api`
}

function chunk(arr, size) {
    const out = []
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
    return out
}

function ensureSession(chatId) {
    if (!sessions.has(chatId)) sessions.set(chatId, { step: 'idle' })
    return sessions.get(chatId)
}

function clearStep(chatId) {
    const s = ensureSession(chatId)
    s.step = 'idle'
    s.tipo = undefined
    s.descripcion = undefined
    s.categoria = undefined
    s.page = 0
    s._cats = undefined
}

async function apiGet(apiBase, path, token) {
    return axios.get(`${apiBase}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
}

async function apiPost(apiBase, path, body, token) {
    return axios.post(`${apiBase}${path}`, body, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
}

function validateAmount(text) {
    // Accept only positive integers, allowing dots or spaces as thousand separators.
    // Examples: "135.300" => 135300, "1 200" => 1200. Reject commas/decimals/negatives/zero.
    const raw = String(text || '').trim()
    if (!raw) return null
    if (raw.includes(',') || /-/.test(raw)) return null
    const cleaned = raw.replace(/[.\s]/g, '')
    if (!/^\d+$/.test(cleaned)) return null
    const value = parseInt(cleaned, 10)
    if (!Number.isFinite(value) || value <= 0) return null
    return value
}

function buildTypeKeyboard() {
    return {
        inline_keyboard: [
            [
                { text: '➕ Ingreso', callback_data: 'tipo:ingreso' },
                { text: '➖ Gasto', callback_data: 'tipo:gasto' }
            ]
        ]
    }
}

function buildCategoriesKeyboard(categorias, page = 0) {
    const pageSize = 8
    const totalPages = Math.max(1, Math.ceil(categorias.length / pageSize))
    const p = Math.min(Math.max(0, page), totalPages - 1)
    const slice = categorias.slice(p * pageSize, p * pageSize + pageSize)
    const rows = chunk(slice.map(c => ({ text: c, callback_data: `cat:${c}` })), 2)
    const nav = []
    if (totalPages > 1) {
        nav.push({ text: '⬅️', callback_data: `page:${Math.max(0, p - 1)}` })
        nav.push({ text: `Página ${p + 1}/${totalPages}`, callback_data: 'noop' })
        nav.push({ text: '➡️', callback_data: `page:${Math.min(totalPages - 1, p + 1)}` })
    }
    if (nav.length) rows.push(nav)
    rows.push([{ text: 'Cancelar', callback_data: 'cancel' }])
    return { inline_keyboard: rows }
}

async function promptLogin(bot, chatId) {
    await bot.sendMessage(
        chatId,
        'No estás vinculado. Escribe:\n\n/login <email> <password>\n\nEjemplo: /login usuario@dominio.com MiClave123'
    )
}

function describeState(s) {
    if (!s || !s.token) return 'Sin sesión'
    return `Autenticado. Paso: ${s.step || 'idle'}${s.tipo ? `, tipo=${s.tipo}` : ''}${s.categoria ? `, cat=${s.categoria}` : ''}`
}

function startTelegramBot({ port }) {
    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) {
        console.warn('[telegram] TELEGRAM_BOT_TOKEN no definido; bot deshabilitado')
        return { stop: () => { } }
    }

    const apiBase = getApiBase(port)
    // Create bot without auto-start to ensure we remove any existing webhook first
    const bot = new TelegramBot(token, { polling: { interval: 300, autoStart: false } })
    console.log(`[telegram] Bot iniciado. API base: ${apiBase}`)

    // Log errors to help diagnose silent failures
    bot.on('polling_error', (err) => {
        const msg = err?.response?.body || err?.message || String(err)
        console.error('[telegram] polling_error:', msg)
    })
    bot.on('webhook_error', (err) => {
        const msg = err?.response?.body || err?.message || String(err)
        console.error('[telegram] webhook_error:', msg)
    })

    // Ensure polling works even if a webhook was set previously
    bot.deleteWebHook({ drop_pending_updates: true })
        .then(async () => {
            try {
                await bot.startPolling()
                const me = await bot.getMe()
                console.log(`[telegram] Polling started as @${me?.username || 'unknown'}`)
            } catch (e) {
                console.error('[telegram] Failed to start polling:', e?.message || e)
            }
        })
        .catch((e) => console.error('[telegram] deleteWebHook failed:', e?.message || e))

    bot.onText(/^\/start\b/, async (msg) => {
        const chatId = msg.chat.id
        const s = ensureSession(chatId)
        if (!s.token) {
            await promptLogin(bot, chatId)
            return
        }
        await bot.sendMessage(chatId, '¿Deseas sumar un gasto o un ingreso?', { reply_markup: buildTypeKeyboard() })
    })

    bot.onText(/^\/help$/, async (msg) => {
        const chatId = msg.chat.id
        await bot.sendMessage(chatId, 'Comandos:\n/start – comenzar flujo\n/login <email> <password> – iniciar sesión\n/logout – cerrar sesión\n/cancel – cancelar flujo actual')
    })

    bot.onText(/^\/status$/, async (msg) => {
        const chatId = msg.chat.id
        await bot.sendMessage(chatId, describeState(sessions.get(chatId)))
    })

    bot.onText(/^\/login\s+([^\s]+)\s+(.+)$/, async (msg, match) => {
        const chatId = msg.chat.id
        const email = match[1]
        const password = match[2]
        try {
            const { data } = await apiPost(apiBase, '/auth/login', { email, password })
            const s = ensureSession(chatId)
            s.token = data.token
            s.user = data.user
            clearStep(chatId)
            await bot.sendMessage(chatId, `Sesión iniciada para ${data.user.email}.`)
            await bot.sendMessage(chatId, '¿Deseas sumar un gasto o un ingreso?', { reply_markup: buildTypeKeyboard() })
        } catch (e) {
            const msgErr = e?.response?.data?.error || e?.message || 'Error desconocido'
            await bot.sendMessage(chatId, `Error de login: ${msgErr}`)
        }
    })

    bot.onText(/^\/logout$/, async (msg) => {
        const chatId = msg.chat.id
        sessions.delete(chatId)
        await bot.sendMessage(chatId, 'Sesión cerrada.')
    })

    bot.onText(/^\/cancel$/, async (msg) => {
        const chatId = msg.chat.id
        clearStep(chatId)
        await bot.sendMessage(chatId, 'Flujo cancelado. Usa /start para comenzar de nuevo.')
    })

    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id
        const data = query.data || ''
        const s = ensureSession(chatId)
        if (!s.token) {
            await promptLogin(bot, chatId)
            return bot.answerCallbackQuery(query.id)
        }
        try {
            if (data.startsWith('tipo:')) {
                s.tipo = data.split(':')[1]
                s.step = 'descripcion'
                await bot.editMessageText(
                    `Elegiste ${s.tipo}. Escribe una descripción breve para el movimiento (ej: "supermercado", "sueldo").`,
                    { chat_id: chatId, message_id: query.message.message_id }
                )
            } else if (data.startsWith('page:')) {
                const next = parseInt(data.split(':')[1], 10)
                s.page = next
                const cats = s._cats || []
                await bot.editMessageReplyMarkup(buildCategoriesKeyboard(cats, s.page), {
                    chat_id: chatId,
                    message_id: query.message.message_id
                })
            } else if (data.startsWith('cat:')) {
                const cat = data.substring(4)
                s.categoria = cat
                s.step = 'monto'
                await bot.sendMessage(chatId, `Ingresa el monto (${s.tipo} - ${s.categoria}). Debe ser un entero positivo. Usa puntos como separador de miles (ej: 135.300).`)
            } else if (data === 'cancel') {
                clearStep(chatId)
                await bot.sendMessage(chatId, 'Flujo cancelado. Usa /start para comenzar de nuevo.')
            }
        } catch (e) {
            const msgErr = e?.response?.data?.error || e?.message || 'Error'
            await bot.sendMessage(chatId, `Error: ${msgErr}`)
        } finally {
            bot.answerCallbackQuery(query.id).catch(() => { })
        }
    })

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id
        // Ignore commands and callback responses
        if (msg.text && msg.text.startsWith('/')) return
        const s = ensureSession(chatId)
        if (!s.token) return // only handle text in authenticated flows
        if (s.step === 'descripcion') {
            const desc = String(msg.text || '').trim()
            if (!desc) {
                await bot.sendMessage(chatId, 'Descripción vacía. Escribe una breve descripción (ej: "supermercado").')
                return
            }
            s.descripcion = desc.slice(0, 140)
            // Now fetch categories for the chosen tipo and prompt
            try {
                s.page = 0
                const { data: cats } = await apiGet(apiBase, `/transacciones/categorias?tipo=${s.tipo}`, s.token)
                s._cats = cats
                s.step = 'categoria'
                await bot.sendMessage(chatId, 'Ahora elige la categoría:', { reply_markup: buildCategoriesKeyboard(cats, s.page) })
            } catch (e) {
                const msgErr = e?.response?.data?.error || e?.message || 'Error obteniendo categorías'
                await bot.sendMessage(chatId, `No se pudieron cargar las categorías: ${msgErr}`)
            }
        } else if (s.step === 'monto') {
            const value = validateAmount(msg.text)
            if (!value) {
                await bot.sendMessage(chatId, 'Monto inválido. Debe ser un entero positivo. Usa puntos para miles (ej: 135.300).')
                return
            }
            try {
                const now = new Date()
                const payload = {
                    tipo: s.tipo,
                    monto: value,
                    descripcion: s.descripcion || 'Agregado desde Telegram',
                    categoria: s.categoria,
                    fecha: now.toISOString(),
                    periodicidad: 'unico'
                }
                const { data } = await apiPost(apiBase, '/transacciones', payload, s.token)
                await bot.sendMessage(chatId, `Listo ✅ Se registró ${s.tipo} de $${value.toLocaleString('es-AR')} en "${s.categoria}" (${s.descripcion || 'sin descripción'}).`)
                clearStep(chatId)
                await bot.sendMessage(chatId, '¿Deseas sumar otro movimiento?', { reply_markup: buildTypeKeyboard() })
            } catch (e) {
                const msgErr = e?.response?.data?.error || e?.message || 'Error creando transacción'
                await bot.sendMessage(chatId, `No se pudo crear el movimiento: ${msgErr}`)
            }
        }
    })

    function stop() {
        try { bot.stopPolling() } catch { }
    }
    return { stop }
}

module.exports = { startTelegramBot }
