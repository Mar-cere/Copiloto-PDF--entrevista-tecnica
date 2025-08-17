#!/bin/bash

echo "🚀 Configurando Copiloto PDF..."
echo "================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Verificar prerrequisitos
print_status "Verificando prerrequisitos..."

if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

print_success "Docker y Docker Compose están instalados"

# Configurar archivo .env
print_status "Configurando variables de entorno..."

if [ ! -f .env ]; then
    print_warning "Creando archivo .env desde env.example..."
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

echo ""
print_status "Limpiando y reconstruyendo contenedores..."

# Detener y limpiar contenedores existentes
print_status "Deteniendo contenedores..."
docker-compose down -v 2>/dev/null || true

# Limpiar imágenes y cache
print_status "Limpiando cache de Docker..."
docker system prune -f 2>/dev/null || true

# Reconstruir con --no-cache
print_status "Reconstruyendo imágenes..."
docker-compose build --no-cache

# Levantar servicios
print_status "Levantando servicios..."
docker-compose up -d

# Esperar a que los servicios estén listos
print_status "Esperando que los servicios estén listos..."
sleep 15

# Verificar estado de los contenedores
print_status "Verificando estado de los servicios..."
if docker-compose ps | grep -q "Up"; then
    print_success "✅ Todos los servicios están ejecutándose"
else
    print_error "❌ Algunos servicios no están ejecutándose"
    print_status "Mostrando logs de error..."
    docker-compose logs --tail=20
    exit 1
fi

echo ""
print_success "✅ Setup completado exitosamente!"
echo ""
print_status "🌐 URLs de acceso:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Documentación API: http://localhost:8000/docs"
echo "   Qdrant Dashboard: http://localhost:6333/dashboard"
echo ""
print_status "📋 Comandos útiles:"
echo "   Ver logs: docker-compose logs -f"
echo "   Detener: docker-compose down"
echo "   Reiniciar: docker-compose restart"
