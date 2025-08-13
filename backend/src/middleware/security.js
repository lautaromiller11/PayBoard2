/**
 * Middleware de seguridad para la aplicación
 * Implementa diversas protecciones:
 * - Helmet para cabeceras HTTP seguras
 * - Limitación de tasa (rate limiting)
 * - Sanitización de entrada
 * - Protección CSRF
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

/**
 * Configura el middleware de seguridad para Express
 * @param {Object} app - Instancia de Express
 */
function setupSecurityMiddleware(app) {
  // Activar Helmet para protección de cabeceras HTTP
  if (process.env.HELMET_ENABLED === 'true') {
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", process.env.CORS_ORIGIN || '*'],
          },
        },
        xssFilter: true,
        noSniff: true,
        referrerPolicy: { policy: 'same-origin' },
      })
    );
    console.log('✅ Helmet middleware activado');
  }

  // Limitar tasa de peticiones para prevenir ataques de fuerza bruta
  if (process.env.RATE_LIMIT_WINDOW_MS && process.env.RATE_LIMIT_MAX_REQUESTS) {
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutos por defecto
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100, // 100 peticiones por ventana por defecto
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Demasiadas peticiones desde esta IP, inténtalo de nuevo más tarde.',
    });

    // Aplicar límite a todas las solicitudes
    app.use('/api/', limiter);
    console.log('✅ Rate limiting activado');
  }

  // Prevenir ataques XSS sanitizando la entrada
  app.use(xss());
  console.log('✅ XSS sanitization activado');

  // Soporte para cookies
  app.use(cookieParser());

  // Protección CSRF para formularios
  if (process.env.NODE_ENV === 'production') {
    app.use(
      csrf({
        cookie: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        },
      })
    );
    console.log('✅ Protección CSRF activada');

    // Middleware para incluir token CSRF en respuestas
    app.use((req, res, next) => {
      res.locals.csrfToken = req.csrfToken ? req.csrfToken() : '';
      next();
    });
  }

  // Log de configuración de seguridad
  console.log(`🔒 Middleware de seguridad configurado en entorno: ${process.env.NODE_ENV}`);
}

module.exports = setupSecurityMiddleware;
