# Copiloto PDF - Análisis Inteligente de Documentos

Una aplicación web moderna que permite analizar documentos PDF utilizando inteligencia artificial. La aplicación incluye funcionalidades de chat conversacional, generación de resúmenes, comparación de documentos y clasificación automática de temas.

## 🚀 Características

### ✅ Funcionalidades Principales
- **Subida de hasta 5 PDFs** con límite configurado
- **Extracción, división y vectorización** del contenido
- **Interfaz conversacional** para hacer preguntas sobre los documentos
- **Orquestación estructurada** con arquitectura modular y extensible

### 💡 Funcionalidades Avanzadas
- **Resumen automático** de contenido generado por IA
- **Comparación automática** entre documentos
- **Clasificación por temas** y tópicos
- **Chat contextual** específico por documento

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
git clone https://github.com/tu-usuario/copiloto-pdf.git
cd copiloto-pdf
```

### 2. Configurar Variables de Entorno
Copiar el archivo de ejemplo y configurar las variables:
```bash
cp env.example .env
```

Editar el archivo `.env` y agregar tu API key de OpenAI:
```bash
# OpenAI Configuration
OPENAI_API_KEY=tu_api_key_de_openai_aqui

# Qdrant Configuration
QDRANT_HOST=qdrant
QDRANT_PORT=6333

# Backend Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

# Frontend Configuration
FRONTEND_PORT=3000
```

### 3. Levantar con Docker Compose
```bash
docker-compose up --build
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs

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

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- OpenAI por proporcionar las APIs de IA
- FastAPI por el excelente framework
- React por la biblioteca de interfaz de usuario
- Qdrant por la base de datos vectorial

---

⭐ Si este proyecto te resulta útil, ¡dale una estrella en GitHub!
