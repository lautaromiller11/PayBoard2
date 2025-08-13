# Seguridad en PayBoard

Este documento describe las mejores prácticas de seguridad implementadas en PayBoard y cómo se deben mantener durante el desarrollo y despliegue.

## Variables de Entorno Seguras

### Configuración Básica

- Nunca cometas archivos `.env.*` en Git (excepto `.env.example`)
- Usa secretos fuertes para todas las claves (JWT, API, etc.)
- Configura entornos separados para desarrollo y producción

### Scripts de Seguridad

El proyecto incluye scripts útiles para mantener la seguridad:

```bash
# Generar un JWT_SECRET seguro para desarrollo
node scripts/generate-jwt-secret.js development

# Generar un JWT_SECRET seguro para producción
node scripts/generate-jwt-secret.js production

# Verificar la seguridad de los archivos .env
node scripts/security-check.js
```

## Middleware de Seguridad

El backend implementa varias capas de seguridad:

- **Helmet**: Configura cabeceras HTTP seguras
- **Rate Limiting**: Protege contra ataques de fuerza bruta
- **XSS Protection**: Sanitiza entradas para prevenir Cross-Site Scripting
- **CSRF Protection**: Protege contra ataques Cross-Site Request Forgery en producción

## Autenticación y Autorización

- Tokens JWT con algoritmo específico (HS256)
- Expiración configurable de tokens
- Sistema de roles para control de acceso
- Gestión detallada de errores de autenticación

## Configuración de Entornos

### Desarrollo (`.env.development`)

Usado durante el desarrollo local. Contiene:
- URLs locales
- Configuración para el bot de Telegram de desarrollo
- Base de datos de desarrollo
- Opciones de depuración habilitadas

### Producción (`.env.production`)

Usado en el entorno de producción. Contiene:
- URLs de producción
- Configuración para el bot de Telegram de producción
- Base de datos de producción
- Características de seguridad adicionales habilitadas
- Logging limitado

## Despliegue Seguro

Al desplegar en producción:

1. Asegúrate de establecer `NODE_ENV=production`
2. Usa HTTPS para todas las comunicaciones
3. Configura correctamente `CORS_ORIGIN` con tu dominio real
4. Mantén actualizadas todas las dependencias
5. Sigue las alertas de seguridad de GitHub

## Prácticas Generales

- Mantén todas las dependencias actualizadas
- Ejecuta auditorías de seguridad regularmente: `npm audit`
- No almacenes información sensible en el código
- Revisa los logs de producción para actividades sospechosas
