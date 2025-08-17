import os
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator
from typing import Optional, List
import tempfile
import shutil
from pdf_utils import extract_text_from_pdf, chunk_text
from vector_utils import (
    store_chunks, 
    search_chunks, 
    generate_answer, 
    create_collection_if_not_exists,
    list_pdfs,
    delete_pdf,
    get_pdf_chunks,
    get_collection_info
)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Copiloto PDF API",
    description="API para análisis inteligente de documentos PDF usando IA",
    version="1.0.0"
)

# Configuración desde variables de entorno
VECTOR_SIZE = int(os.getenv("VECTOR_SIZE", "3072"))
MAX_PDFS = int(os.getenv("MAX_PDFS", "5"))
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "52428800"))  # 50MB por defecto

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- MODELOS -----------------
class ChatRequest(BaseModel):
    message: str
    pdf_name: Optional[str] = None
    
    @validator('message')
    def validate_message(cls, v):
        if not v.strip():
            raise ValueError('El mensaje no puede estar vacío')
        if len(v) > 1000:
            raise ValueError('El mensaje no puede exceder 1000 caracteres')
        return v.strip()

class CompareRequest(BaseModel):
    pdfs: List[str]
    
    @validator('pdfs')
    def validate_pdfs(cls, v):
        if len(v) != 2:
            raise ValueError('Debes enviar exactamente 2 PDFs')
        if v[0] == v[1]:
            raise ValueError('Los PDFs deben ser diferentes')
        return v

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str

# ----------------- ENDPOINTS EXISTENTES -----------------
@app.get("/", tags=["Información"])
def root():
    return {
        "message": "Copiloto PDF API funcionando",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", response_model=HealthResponse, tags=["Sistema"])
def health_check():
    """Endpoint para verificar el estado de la API"""
    from datetime import datetime
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.now().isoformat()
    )

@app.get("/status", tags=["Sistema"])
def get_status():
    """Obtener información del estado del sistema"""
    try:
        pdfs = list_pdfs()
        collection_info = get_collection_info("pdf_chunks")
        return {
            "status": "operational",
            "pdfs_count": len(pdfs),
            "max_pdfs": MAX_PDFS,
            "vector_size": VECTOR_SIZE,
            "available_pdfs": pdfs,
            "collection_info": collection_info
        }
    except Exception as e:
        logger.error(f"Error obteniendo estado: {e}")
        return {
            "status": "error",
            "error": str(e)
        }

@app.get("/debug/search/{pdf_name}", tags=["Debug"])
def debug_search(pdf_name: str, query: str = "test"):
    """Endpoint de debug para probar búsquedas"""
    try:
        # Verificar si el PDF existe
        existing_pdfs = list_pdfs()
        if pdf_name not in existing_pdfs:
            return {
                "error": f"PDF '{pdf_name}' no encontrado",
                "available_pdfs": existing_pdfs
            }
        
        # Probar búsqueda
        chunks = search_chunks(query, pdf_name=pdf_name, top_k=5, min_score=0.5)
        
        return {
            "pdf_name": pdf_name,
            "query": query,
            "chunks_found": len(chunks),
            "chunks": chunks[:2] if chunks else [],  # Solo mostrar los primeros 2
            "collection_info": get_collection_info("pdf_chunks")
        }
        
    except Exception as e:
        logger.error(f"Error en debug search: {e}")
        return {
            "error": str(e),
            "pdf_name": pdf_name,
            "query": query
        }

@app.post("/chat", tags=["Chat"])
def chat_contextual(req: ChatRequest):
    """Chat contextual con los PDFs cargados"""
    try:
        # Validar que hay PDFs disponibles
        existing_pdfs = list_pdfs()
        if not existing_pdfs:
            return {
                "user_message": req.message,
                "pdf_used": "ninguno",
                "bot_response": "No hay documentos cargados. Por favor, sube algunos PDFs primero.",
                "chunks_used": 0
            }
        
        # Validar si se busca en un PDF específico
        if req.pdf_name:
            if req.pdf_name not in existing_pdfs:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, 
                    detail=f"El PDF '{req.pdf_name}' no existe en la base de datos"
                )
            
            # Buscar en PDF específico con score más bajo para obtener más resultados
            chunks = search_chunks(req.message, pdf_name=req.pdf_name, top_k=8, min_score=0.5)
            logger.info(f"Chat con PDF específico: {req.pdf_name} - {len(chunks)} chunks encontrados")
        else:
            # Buscar en todos los PDFs
            chunks = search_chunks(req.message, top_k=10, min_score=0.6)
            logger.info(f"Chat con todos los PDFs - {len(chunks)} chunks encontrados")
        
        if not chunks:
            # Si no se encontraron chunks relevantes, intentar con score más bajo
            logger.info("No se encontraron chunks relevantes, intentando con score más bajo")
            if req.pdf_name:
                chunks = search_chunks(req.message, pdf_name=req.pdf_name, top_k=5, min_score=0.3)
            else:
                chunks = search_chunks(req.message, top_k=8, min_score=0.4)
            
            if not chunks:
                return {
                    "user_message": req.message,
                    "pdf_used": req.pdf_name if req.pdf_name else "todos",
                    "bot_response": "No encontré información relevante en los documentos para responder tu pregunta. Intenta reformular tu pregunta o especificar un documento específico.",
                    "chunks_used": 0
                }
        
        # Generar respuesta
        answer = generate_answer(req.message, chunks)
        
        return {
            "user_message": req.message,
            "pdf_used": req.pdf_name if req.pdf_name else "todos",
            "bot_response": answer,
            "chunks_used": len(chunks),
            "available_pdfs": existing_pdfs
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@app.post("/ingest", tags=["Documentos"])
async def ingest_pdf(file: UploadFile = File(...)):
    """Subir y procesar un archivo PDF"""
    temp_file = None
    
    try:
        # Validaciones del archivo
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nombre de archivo requerido"
            )
        
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Solo se permiten archivos PDF"
            )
        
        # Verificar tamaño del archivo
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"El archivo excede el tamaño máximo de {MAX_FILE_SIZE // 1024 // 1024}MB. Tamaño actual: {len(file_content) // 1024 // 1024}MB"
            )
        
        # Verificar límite de PDFs
        existing_pdfs = list_pdfs()
        if len(existing_pdfs) >= MAX_PDFS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya hay {MAX_PDFS} PDFs cargados. Elimina uno antes de subir otro."
            )
        
        # Verificar si el PDF ya existe
        if file.filename in existing_pdfs:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El PDF '{file.filename}' ya existe en la base de datos"
            )
        
        # Crear archivo temporal
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        temp_file.write(file_content)
        temp_file.close()
        
        logger.info(f"Procesando PDF: {file.filename}")
        
        # Extraer texto del PDF
        pages = extract_text_from_pdf(temp_file.name)
        if not pages:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo extraer texto del PDF. Verifica que el archivo no esté corrupto."
            )
        
        # Crear chunks
        all_chunks = []
        for page in pages:
            chunks = chunk_text(page["text"])
            for c in chunks:
                all_chunks.append({
                    "doc": file.filename,
                    "page": page["page"],
                    "chunk": c
                })
        
        # Guardar en Qdrant
        create_collection_if_not_exists("pdf_chunks", VECTOR_SIZE)
        store_chunks(all_chunks)
        
        logger.info(f"PDF procesado exitosamente: {file.filename} - {len(all_chunks)} chunks")
        
        return {
            "filename": file.filename,
            "num_chunks": len(all_chunks),
            "num_pages": len(pages),
            "file_size_mb": round(len(file_content) / 1024 / 1024, 2),
            "message": "PDF procesado y chunks guardados en Qdrant"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error procesando PDF {file.filename}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno procesando el PDF"
        )
    finally:
        # Limpiar archivo temporal
        if temp_file and os.path.exists(temp_file.name):
            try:
                os.unlink(temp_file.name)
            except Exception as e:
                logger.warning(f"No se pudo eliminar archivo temporal: {e}")

@app.get("/pdfs", tags=["Documentos"])
def get_pdfs():
    """Obtener lista de PDFs disponibles"""
    try:
        pdfs = list_pdfs()
        return {
            "pdfs": pdfs,
            "count": len(pdfs),
            "max_pdfs": MAX_PDFS
        }
    except Exception as e:
        logger.error(f"Error obteniendo PDFs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno obteniendo PDFs"
        )

@app.delete("/delete_pdf/{pdf_name}", tags=["Documentos"])
def delete_pdf_endpoint(pdf_name: str):
    """Eliminar un PDF específico"""
    try:
        if not pdf_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nombre del PDF requerido"
            )
        
        deleted = delete_pdf(pdf_name)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"PDF '{pdf_name}' no encontrado"
            )
        
        logger.info(f"PDF eliminado: {pdf_name}")
        return {"message": f"PDF '{pdf_name}' eliminado correctamente"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error eliminando PDF {pdf_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno eliminando el PDF"
        )

# ----------------- FUNCIONALIDADES OPCIONALES -----------------
@app.get("/summary/{pdf_name}", tags=["Análisis"])
def summarize_pdf(pdf_name: str):
    """Generar resumen de un PDF específico"""
    try:
        if not pdf_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nombre del PDF requerido"
            )
        
        # Verificar si el PDF existe
        existing_pdfs = list_pdfs()
        if pdf_name not in existing_pdfs:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"PDF '{pdf_name}' no encontrado en la base de datos"
            )
        
        # Obtener chunks del PDF directamente
        chunks = get_pdf_chunks(pdf_name, top_k=20)
        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"No se encontraron chunks para el PDF '{pdf_name}'"
            )
        
        full_text = " ".join(chunks)
        summary = generate_answer("Resume el siguiente documento de manera clara y concisa:", [full_text])
        
        logger.info(f"Resumen generado para: {pdf_name} - {len(chunks)} chunks usados")
        return {
            "pdf": pdf_name,
            "summary": summary,
            "chunks_used": len(chunks),
            "total_chars": len(full_text)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generando resumen para {pdf_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno generando el resumen"
        )

@app.post("/compare", tags=["Análisis"])
def compare_pdfs(req: CompareRequest):
    """Comparar dos PDFs"""
    try:
        # Verificar si los PDFs existen
        existing_pdfs = list_pdfs()
        if req.pdfs[0] not in existing_pdfs:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"PDF '{req.pdfs[0]}' no existe en la base de datos"
            )
        
        if req.pdfs[1] not in existing_pdfs:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"PDF '{req.pdfs[1]}' no existe en la base de datos"
            )
        
        # Obtener chunks de ambos PDFs directamente
        chunks_a = get_pdf_chunks(req.pdfs[0], top_k=15)
        chunks_b = get_pdf_chunks(req.pdfs[1], top_k=15)
        
        if not chunks_a:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"No se encontraron chunks para el PDF '{req.pdfs[0]}'"
            )
        
        if not chunks_b:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"No se encontraron chunks para el PDF '{req.pdfs[1]}'"
            )
        
        text_a = " ".join(chunks_a)
        text_b = " ".join(chunks_b)
        
        comparison = generate_answer(
            f"Documento 1 ({req.pdfs[0]}):\n{text_a}\n\n"
            f"Documento 2 ({req.pdfs[1]}):\n{text_b}\n\n"
            "Compara ambos documentos resaltando diferencias y similitudes de manera estructurada.",
            []
        )
        
        logger.info(f"Comparación generada entre: {req.pdfs[0]} y {req.pdfs[1]}")
        return {
            "comparison": comparison,
            "pdf1": req.pdfs[0],
            "pdf2": req.pdfs[1],
            "chunks_pdf1": len(chunks_a),
            "chunks_pdf2": len(chunks_b)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparando PDFs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno comparando documentos"
        )

@app.get("/classify/{pdf_name}", tags=["Análisis"])
def classify_pdf(pdf_name: str):
    """Clasificar temas de un PDF específico"""
    try:
        if not pdf_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nombre del PDF requerido"
            )
        
        # Verificar si el PDF existe
        existing_pdfs = list_pdfs()
        if pdf_name not in existing_pdfs:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"PDF '{pdf_name}' no encontrado en la base de datos"
            )
        
        # Obtener chunks del PDF directamente
        chunks = get_pdf_chunks(pdf_name, top_k=10)
        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"No se encontraron chunks para el PDF '{pdf_name}'"
            )
        
        topics = []
        for i, c in enumerate(chunks[:10]):  # Limitar a 10 chunks para evitar costos altos
            topic = generate_answer(
                "Clasifica el siguiente texto en un tema principal y uno secundario. Responde solo con los temas separados por coma:",
                [c]
            )
            topics.append({
                "chunk_index": i + 1,
                "topics": topic
            })
        
        logger.info(f"Clasificación generada para: {pdf_name}")
        return {
            "pdf": pdf_name,
            "topics": topics,
            "chunks_analyzed": len(topics)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error clasificando PDF {pdf_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno clasificando el documento"
        )

# ----------------- MANEJADOR DE EXCEPCIONES GLOBAL -----------------
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Manejador global de excepciones no capturadas"""
    logger.error(f"Excepción no manejada: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Error interno del servidor",
            "type": "internal_error"
        }
    )
