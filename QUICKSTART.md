# 🚀 Quick Start - Copiloto PDF

## ⚡ Inicio Rápido (5 minutos)

### 1. Prerrequisitos
- Docker y Docker Compose instalados
- API key de OpenAI

### 2. Configuración
```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd copiloto-pdf

# AUTO-FIX: Configuración automática completa
./auto-fix.sh
```

### 3. Configurar API Key
Editar el archivo `.env`:
```bash
OPENAI_API_KEY=sk-tu-api-key-aqui
```

### 4. Levantar la aplicación
```bash
docker-compose up --build
```

### 5. Acceder
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

## 🎯 Uso Básico

1. **Subir PDFs**: Arrastra archivos a la página principal
2. **Chat**: Ve a "Chat" y haz preguntas sobre tus documentos
3. **Resúmenes**: Ve a "Resúmenes" para ver resúmenes automáticos
4. **Comparar**: Selecciona dos documentos para comparar
5. **Clasificar**: Identifica temas en tus documentos

## 🔧 Comandos Útiles

```bash
# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Reiniciar
docker-compose restart

# Limpiar todo
docker-compose down -v
```

## 🆘 Problemas Comunes

### "vite: not found"
```bash
docker-compose build frontend
```

### "OpenAI API Key inválida"
- Verifica tu API key en `.env`
- Asegúrate de tener créditos en OpenAI

### "Qdrant no disponible"
```bash
docker-compose logs qdrant
```

## 📞 Soporte

- Revisa la documentación completa en `README.md`
- Usa `/status` en la API para ver el estado del sistema
- Revisa los logs con `docker-compose logs`
