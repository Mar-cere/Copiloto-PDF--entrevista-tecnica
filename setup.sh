#!/bin/bash

echo "🚀 Configurando Copiloto PDF..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde env.example..."
    cp env.example .env
    echo "⚠️  IMPORTANTE: Edita el archivo .env y agrega tu API key de OpenAI"
    echo "   OPENAI_API_KEY=tu_api_key_de_openai_aqui"
else
    echo "✅ Archivo .env ya existe"
fi

# Verificar si la API key está configurada
if grep -q "tu_api_key_de_openai_aqui" .env; then
    echo "⚠️  ADVERTENCIA: No has configurado tu API key de OpenAI en .env"
    echo "   Por favor edita el archivo .env y agrega tu API key real"
fi

echo ""
echo "🔧 Construyendo y levantando los contenedores..."
echo "   Esto puede tomar varios minutos en la primera ejecución..."

# Construir y levantar los contenedores
docker-compose up --build -d

echo ""
echo "⏳ Esperando que los servicios estén listos..."
sleep 10

# Verificar el estado de los contenedores
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
echo "📋 Comandos útiles:"
echo "   Ver logs: docker-compose logs -f"
echo "   Detener: docker-compose down"
echo "   Reiniciar: docker-compose restart"
echo "   Limpiar todo: docker-compose down -v"

echo ""
echo "✅ Setup completado! 🎉"
