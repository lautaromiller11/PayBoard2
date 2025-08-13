/**
 * Script para generar un JWT_SECRET seguro
 * Ejecutar con: node scripts/generate-jwt-secret.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Genera una clave segura de 64 caracteres
function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

// Entorno a actualizar (development o production)
const env = process.argv[2] || 'development';
const envFile = path.join(__dirname, '..', `.env.${env}`);

// Verifica si el archivo existe
if (!fs.existsSync(envFile)) {
  console.error(`El archivo .env.${env} no existe. Crea el archivo primero.`);
  process.exit(1);
}

// Lee el contenido actual
let envContent = fs.readFileSync(envFile, 'utf8');

// Genera el nuevo secreto
const newSecret = generateSecureSecret();

// Reemplaza el JWT_SECRET existente o añade uno nuevo
if (envContent.includes('JWT_SECRET=')) {
  envContent = envContent.replace(/JWT_SECRET=.*$/m, `JWT_SECRET="${newSecret}"`);
} else {
  envContent += `\nJWT_SECRET="${newSecret}"\n`;
}

// Guarda el archivo actualizado
fs.writeFileSync(envFile, envContent);

console.log(`✅ JWT_SECRET seguro generado y actualizado en .env.${env}`);
console.log('🔒 Por favor, asegúrate de mantener este secreto seguro y nunca compartirlo');
console.log('ℹ️  Para actualizar el otro entorno, ejecuta:');
console.log(`   node scripts/generate-jwt-secret.js ${env === 'development' ? 'production' : 'development'}`);
