#!/bin/bash

echo "🔧 Solucionando problema del frontend..."

# Detener contenedor
docker-compose stop frontend

# Eliminar imagen
docker rmi -f copiloto-pdf--entrevista-tecnica-frontend:latest 2>/dev/null || true

# Reconstruir frontend
echo "📦 Reconstruyendo frontend..."
docker-compose build --no-cache frontend

# Levantar frontend
echo "🚀 Levantando frontend..."
docker-compose up -d frontend

# Esperar un momento
sleep 5

# Verificar estado
echo "📊 Estado del frontend:"
docker-compose ps frontend

echo "📋 Logs del frontend:"
docker-compose logs --tail=10 frontend

echo "✅ Frontend solucionado!"
