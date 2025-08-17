#!/bin/bash

echo "🧹 Limpiando Docker completamente..."

# Detener y eliminar contenedores
echo "📦 Deteniendo contenedores..."
docker-compose down

# Eliminar imágenes específicas
echo "🗑️ Eliminando imágenes..."
docker rmi -f copiloto-pdf--entrevista-tecnica-backend:latest 2>/dev/null || true
docker rmi -f copiloto-pdf--entrevista-tecnica-frontend:latest 2>/dev/null || true

# Limpiar cache de Docker
echo "🧽 Limpiando cache..."
docker system prune -f

# Eliminar volúmenes (opcional, descomenta si quieres empezar desde cero)
# echo "🗑️ Eliminando volúmenes..."
# docker-compose down -v

echo ""
echo "🔧 Reconstruyendo desde cero..."
echo "   Esto puede tomar varios minutos..."

# Reconstruir sin cache
docker-compose build --no-cache

echo ""
echo "🚀 Levantando servicios..."
docker-compose up -d

echo ""
echo "⏳ Esperando que los servicios estén listos..."
sleep 15

# Verificar estado
echo ""
echo "📊 Estado de los contenedores:"
docker-compose ps

echo ""
echo "🌐 URLs de acceso:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Documentación API: http://localhost:8000/docs"
echo "   Qdrant Dashboard: http://localhost:6333/dashboard"

echo ""
echo "📋 Para ver logs:"
echo "   docker-compose logs -f"

echo ""
echo "✅ Limpieza y reconstrucción completada! 🎉"
