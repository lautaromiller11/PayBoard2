/**
 * Script para verificar configuraciones de seguridad en archivos .env
 * Ejecutar con: node scripts/security-check.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Problemas de seguridad a buscar
const securityIssues = [
  { 
    pattern: /JWT_SECRET=("|')?[\w-]{1,20}("|')?/,
    message: 'JWT_SECRET débil (menos de 20 caracteres)',
    solution: 'Ejecuta node scripts/generate-jwt-secret.js para generar un secreto fuerte'
  },
  {
    pattern: /PASSWORD|PASS|SECRET|KEY|TOKEN|SID|AUTH/i,
    subPattern: /("|')?(pass|password|secret|key|token|sid|auth)[\w-]{0,8}("|')?$/i,
    message: 'Credencial potencialmente débil detectada',
    solution: 'Usa credenciales fuertes, al menos 12 caracteres con una mezcla de tipos'
  }
];

// Verifica si los archivos .env están ignorados por git
function checkGitIgnore() {
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    console.error('❌ No se encontró un archivo .gitignore. Deberías crear uno.');
    return false;
  }
  
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const envPatterns = ['.env', '.env.*'];
  const missingPatterns = [];
  
  for (const pattern of envPatterns) {
    if (!gitignoreContent.includes(pattern) && 
        !gitignoreContent.includes(pattern.replace('*', 'development')) && 
        !gitignoreContent.includes(pattern.replace('*', 'production'))) {
      missingPatterns.push(pattern);
    }
  }
  
  if (missingPatterns.length > 0) {
    console.error(`❌ Los siguientes patrones faltan en .gitignore: ${missingPatterns.join(', ')}`);
    console.error('   Esto podría llevar a la exposición de secretos en el repositorio');
    return false;
  }
  
  console.log('✅ Los archivos de entorno están correctamente ignorados en .gitignore');
  return true;
}

// Verifica si hay archivos .env comprometidos en git
function checkGitCommitted() {
  try {
    const trackedFiles = execSync('git ls-files').toString().split('\n');
    const envFiles = trackedFiles.filter(file => file.match(/\.env\.?/));
    
    if (envFiles.length > 0 && !envFiles.every(file => file === '.env.example')) {
      console.error('❌ Los siguientes archivos de entorno están comprometidos en git:');
      envFiles.filter(file => file !== '.env.example').forEach(file => {
        console.error(`   - ${file}`);
      });
      console.error('   Estos archivos deberían eliminarse del repositorio con:');
      console.error('   git rm --cached <archivo> && git commit -m "Remove env files from git"');
      return false;
    }
    
    console.log('✅ No hay archivos de entorno comprometidos en git (excepto .env.example)');
    return true;
  } catch (error) {
    console.error('❌ Error al verificar archivos comprometidos en git:', error.message);
    return false;
  }
}

// Verifica las configuraciones de seguridad en un archivo .env
function checkEnvFile(filePath) {
  console.log(`\n🔍 Analizando ${path.basename(filePath)}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`ℹ️  El archivo ${path.basename(filePath)} no existe. Saltando...`);
    return true;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let issues = 0;
  
  lines.forEach((line, index) => {
    // Ignorar comentarios y líneas vacías
    if (line.trim().startsWith('#') || !line.trim()) return;
    
    // Verificar problemas de seguridad
    securityIssues.forEach(issue => {
      if (line.match(issue.pattern)) {
        // Para patrones que requieren subverificación
        if (issue.subPattern && !line.match(issue.subPattern)) return;
        
        console.error(`❌ Línea ${index + 1}: ${issue.message}`);
        console.error(`   ${line.trim()}`);
        console.error(`   Solución: ${issue.solution}`);
        issues++;
      }
    });
  });
  
  if (issues === 0) {
    console.log(`✅ No se encontraron problemas de seguridad en ${path.basename(filePath)}`);
    return true;
  }
  
  return false;
}

// Ejecutar todas las verificaciones
function runSecurityChecks() {
  console.log('🔒 Iniciando verificación de seguridad para archivos de entorno...\n');
  
  let allPassed = true;
  
  // Verificar .gitignore
  allPassed = checkGitIgnore() && allPassed;
  
  // Verificar archivos comprometidos
  allPassed = checkGitCommitted() && allPassed;
  
  // Verificar archivos .env
  const envFiles = [
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', '.env.development'),
    path.join(__dirname, '..', '.env.production')
  ];
  
  envFiles.forEach(file => {
    allPassed = checkEnvFile(file) && allPassed;
  });
  
  console.log('\n=== Resumen de la verificación de seguridad ===');
  if (allPassed) {
    console.log('✅ Todas las verificaciones de seguridad pasaron correctamente');
  } else {
    console.error('❌ Algunas verificaciones de seguridad fallaron. Por favor, revisa los problemas mencionados.');
  }
}

// Ejecutar
runSecurityChecks();
