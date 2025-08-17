# Copiloto PDF - Análisis Inteligente de Documentos

Una aplicación web que permite analizar documentos PDF utilizando inteligencia artificial. La aplicación incluye funcionalidades de chat conversacional, generación de resúmenes, comparación de documentos y clasificación automática de temas.

## 🚀 Características

### ✅ Funcionalidades Principales
- **Subida de hasta 5 PDFs** con límite configurado (50MB por archivo)
- **Extracción inteligente** con limpieza y normalización de texto
- **Chunking avanzado** que respeta la estructura natural del documento
- **Chat conversacional robusto** con búsqueda semántica mejorada
- **Arquitectura modular** con manejo robusto de errores

### 💡 Funcionalidades Avanzadas
- **Resumen automático** con prompts optimizados por tipo de contenido
- **Comparación inteligente** entre documentos con análisis estructurado
- **Clasificación por temas** con identificación de tópicos principales y secundarios
- **Búsqueda híbrida** combinando embeddings y búsqueda de texto
- **Cache de embeddings** para optimizar rendimiento y costos
- **Métricas y analytics** del sistema y uso de documentos

## 🛠️ Tecnologías Utilizadas

### Backend
- **FastAPI** - Framework web moderno y rápido
- **OpenAI API** - Para embeddings y generación de texto
- **Qdrant** - Base de datos vectorial
- **PyPDF2** - Procesamiento de archivos PDF
- **Python 3.8+**

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **React Router** - Navegación entre páginas
- **Axios** - Cliente HTTP
- **Vite** - Herramienta de construcción
- **JavaScript ES6+**

## 📋 Requisitos Previos

- **Docker** y **Docker Compose** instalados
- **Git** para clonar el repositorio
- **Cuenta de OpenAI** con API key válida

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Mar-cere/Copiloto-PDF--entrevista-tecnica
cd Copiloto-PDF--entrevista-tecnica
```

### 2. Configurar Variables de Entorno
Copiar el archivo de ejemplo y configurar las variables:
```bash
cp env.example .env
```

Editar el archivo `.env` y configurar las variables necesarias:

```bash
# ========================================
# CONFIGURACIÓN REQUERIDA
# ========================================

# OpenAI API Key (REQUERIDO)
OPENAI_API_KEY=tu_api_key_de_openai_aqui

# ========================================
# CONFIGURACIÓN DE SERVICIOS
# ========================================

# Backend Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

# Frontend Configuration
FRONTEND_PORT=3000

# Qdrant Configuration
QDRANT_HOST=qdrant
QDRANT_PORT=6333

# ========================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ========================================

# Límites de la aplicación
MAX_PDFS=5
MAX_FILE_SIZE=52428800  # 50MB en bytes
CHUNK_SIZE=1000

# Configuración de vectores
VECTOR_SIZE=3072

# ========================================
# CONFIGURACIÓN DE OPENAI (OPCIONAL)
# ========================================

# Modelos de OpenAI
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# ========================================
# CONFIGURACIÓN DE RENDIMIENTO (OPCIONAL)
# ========================================

# Reintentos y timeouts
MAX_RETRIES=3
REQUEST_TIMEOUT=30

# ========================================
# CONFIGURACIÓN DE LOGGING (OPCIONAL)
# ========================================

LOG_LEVEL=INFO
```

### 3. Levantar con Docker Compose

#### Opción A: Script automático (Recomendado)
```bash
./setup.sh
```

#### Opción B: Manual
```bash
# Crear archivo .env si no existe
cp env.example .env

# Editar .env y agregar tu API key de OpenAI
# OPENAI_API_KEY=tu_api_key_de_openai_aqui

# Construir y levantar
docker-compose up --build
```

#### Opción C: Desarrollo con Hot Reload
```bash
# Para desarrollo con recarga automática
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs
- **Qdrant Dashboard**: http://localhost:6333/dashboard

## 📖 Uso de la Aplicación

### 1. Subir Documentos PDF
- Navega a la página principal
- Arrastra y suelta archivos PDF o haz clic para seleccionar
- Máximo 5 documentos permitidos

### 2. Chat con IA
- Ve a la sección "Chat"
- Selecciona un documento específico (opcional)
- Haz preguntas sobre el contenido
- La IA responderá basándose en los documentos

### 3. Generar Resúmenes
- Ve a "Resúmenes" en el menú
- Haz clic en "Ver Resumen" para cualquier documento
- La IA generará un resumen automático

### 4. Comparar Documentos
- Desde un resumen, haz clic en "Comparar con otro"
- Selecciona dos documentos diferentes
- Obtén un análisis de similitudes y diferencias

### 5. Clasificar Temas
- En la página de resúmenes, haz clic en "Clasificar"
- La IA identificará temas principales y secundarios

## 🔧 Configuración Avanzada

### Variables de Entorno Adicionales
```bash
# Configuración de OpenAI
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# Configuración de Qdrant
QDRANT_COLLECTION_NAME=pdf_chunks
VECTOR_SIZE=3072

# Configuración de la aplicación
MAX_PDFS=5
CHUNK_SIZE=1000
MAX_FILE_SIZE=52428800  # 50MB

# Configuración de rendimiento
MAX_RETRIES=3
REQUEST_TIMEOUT=30
```

### Endpoints de Monitoreo
- **`/health`** - Estado de salud de la API
- **`/status`** - Información del sistema y métricas
- **`/debug/search/{pdf_name}`** - Endpoint de debug para búsquedas

### Características Técnicas
- **Cache de Embeddings**: Reduce costos y mejora rendimiento
- **Búsqueda Híbrida**: Combina embeddings y búsqueda de texto
- **Score Adaptativo**: Ajusta automáticamente la relevancia
- **Chunking Inteligente**: Respeta la estructura natural del documento
- **Manejo Robusto de Errores**: Logging detallado y recuperación automática

## 🏗️ Arquitectura del Proyecto

```
copiloto-pdf/
├── backend/
│   ├── main.py              # API principal FastAPI
│   ├── pdf_utils.py         # Utilidades para procesar PDFs
│   ├── vector_utils.py      # Manejo de embeddings y Qdrant
│   └── requirements.txt     # Dependencias Python
├── frontend/
│   ├── src/
│   │   ├── pages/           # Páginas principales
│   │   ├── components/      # Componentes reutilizables
│   │   ├── api/            # Cliente API
│   │   └── App.jsx         # Componente principal
│   ├── package.json        # Dependencias Node.js
│   └── vite.config.ts      # Configuración Vite
├── docker-compose.yml      # Configuración Docker
├── Dockerfile.backend      # Imagen del backend
├── Dockerfile.frontend     # Imagen del frontend
└── README.md              # Este archivo
```

## 🔧 Configuración Avanzada

### Variables de Entorno Adicionales
```bash
# Configuración de OpenAI
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_EMBEDDING_MODEL=text-embedding-ada-002

# Configuración de Qdrant
QDRANT_COLLECTION_NAME=pdf_chunks
VECTOR_SIZE=3072

# Configuración de la aplicación
MAX_PDFS=5
CHUNK_SIZE=1000
```

### Desarrollo Local
Para desarrollo sin Docker:

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🐛 Solución de Problemas

### Error: "No se puede conectar a OpenAI"
- Verifica que tu API key sea válida
- Asegúrate de tener créditos en tu cuenta de OpenAI

### Error: "Qdrant no está disponible"
- Verifica que el contenedor de Qdrant esté ejecutándose
- Revisa los logs: `docker-compose logs qdrant`

### Error: "No se pueden subir más PDFs"
- Elimina algunos documentos existentes
- El límite es de 5 PDFs por instancia

### Error: "Query de búsqueda vacía"
- Verifica que estés enviando un mensaje válido
- El sistema ahora maneja mejor las queries vacías

### Error: "No se encontraron chunks relevantes"
- Intenta reformular tu pregunta
- Especifica un documento particular
- El sistema intentará automáticamente con score más bajo

### Error: "OpenAI API Key inválida"
- Verifica que tu API key sea correcta
- Asegúrate de tener créditos en tu cuenta de OpenAI

### Error: "Qdrant no está disponible"
- Verifica que el contenedor de Qdrant esté ejecutándose
- Revisa los logs: `docker-compose logs qdrant`
- Asegúrate de que el puerto 6333 esté disponible

### Debug y Monitoreo
- Usa `/status` para ver el estado del sistema
- Usa `/debug/search/{pdf_name}` para probar búsquedas
- Revisa los logs: `docker-compose logs backend`

### Error: "vite: not found"
- El frontend no puede encontrar Vite
- **Solución**: Reconstruir la imagen: `docker-compose build frontend`

### Error: "TypeError: Client.__init__() got an unexpected keyword argument 'proxies'"
- Problema con la versión de OpenAI client
- **Solución**: Reconstruir la imagen: `docker-compose build backend`

### Error: "OpenAI API Key inválida"
- Verifica que tu API key esté en el archivo `.env`
- Asegúrate de que no tenga espacios extra
- Verifica que tengas créditos en tu cuenta de OpenAI

### Error: "Qdrant no está disponible"
- Verifica que el contenedor de Qdrant esté ejecutándose
- Revisa los logs: `docker-compose logs qdrant`
- Asegúrate de que el puerto 6333 esté disponible

### Limpiar y reconstruir todo
```bash
# Detener y limpiar todo
docker-compose down -v

# Eliminar imágenes
docker rmi copiloto-pdf--entrevista-tecnica-backend copiloto-pdf--entrevista-tecnica-frontend

# Reconstruir desde cero
./setup.sh
```

## 📝 API Endpoints

### Documentos
- `POST /ingest` - Subir PDF
- `GET /pdfs` - Listar PDFs
- `DELETE /delete_pdf/{pdf_name}` - Eliminar PDF

### Chat y Análisis
- `POST /chat` - Chat con IA
- `GET /summary/{pdf_name}` - Generar resumen
- `POST /compare` - Comparar documentos
- `GET /classify/{pdf_name}` - Clasificar temas

## 👨‍💻 Autor

**Tu Nombre**
- Correo: marcelo0.nicolas@gmail.com
- Celular: +56934522191

---
