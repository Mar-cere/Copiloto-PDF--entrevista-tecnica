# 🚀 Copiloto PDF - Análisis Inteligente de Documentos

Una aplicación web moderna que permite analizar documentos PDF utilizando inteligencia artificial. Incluye chat conversacional, generación de resúmenes, comparación de documentos y clasificación automática de temas.

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

## 🚀 Instalación y Configuración

### Requisitos Previos
- **Docker** y **Docker Compose** instalados
- **Git** para clonar el repositorio
- **Cuenta de OpenAI** con API key válida

### Instalación Rápida

#### 1. Clonar el Repositorio
```bash
git clone https://github.com/Mar-cere/Copiloto-PDF--entrevista-tecnica
cd Copiloto-PDF--entrevista-tecnica
```

#### 2. Configurar Variables de Entorno
```bash
cp env.example .env
# Editar .env y agregar tu API key de OpenAI
# OPENAI_API_KEY=tu_api_key_de_openai_aqui
```

#### 3. Levantar el Entorno
```bash
# Opción A: Setup automático (recomendado)
./setup.sh

# Opción B: Manual
docker-compose up --build
```

### URLs de Acceso
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs
- **Qdrant Dashboard**: http://localhost:6333/dashboard

## 🏗️ Arquitectura del Sistema

### Diagrama de Arquitectura
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Qdrant DB     │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (Vector DB)   │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 6333    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   OpenAI API    │
                       │ (Embeddings &   │
                       │  Text Gen)      │
                       └─────────────────┘
```

### Componentes del Sistema

#### **Frontend (React + Vite)**
- **Tecnología**: React 18, Vite, Axios
- **Responsabilidades**: 
  - Interfaz de usuario
  - Subida de archivos PDF
  - Chat conversacional
  - Visualización de resultados
- **Características**: SPA, responsive.

#### **Backend (FastAPI)**
- **Tecnología**: FastAPI, Python 3.8+
- **Responsabilidades**:
  - API RESTful
  - Procesamiento de PDFs
  - Integración con OpenAI
  - Gestión de base de datos vectorial
- **Características**: Async, auto-documentación, validación automática

#### **Base de Datos Vectorial (Qdrant)**
- **Tecnología**: Qdrant
- **Responsabilidades**:
  - Almacenamiento de embeddings
  - Búsqueda semántica
  - Indexación de chunks de texto
- **Características**: Alta performance, búsqueda híbrida

#### **IA y Procesamiento (OpenAI)**
- **Tecnología**: OpenAI API
- **Responsabilidades**:
  - Generación de embeddings
  - Generación de texto (resúmenes, respuestas)
  - Clasificación de contenido
- **Modelos**: GPT-4o-mini, text-embedding-3-large

## 🎯 Justificación de Elecciones Técnicas

### **Backend: FastAPI**
- **Rendimiento**: Async por defecto, alta concurrencia
- **Documentación**: Auto-generada con Swagger/OpenAPI
- **Validación**: Pydantic para validación automática
- **Desarrollo**: Hot reload, debugging fácil
- **Ecosistema**: Compatible con ML/AI

### **Base de Datos: Qdrant**
- **Búsqueda Semántica**: Optimizado para embeddings
- **Performance**: Escalable, búsqueda rápida
- **Flexibilidad**: Búsqueda híbrida (vector + texto)
- **Simplicidad**: Fácil setup con Docker

### **Frontend: React + Vite**
- **React**: Componentes reutilizables, ecosistema maduro
- **Vite**: Build rápido, hot reload, optimizado
- **Axios**: Cliente HTTP robusto, interceptors

### **Infraestructura: Docker Compose**
- **Portabilidad**: Funciona en cualquier entorno
- **Simplicidad**: Un comando para todo
- **Aislamiento**: Servicios independientes
- **Desarrollo**: Consistente entre entornos

## 🔄 Flujo Conversacional

### **1. Procesamiento de PDF**
```
PDF Upload → Text Extraction → Chunking → Embedding → Storage
     ↓              ↓              ↓           ↓          ↓
  PyPDF2      clean_text()   chunk_text()  OpenAI    Qdrant
```

### **2. Chat Conversacional**
```
User Query → Embedding → Semantic Search → Context Retrieval → AI Response
     ↓           ↓            ↓               ↓              ↓
  Frontend    OpenAI      Qdrant Search   Chunk Filter   GPT-4o-mini
```

### **3. Búsqueda Semántica Mejorada**
- **Score Adaptativo**: Ajusta relevancia automáticamente
- **Fallback**: Si no encuentra resultados, reduce score
- **Context Truncation**: Optimiza tokens para respuesta
- **Hybrid Search**: Combina embeddings + búsqueda de texto

### **4. Generación de Respuestas**
- **System Prompts**: Dinámicos según contexto
- **Context Filtering**: Solo chunks relevantes
- **Token Management**: Optimiza uso de tokens
- **Error Handling**: Respuestas de fallback

## 📊 Limitaciones Actuales

### **Técnicas**
- **Límite de PDFs**: Máximo 5 documentos por instancia
- **Tamaño de archivo**: 50MB por PDF
- **Dependencia externa**: Requiere OpenAI API key
- **Memoria**: Limitada por recursos del contenedor
- **Concurrencia**: No optimizado para múltiples usuarios

### **Funcionales**
- **Idiomas**: Optimizado principalmente para español/inglés
- **Tipos de PDF**: Mejor rendimiento con texto, limitado con imágenes
- **Chat History**: No persistente entre sesiones
- **Exportación**: No permite exportar conversaciones
- **Colaboración**: No soporta múltiples usuarios

### **Costos**
- **OpenAI API**: Costos por token de embeddings y generación
- **Almacenamiento**: Vectores ocupan espacio significativo
- **Procesamiento**: CPU intensivo para chunks grandes

## 🚀 Roadmap y Mejoras Futuras

### **Corto Plazo**
- [ ] **Persistencia de Chat**: Guardar historial de conversaciones
- [ ] **Exportación**: PDF/Word de conversaciones
- [ ] **Múltiples Idiomas**: Soporte para más idiomas
- [ ] **OCR Mejorado**: Mejor extracción de texto de imágenes
- [ ] **Cache Avanzado**: Reducir costos de API

### **Mediano Plazo**
- [ ] **Autenticación**: Sistema de usuarios y permisos
- [ ] **Colaboración**: Múltiples usuarios por proyecto
- [ ] **API Rate Limiting**: Control de uso por usuario
- [ ] **Monitoreo**: Dashboard de métricas y uso
- [ ] **Backup**: Sistema de respaldo automático

### **Largo Plazo**
- [ ] **Escalabilidad**: Kubernetes, microservicios
- [ ] **Modelos Locales**: Alternativas a OpenAI (Llama, Mistral)
- [ ] **Integración**: APIs de terceros (Google Drive, Dropbox)
- [ ] **Mobile App**: Aplicación móvil nativa

### **Mejoras Técnicas**
- [ ] **Vectorización**: Optimización de embeddings
- [ ] **Caching**: Redis para cache distribuido
- [ ] **Queue System**: Celery para tareas asíncronas
- [ ] **Monitoring**: Prometheus + Grafana
- [ ] **CI/CD**: Pipeline automatizado

## 📖 Uso de la Aplicación

### **1. Subir Documentos PDF**
- Navega a la página principal
- Arrastra y suelta archivos PDF o haz clic para seleccionar
- Máximo 5 documentos permitidos (50MB cada uno)

### **2. Chat con IA**
- Ve a la sección "Chat"
- Selecciona un documento específico (opcional)
- Haz preguntas sobre el contenido
- La IA responderá basándose en los documentos

### **3. Generar Resúmenes**
- Ve a "Resúmenes" en el menú
- Haz clic en "Ver Resumen" para cualquier documento
- La IA generará un resumen automático

### **4. Comparar Documentos**
- Ve a "Resúmenes" y selecciona "Comparar Documentos"
- Selecciona dos documentos diferentes
- La IA generará una comparación detallada

### **5. Clasificar Temas**
- En la página de resúmenes, haz clic en "Clasificar"
- La IA identificará temas principales y secundarios

## 🔧 Comandos Útiles

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Detener aplicación
docker-compose down

# Si hay problemas
./setup.sh

# Desarrollo con hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## 🚨 Solución de Problemas

### Solución Automática (Recomendada)
```bash
./setup.sh
```

### Problemas Comunes
- **"vite: not found"** → `./setup.sh`
- **"OpenAI API Key inválida"** → Verificar `.env`
- **"Qdrant no disponible"** → `docker-compose logs qdrant`
- **"No se pueden subir más PDFs"** → Eliminar documentos existentes

## 📋 Scripts Disponibles

- **`./setup.sh`** - Configuración completa y solución automática ⭐

## 📝 API Endpoints

### **Gestión de Documentos**
- **`POST /ingest`** - Subir y procesar PDF
- **`GET /pdfs`** - Listar PDFs disponibles
- **`DELETE /delete_pdf/{pdf_name}`** - Eliminar PDF

### **Análisis y Chat**
- **`POST /chat`** - Chat conversacional con IA
- **`GET /summary/{pdf_name}`** - Generar resumen de PDF
- **`POST /compare`** - Comparar dos documentos
- **`GET /classify/{pdf_name}`** - Clasificar temas de PDF

### **Monitoreo y Debug**
- **`GET /health`** - Estado de salud de la API
- **`GET /status`** - Métricas del sistema
- **`GET /debug/search/{pdf_name}`** - Endpoint de debug

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Marcelo Ull** - [GitHub](https://github.com/Mar-cere)
- **Email**: marcelo0.nicolas@gmail.com
- **Celular**: +56934522191

---