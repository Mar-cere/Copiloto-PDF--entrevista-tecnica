#!/bin/bash

echo "🧪 Probando Vite en el contenedor..."

# Detener frontend si está corriendo
docker-compose stop frontend 2>/dev/null || true

# Ejecutar prueba
echo "🔍 Ejecutando prueba de Vite..."
docker-compose run --rm frontend sh -c "
echo '=== Verificando Node.js ==='
node --version
npm --version

echo '=== Verificando directorio ==='
pwd
ls -la

echo '=== Verificando package.json ==='
cat package.json | grep -A 5 -B 5 vite

echo '=== Verificando node_modules ==='
ls -la node_modules | grep vite

echo '=== Verificando Vite ==='
npx vite --version

echo '=== Verificando script dev ==='
npm run dev -- --help
"

echo "✅ Prueba completada"
