const jwt = require('jsonwebtoken');

// Obtener JWT_SECRET del entorno (con valor de fallback para desarrollo)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt';
// Tiempo de expiración del token (con valor de fallback)
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '8h';

/**
 * Express middleware para verificar JWT y adjuntar usuario a la petición
 * Implementa buenas prácticas de seguridad como:
 * - Verificación estricta del esquema Bearer
 * - Manejo detallado de errores JWT
 * - Validación de roles (opcional)
 */
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Authorization header missing',
      message: 'Se requiere autenticación para acceder a este recurso'
    });
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ 
      error: 'Invalid authorization format',
      message: 'El formato de autorización es inválido. Use: Bearer <token>'
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'], // Algoritmo específico
      maxAge: JWT_EXPIRATION // Verificar tiempo máximo
    });
    
    // Verificar campos obligatorios en el payload
    if (!payload.id || !payload.email) {
      throw new Error('Token payload incomplete');
    }
    
    // Adjuntar información de usuario a la petición
    req.user = { 
      id: payload.id, 
      email: payload.email,
      roles: payload.roles || [],
      iat: payload.iat,
      exp: payload.exp
    };
    
    // Registro de seguridad en entorno de desarrollo
    if (process.env.NODE_ENV !== 'production') {
      console.log(`👤 Usuario autenticado: ${req.user.email} (ID: ${req.user.id})`);
    }
    
    next();
  } catch (err) {
    // Manejo detallado de errores JWT
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'El token ha expirado, por favor inicie sesión nuevamente' 
      });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'El token es inválido' 
      });
    } else {
      console.error('Error de autenticación:', err.message);
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Fallo en la autenticación' 
      });
    }
  }
}

/**
 * Middleware para verificar roles de usuario
 * @param {Array} allowedRoles - Array de roles permitidos
 */
function checkRole(allowedRoles) {
  return (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Se requiere autenticación para acceder a este recurso'
      });
    }

    // Si no se requieren roles específicos, permitir acceso
    if (!allowedRoles || allowedRoles.length === 0) {
      return next();
    }

    // Verificar si el usuario tiene alguno de los roles permitidos
    const userRoles = req.user.roles || [];
    const hasPermission = userRoles.some(role => allowedRoles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'No tiene permisos suficientes para acceder a este recurso'
      });
    }

    next();
  };
}

/**
 * Crear un token JWT para un usuario
 * @param {Object} user - Datos del usuario para incluir en el token
 * @returns {String} Token JWT
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    roles: user.roles || []
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
    algorithm: 'HS256'
  });
}

module.exports = { 
  authenticateJWT, 
  checkRole,
  generateToken,
  JWT_SECRET
};
