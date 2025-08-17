#!/bin/bash

echo "🤖 AUTO-FIX: Solucionando todo automáticamente..."
echo "================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar prerrequisitos
print_status "Verificando prerrequisitos..."

if ! command_exists docker; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command_exists docker-compose; then
    print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

print_success "Docker y Docker Compose están instalados"

# Verificar archivo .env
print_status "Verificando configuración..."

if [ ! -f .env ]; then
    print_warning "Archivo .env no encontrado. Creando desde env.example..."
    cp env.example .env
    print_warning "⚠️  IMPORTANTE: Edita el archivo .env y agrega tu API key de OpenAI"
    print_warning "   OPENAI_API_KEY=tu_api_key_de_openai_aqui"
else
    print_success "Archivo .env encontrado"
fi

# Verificar API key
if grep -q "tu_api_key_de_openai_aqui" .env; then
    print_warning "⚠️  API key de OpenAI no configurada en .env"
    print_warning "   Por favor edita el archivo .env y agrega tu API key real"
else
    print_success "API key de OpenAI configurada"
fi

# Detener todos los contenedores
print_status "Deteniendo contenedores existentes..."
docker-compose down 2>/dev/null || true

# Limpiar imágenes específicas
print_status "Limpiando imágenes anteriores..."
docker rmi -f copiloto-pdf--entrevista-tecnica-backend:latest 2>/dev/null || true
docker rmi -f copiloto-pdf--entrevista-tecnica-frontend:latest 2>/dev/null || true

# Limpiar cache de Docker
print_status "Limpiando cache de Docker..."
docker system prune -f

# Reconstruir todo sin cache
print_status "Reconstruyendo todas las imágenes..."
docker-compose build --no-cache

# Verificar si la reconstrucción fue exitosa
if [ $? -ne 0 ]; then
    print_error "Error durante la reconstrucción. Intentando solución alternativa..."
    
    # Solución alternativa: reconstruir paso a paso
    print_status "Reconstruyendo backend..."
    docker-compose build --no-cache backend
    
    print_status "Reconstruyendo frontend..."
    docker-compose build --no-cache frontend
fi

# Levantar servicios
print_status "Levantando servicios..."
docker-compose up -d

# Esperar a que los servicios estén listos
print_status "Esperando que los servicios estén listos..."
sleep 15

# Verificar estado de los contenedores
print_status "Verificando estado de los contenedores..."
docker-compose ps

# Verificar logs para detectar problemas
print_status "Analizando logs..."

# Verificar backend
BACKEND_LOGS=$(docker-compose logs --tail=5 backend 2>&1)
if echo "$BACKEND_LOGS" | grep -q "Application startup complete"; then
    print_success "✅ Backend funcionando correctamente"
else
    print_warning "⚠️  Backend puede tener problemas"
    echo "$BACKEND_LOGS"
fi

# Verificar frontend
FRONTEND_LOGS=$(docker-compose logs --tail=5 frontend 2>&1)
if echo "$FRONTEND_LOGS" | grep -q "Local:"; then
    print_success "✅ Frontend funcionando correctamente"
else
    print_warning "⚠️  Frontend puede tener problemas"
    echo "$FRONTEND_LOGS"
fi

# Verificar Qdrant
QDRANT_LOGS=$(docker-compose logs --tail=3 qdrant 2>&1)
if echo "$QDRANT_LOGS" | grep -q "Qdrant HTTP listening"; then
    print_success "✅ Qdrant funcionando correctamente"
else
    print_warning "⚠️  Qdrant puede tener problemas"
    echo "$QDRANT_LOGS"
fi

# Verificar puertos
print_status "Verificando puertos..."

check_port() {
    local port=$1
    local service=$2
    if lsof -i :$port >/dev/null 2>&1; then
        print_success "✅ Puerto $port ($service) en uso"
    else
        print_warning "⚠️  Puerto $port ($service) no está en uso"
    fi
}

check_port 3000 "Frontend"
check_port 8000 "Backend"
check_port 6333 "Qdrant"

# Health check del backend
print_status "Realizando health check del backend..."
if command_exists curl; then
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        print_success "✅ Health check del backend exitoso"
    else
        print_warning "⚠️  Health check del backend falló"
    fi
else
    print_warning "⚠️  curl no disponible, saltando health check"
fi

# Resumen final
echo ""
echo "🎉 AUTO-FIX COMPLETADO!"
echo "========================"
echo ""
echo "🌐 URLs de acceso:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Documentación API: http://localhost:8000/docs"
echo "   Qdrant Dashboard: http://localhost:6333/dashboard"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs: docker-compose logs -f"
echo "   Ver estado: docker-compose ps"
echo "   Detener: docker-compose down"
echo "   Reiniciar: docker-compose restart"
echo ""
echo "🔧 Si hay problemas:"
echo "   Diagnóstico: ./debug.sh"
echo "   Limpieza completa: ./clean-and-rebuild.sh"
echo ""

# Verificar si todo está funcionando
ALL_RUNNING=$(docker-compose ps --format "table {{.Name}}\t{{.Status}}" | grep -c "Up")
TOTAL_SERVICES=3

if [ "$ALL_RUNNING" -eq "$TOTAL_SERVICES" ]; then
    print_success "🎉 ¡Todos los servicios están funcionando correctamente!"
else
    print_warning "⚠️  Algunos servicios pueden no estar funcionando correctamente"
    print_status "Ejecuta 'docker-compose logs' para ver más detalles"
fi

echo ""
print_success "✅ AUTO-FIX completado exitosamente!"
