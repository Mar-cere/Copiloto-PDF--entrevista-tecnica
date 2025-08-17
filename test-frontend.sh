#!/bin/bash

echo "🧪 Probando instalación del frontend..."

# Detener contenedor frontend si está corriendo
docker-compose stop frontend

# Construir solo el frontend
echo "🔧 Construyendo frontend..."
docker-compose build --no-cache frontend

# Ejecutar contenedor en modo interactivo para debug
echo "🐛 Ejecutando contenedor en modo debug..."
docker-compose run --rm frontend sh -c "
echo '=== Verificando Node.js ==='
node --version
npm --version

echo '=== Verificando directorio ==='
pwd
ls -la

echo '=== Verificando node_modules ==='
ls -la node_modules | grep vite

echo '=== Verificando Vite ==='
npx vite --version

echo '=== Verificando scripts ==='
npm run dev -- --help
"

echo "✅ Prueba completada"
