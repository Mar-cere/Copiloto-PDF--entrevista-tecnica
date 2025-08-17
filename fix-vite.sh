#!/bin/bash

echo "🔧 Solucionando problema de Vite..."

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[INFO]${NC} Deteniendo frontend..."
docker-compose stop frontend

echo -e "${BLUE}[INFO]${NC} Eliminando imagen del frontend..."
docker rmi -f copiloto-pdf--entrevista-tecnica-frontend:latest 2>/dev/null || true

echo -e "${BLUE}[INFO]${NC} Reconstruyendo frontend con Vite..."
docker-compose build --no-cache frontend

echo -e "${BLUE}[INFO]${NC} Levantando frontend..."
docker-compose up -d frontend

echo -e "${BLUE}[INFO]${NC} Esperando que el frontend esté listo..."
sleep 10

echo -e "${BLUE}[INFO]${NC} Verificando estado..."
docker-compose ps frontend

echo -e "${BLUE}[INFO]${NC} Últimos logs del frontend:"
docker-compose logs --tail=10 frontend

echo -e "${GREEN}[SUCCESS]${NC} ¡Frontend solucionado!"
echo ""
echo "🌐 Frontend debería estar disponible en: http://localhost:3000"
