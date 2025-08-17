# 🚀 Copiloto PDF - Análisis Inteligente de Documentos

Una aplicación web que permite analizar documentos PDF utilizando inteligencia artificial. Incluye chat conversacional, generación de resúmenes, comparación de documentos y clasificación automática de temas.

## ✨ Características Principales

- **📄 Subida de PDFs** - Hasta 5 documentos (50MB cada uno)
- **🤖 Chat Inteligente** - Pregunta sobre tus documentos
- **📝 Resúmenes Automáticos** - Generados por IA
- **🔍 Comparación de Documentos** - Análisis estructurado
- **🏷️ Clasificación de Temas** - Identificación automática
- **⚡ Búsqueda Semántica** - Encuentra información relevante
- **💾 Cache Inteligente** - Optimiza rendimiento y costos

## 🛠️ Tecnologías

- **Backend**: FastAPI, OpenAI API, Qdrant, PyPDF2
- **Frontend**: React 18, Vite, Axios
- **Infraestructura**: Docker, Docker Compose

## 🚀 Instalación Rápida

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Mar-cere/Copiloto-PDF--entrevista-tecnica
cd Copiloto-PDF--entrevista-tecnica
```

### 2. Configurar API Key
```bash
cp env.example .env
# Editar .env y agregar tu API key de OpenAI
```

### 3. Ejecutar AUTO-FIX
```bash
./auto-fix.sh
```

¡Listo! La aplicación estará disponible en:
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

## 📖 Uso

1. **Subir PDFs** - Arrastra archivos a la página principal
2. **Chat** - Haz preguntas sobre tus documentos
3. **Resúmenes** - Ve a "Resúmenes" para resúmenes automáticos
4. **Comparar** - Selecciona dos documentos para comparar
5. **Clasificar** - Identifica temas en tus documentos

## 🔧 Comandos Útiles

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Detener aplicación
docker-compose down

# Si hay problemas
./auto-fix.sh
```

## 🚨 Solución de Problemas

### Solución Automática (Recomendada)
```bash
./auto-fix.sh
```

### Problemas Comunes
- **"vite: not found"** → `./auto-fix.sh`
- **"OpenAI API Key inválida"** → Verificar `.env`
- **"Qdrant no disponible"** → `docker-compose logs qdrant`

## 📋 Scripts Disponibles

- **`./auto-fix.sh`** - Solución automática completa ⭐
- **`./setup.sh`** - Configuración inicial
- **`./debug.sh`** - Diagnóstico del sistema
- **`./clean-and-rebuild.sh`** - Limpieza completa
- **`./SOLO-EJECUTAR-ESTO.sh`** - Versión con confirmación

## 🏗️ Arquitectura

```
copiloto-pdf/
├── backend/          # FastAPI + OpenAI + Qdrant
├── frontend/         # React + Vite
├── docker-compose.yml
├── auto-fix.sh       # ⭐ Solución automática
└── README.md
```

## 📝 API Endpoints

- **`POST /ingest`** - Subir PDF
- **`POST /chat`** - Chat con IA
- **`GET /summary/{pdf}`** - Resumen
- **`POST /compare`** - Comparar documentos
- **`GET /classify/{pdf}`** - Clasificar temas
- **`GET /health`** - Estado del sistema


## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Marcelo Ull** - [GitHub](https://github.com/Mar-cere

---

⭐ **¿Problemas? Ejecuta `./auto-fix.sh` y todo se solucionará automáticamente.**
