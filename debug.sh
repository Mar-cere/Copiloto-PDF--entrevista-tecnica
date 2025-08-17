#!/bin/bash

echo "🔍 Diagnóstico de Copiloto PDF"
echo "================================"

echo ""
echo "📦 Estado de contenedores:"
docker-compose ps

echo ""
echo "📋 Logs del Backend:"
docker-compose logs --tail=20 backend

echo ""
echo "📋 Logs del Frontend:"
docker-compose logs --tail=20 frontend

echo ""
echo "📋 Logs de Qdrant:"
docker-compose logs --tail=10 qdrant

echo ""
echo "🔧 Verificando archivos de configuración:"

echo "✅ Docker Compose:"
if [ -f "docker-compose.yml" ]; then
    echo "   - docker-compose.yml existe"
else
    echo "   ❌ docker-compose.yml no existe"
fi

echo "✅ Variables de entorno:"
if [ -f ".env" ]; then
    echo "   - .env existe"
    if grep -q "tu_api_key_de_openai_aqui" .env; then
        echo "   ⚠️  API key no configurada"
    else
        echo "   ✅ API key configurada"
    fi
else
    echo "   ❌ .env no existe"
fi

echo "✅ Dockerfiles:"
if [ -f "frontend/Dockerfile" ]; then
    echo "   - frontend/Dockerfile existe"
else
    echo "   ❌ frontend/Dockerfile no existe"
fi

if [ -f "backend/Dockerfile" ]; then
    echo "   - backend/Dockerfile existe"
else
    echo "   ❌ backend/Dockerfile no existe"
fi

echo ""
echo "🌐 Verificando puertos:"
echo "   Puerto 3000 (Frontend):"
if lsof -i :3000 >/dev/null 2>&1; then
    echo "   ✅ Puerto 3000 en uso"
else
    echo "   ❌ Puerto 3000 libre"
fi

echo "   Puerto 8000 (Backend):"
if lsof -i :8000 >/dev/null 2>&1; then
    echo "   ✅ Puerto 8000 en uso"
else
    echo "   ❌ Puerto 8000 libre"
fi

echo "   Puerto 6333 (Qdrant):"
if lsof -i :6333 >/dev/null 2>&1; then
    echo "   ✅ Puerto 6333 en uso"
else
    echo "   ❌ Puerto 6333 libre"
fi

echo ""
echo "📊 Uso de recursos:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

echo ""
echo "🔧 Comandos útiles:"
echo "   Limpiar y reconstruir: ./clean-and-rebuild.sh"
echo "   Ver logs en tiempo real: docker-compose logs -f"
echo "   Reiniciar servicios: docker-compose restart"
echo "   Detener todo: docker-compose down"
