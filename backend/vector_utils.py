import os
import logging
import time
import uuid
from typing import List, Dict, Optional, Any
from datetime import datetime

from openai import OpenAI
from openai.types import CreateEmbeddingResponse
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.models import PointStruct

logger = logging.getLogger(__name__)

# Configuración desde variables de entorno
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))
EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-large")
CHAT_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
VECTOR_SIZE = int(os.getenv("VECTOR_SIZE", "3072"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "30"))

# Inicializar clientes
client = OpenAI(api_key=OPENAI_API_KEY, timeout=REQUEST_TIMEOUT)
qdrant = QdrantClient(url=f"http://{QDRANT_HOST}:{QDRANT_PORT}")

# Cache simple para embeddings
embedding_cache = {}


# --- Embeddings ---
def get_embedding(text: str, use_cache: bool = True) -> List[float]:
    """
    Genera embeddings para un texto con cache y retry logic.
    
    Args:
        text: Texto para generar embedding
        use_cache: Si usar cache de embeddings
        
    Returns:
        Lista de floats representando el embedding
    """
    if not text or not text.strip():
        raise ValueError("El texto no puede estar vacío")
    
    # Verificar cache
    if use_cache and text in embedding_cache:
        logger.debug(f"Embedding encontrado en cache para texto de {len(text)} caracteres")
        return embedding_cache[text]
    
    # Retry logic
    for attempt in range(MAX_RETRIES):
        try:
            logger.debug(f"Generando embedding (intento {attempt + 1}) para texto de {len(text)} caracteres")
            
            response = client.embeddings.create(
                model=EMBEDDING_MODEL,
                input=text
            )
            
            embedding = response.data[0].embedding
            
            # Guardar en cache
            if use_cache:
                embedding_cache[text] = embedding
            
            logger.debug(f"Embedding generado exitosamente")
            return embedding
            
        except Exception as e:
            logger.warning(f"Error generando embedding (intento {attempt + 1}): {e}")
            if attempt == MAX_RETRIES - 1:
                logger.error(f"Falló generación de embedding después de {MAX_RETRIES} intentos")
                raise
            time.sleep(2 ** attempt)  # Exponential backoff

def get_embeddings_batch(texts: List[str], batch_size: int = 10) -> List[List[float]]:
    """
    Genera embeddings para múltiples textos en lotes.
    
    Args:
        texts: Lista de textos
        batch_size: Tamaño del lote
        
    Returns:
        Lista de embeddings
    """
    all_embeddings = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        logger.info(f"Procesando lote {i//batch_size + 1}: {len(batch)} textos")
        
        for text in batch:
            embedding = get_embedding(text)
            all_embeddings.append(embedding)
        
        # Pausa entre lotes para evitar rate limiting
        if i + batch_size < len(texts):
            time.sleep(1)
    
    return all_embeddings


# --- Colección ---
def create_collection_if_not_exists(collection_name: str, vector_size: int = VECTOR_SIZE):
    """
    Crea una colección en Qdrant si no existe.
    
    Args:
        collection_name: Nombre de la colección
        vector_size: Tamaño del vector
    """
    try:
        existing = [c.name for c in qdrant.get_collections().collections]
        if collection_name not in existing:
            qdrant.create_collection(
                collection_name=collection_name,
                vectors_config=models.VectorParams(
                    size=vector_size,
                    distance=models.Distance.COSINE
                )
            )
            logger.info(f"Colección '{collection_name}' creada con éxito.")
        else:
            logger.debug(f"Colección '{collection_name}' ya existe.")
    except Exception as e:
        logger.error(f"Error creando colección '{collection_name}': {e}")
        raise

def get_collection_info(collection_name: str) -> Dict[str, Any]:
    """
    Obtiene información de una colección.
    
    Args:
        collection_name: Nombre de la colección
        
    Returns:
        Diccionario con información de la colección
    """
    try:
        info = qdrant.get_collection(collection_name)
        return {
            "name": info.name,
            "vectors_count": info.vectors_count,
            "points_count": info.points_count,
            "segments_count": info.segments_count,
            "status": info.status
        }
    except Exception as e:
        logger.error(f"Error obteniendo información de colección '{collection_name}': {e}")
        return {}

# --- Guardar Chunks ---
def store_chunks(chunks: List[Dict], collection_name: str = "pdf_chunks", vector_size: int = VECTOR_SIZE):
    """
    Almacena chunks de texto en Qdrant con procesamiento por lotes.
    
    Args:
        chunks: Lista de diccionarios con chunks
        collection_name: Nombre de la colección
        vector_size: Tamaño del vector
    """
    if not chunks:
        logger.warning("No hay chunks para almacenar")
        return
    
    try:
        create_collection_if_not_exists(collection_name, vector_size)
        
        # Procesar en lotes para mejor performance
        batch_size = 50
        total_points = []
        
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            logger.info(f"Procesando lote {i//batch_size + 1}: {len(batch)} chunks")
            
            # Generar embeddings en lote
            texts = [chunk["chunk"] for chunk in batch]
            embeddings = get_embeddings_batch(texts, batch_size=10)
            
            # Crear puntos
            points = []
            for j, (chunk, embedding) in enumerate(zip(batch, embeddings)):
                point = PointStruct(
                    id=str(uuid.uuid4()),
                    vector=embedding,
                    payload={
                        "text": chunk["chunk"],
                        "doc": chunk["doc"],
                        "page": chunk["page"],
                        "title": chunk.get("title", ""),
                        "author": chunk.get("author", ""),
                        "char_count": chunk.get("char_count", 0),
                        "created_at": datetime.now().isoformat()
                    }
                )
                points.append(point)
            
            # Almacenar lote
            qdrant.upsert(collection_name=collection_name, points=points)
            total_points.extend(points)
            
            logger.info(f"Lote {i//batch_size + 1} almacenado: {len(points)} puntos")
        
        logger.info(f"Total de {len(total_points)} chunks almacenados en '{collection_name}'")
        
    except Exception as e:
        logger.error(f"Error almacenando chunks: {e}")
        raise


# --- Buscar Chunks ---
def search_chunks(query: str, top_k: int = 5, collection_name: str = "pdf_chunks", 
                 pdf_name: str = None, min_score: float = 0.7) -> List[str]:
    """
    Busca chunks similares usando embeddings.
    
    Args:
        query: Texto de búsqueda
        top_k: Número máximo de resultados
        collection_name: Nombre de la colección
        pdf_name: Filtrar por PDF específico
        min_score: Score mínimo de similitud
        
    Returns:
        Lista de textos de chunks encontrados
    """
    if not query or not query.strip():
        logger.warning("Query de búsqueda vacía")
        return []
    
    # Verificar que la colección existe
    try:
        existing = [c.name for c in qdrant.get_collections().collections]
        if collection_name not in existing:
            logger.warning(f"Colección '{collection_name}' no existe")
            return []
    except Exception as e:
        logger.error(f"Error verificando colección: {e}")
        return []
    
    # Si solo se especifica pdf_name sin query, obtener chunks aleatorios del PDF
    if not query.strip() and pdf_name:
        logger.info(f"Obteniendo chunks aleatorios del PDF: {pdf_name}")
        try:
            points, _ = qdrant.scroll(collection_name=collection_name, limit=10000)
            pdf_points = [p for p in points if p.payload.get("doc") == pdf_name]
            
            if not pdf_points:
                logger.warning(f"No se encontraron puntos para el PDF: {pdf_name}")
                return []
            
            # Tomar los primeros top_k chunks
            selected_points = pdf_points[:top_k]
            return [p.payload["text"] for p in selected_points]
            
        except Exception as e:
            logger.error(f"Error obteniendo chunks del PDF {pdf_name}: {e}")
            return []
    
    try:
        # Generar embedding para la query
        logger.info(f"Generando embedding para query: '{query[:50]}...'")
        embedding = get_embedding(query.strip())
        
        # Crear filtro si se especifica pdf_name
        qdrant_filter = None
        if pdf_name:
            qdrant_filter = models.Filter(
                must=[models.FieldCondition(
                    key="doc",
                    match=models.MatchValue(value=pdf_name)
                )]
            )
            logger.info(f"Buscando en PDF específico: {pdf_name}")
        
        # Buscar en Qdrant con más resultados para tener opciones de filtrado
        search_limit = max(top_k * 3, 20)  # Buscar al menos 20 resultados
        results = qdrant.search(
            collection_name=collection_name,
            query_vector=embedding,
            limit=search_limit,
            query_filter=qdrant_filter,
            with_payload=True,
            with_vectors=False
        )
        
        if not results:
            logger.warning("No se encontraron resultados en la búsqueda vectorial")
            return []
        
        # Filtrar por score mínimo
        filtered_results = [r for r in results if r.score >= min_score]
        
        # Si no hay resultados con el score mínimo, usar un score más bajo
        if not filtered_results and results:
            logger.info(f"No se encontraron resultados con score >= {min_score}, usando score más bajo")
            lower_score = min_score * 0.7  # Reducir el score en 30%
            filtered_results = [r for r in results if r.score >= lower_score]
        
        # Tomar solo los top_k mejores
        final_results = filtered_results[:top_k]
        
        logger.info(f"Búsqueda completada: {len(final_results)} resultados (score >= {min_score})")
        
        # Verificar que los resultados tienen texto válido
        valid_results = []
        for r in final_results:
            text = r.payload.get("text", "")
            if text and text.strip():
                valid_results.append(text)
        
        return valid_results
        
    except Exception as e:
        logger.error(f"Error en búsqueda: {e}")
        return []

def search_chunks_hybrid(query: str, top_k: int = 5, collection_name: str = "pdf_chunks",
                        pdf_name: str = None, text_weight: float = 0.3) -> List[Dict[str, Any]]:
    """
    Búsqueda híbrida combinando embeddings y búsqueda de texto.
    
    Args:
        query: Texto de búsqueda
        top_k: Número máximo de resultados
        collection_name: Nombre de la colección
        pdf_name: Filtrar por PDF específico
        text_weight: Peso para búsqueda de texto (0-1)
        
    Returns:
        Lista de diccionarios con resultados y metadatos
    """
    try:
        # Búsqueda por embeddings
        embedding_results = search_chunks(query, top_k, collection_name, pdf_name)
        
        # Búsqueda por texto (simulada - en una implementación real usarías un índice de texto)
        text_results = search_by_text(query, top_k, collection_name, pdf_name)
        
        # Combinar resultados
        combined_results = []
        
        # Agregar resultados de embeddings
        for i, text in enumerate(embedding_results):
            combined_results.append({
                "text": text,
                "score": 1.0 - (i * 0.1),  # Score decreciente
                "method": "embedding"
            })
        
        # Agregar resultados de texto
        for i, text in enumerate(text_results):
            if text not in [r["text"] for r in combined_results]:
                combined_results.append({
                    "text": text,
                    "score": text_weight * (1.0 - (i * 0.1)),
                    "method": "text"
                })
        
        # Ordenar por score y tomar top_k
        combined_results.sort(key=lambda x: x["score"], reverse=True)
        final_results = combined_results[:top_k]
        
        logger.info(f"Búsqueda híbrida completada: {len(final_results)} resultados")
        return final_results
        
    except Exception as e:
        logger.error(f"Error en búsqueda híbrida: {e}")
        return []

def search_by_text(query: str, top_k: int, collection_name: str, pdf_name: str = None) -> List[str]:
    """
    Búsqueda simple por texto (placeholder para implementación futura).
    """
    # Esta es una implementación básica. En producción podrías usar:
    # - Elasticsearch
    # - PostgreSQL con full-text search
    # - Qdrant con payload index
    try:
        # Obtener todos los puntos y filtrar por texto
        points, _ = qdrant.scroll(collection_name=collection_name, limit=10000)
        
        # Filtrar por PDF si se especifica
        if pdf_name:
            points = [p for p in points if p.payload.get("doc") == pdf_name]
        
        # Búsqueda simple por palabras clave
        query_words = query.lower().split()
        results = []
        
        for point in points:
            text = point.payload.get("text", "").lower()
            score = sum(1 for word in query_words if word in text)
            if score > 0:
                results.append((point.payload["text"], score))
        
        # Ordenar por score y tomar top_k
        results.sort(key=lambda x: x[1], reverse=True)
        return [text for text, score in results[:top_k]]
        
    except Exception as e:
        logger.error(f"Error en búsqueda por texto: {e}")
        return []

def get_pdf_chunks(pdf_name: str, top_k: int = 10, collection_name: str = "pdf_chunks") -> List[str]:
    """
    Obtiene chunks de un PDF específico sin necesidad de query.
    
    Args:
        pdf_name: Nombre del PDF
        top_k: Número máximo de chunks a retornar
        collection_name: Nombre de la colección
        
    Returns:
        Lista de chunks del PDF
    """
    try:
        points, _ = qdrant.scroll(collection_name=collection_name, limit=10000)
        pdf_points = [p for p in points if p.payload.get("doc") == pdf_name]
        
        if not pdf_points:
            logger.warning(f"No se encontraron chunks para el PDF: {pdf_name}")
            return []
        
        # Ordenar por página para mantener orden lógico
        pdf_points.sort(key=lambda p: p.payload.get("page", 0))
        
        # Tomar los primeros top_k chunks
        selected_points = pdf_points[:top_k]
        chunks = [p.payload["text"] for p in selected_points]
        
        logger.info(f"Obtenidos {len(chunks)} chunks del PDF: {pdf_name}")
        return chunks
        
    except Exception as e:
        logger.error(f"Error obteniendo chunks del PDF {pdf_name}: {e}")
        return []



# --- Generar Respuesta ---
def generate_answer(question: str, context_chunks: List[str], 
                   model: str = CHAT_MODEL, temperature: float = 0.2) -> str:
    """
    Genera una respuesta usando IA basada en chunks de contexto.
    
    Args:
        question: Pregunta del usuario
        context_chunks: Lista de chunks de contexto
        model: Modelo de IA a usar
        temperature: Temperatura para la generación
        
    Returns:
        Respuesta generada por la IA
    """
    if not question or not question.strip():
        raise ValueError("La pregunta no puede estar vacía")
    
    if not context_chunks:
        return "No tengo suficiente información para responder tu pregunta."
    
    # Filtrar chunks vacíos o muy cortos
    valid_chunks = [chunk for chunk in context_chunks if chunk and len(chunk.strip()) > 10]
    if not valid_chunks:
        return "No encontré información útil en los documentos para responder tu pregunta."
    
    try:
        # Limitar el contexto para evitar tokens excesivos
        max_context_length = 8000  # Aproximadamente 2000 palabras
        context_text = "\n".join(valid_chunks)
        
        if len(context_text) > max_context_length:
            # Truncar contexto manteniendo los chunks más relevantes
            context_text = context_text[:max_context_length] + "..."
            logger.warning(f"Contexto truncado a {max_context_length} caracteres")
        
        # Prompts optimizados según el tipo de pregunta
        if "resumen" in question.lower() or "resume" in question.lower():
            system_prompt = "Eres un asistente experto en crear resúmenes claros y concisos. Responde de manera estructurada y fácil de entender."
        elif "comparar" in question.lower() or "diferencias" in question.lower():
            system_prompt = "Eres un asistente experto en análisis comparativo. Identifica similitudes y diferencias de manera clara y estructurada."
        elif "clasificar" in question.lower() or "temas" in question.lower():
            system_prompt = "Eres un asistente experto en clasificación y categorización. Organiza la información en temas claros y específicos."
        else:
            system_prompt = "Eres un asistente experto en análisis de documentos. Responde de manera clara, precisa y basada en el contexto proporcionado."
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Contexto:\n{context_text}\n\nPregunta: {question}\n\nResponde de manera clara y estructurada:"}
        ]
        
        logger.info(f"Generando respuesta con modelo {model} para pregunta de {len(question)} caracteres")
        
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=1000
        )
        
        answer = response.choices[0].message.content
        logger.info(f"Respuesta generada exitosamente: {len(answer)} caracteres")
        
        return answer
        
    except Exception as e:
        logger.error(f"Error generando respuesta: {e}")
        return "Lo siento, hubo un error generando la respuesta. Por favor, intenta de nuevo."

def generate_answer_stream(question: str, context_chunks: List[str], 
                          model: str = CHAT_MODEL, temperature: float = 0.2):
    """
    Genera una respuesta en streaming (para implementación futura).
    """
    # Placeholder para implementación de streaming
    answer = generate_answer(question, context_chunks, model, temperature)
    yield answer


# --- Listar PDFs ---
def list_pdfs(collection_name: str = "pdf_chunks") -> List[str]:
    """
    Lista todos los PDFs disponibles en la colección.
    
    Args:
        collection_name: Nombre de la colección
        
    Returns:
        Lista de nombres de PDFs
    """
    try:
        existing = [c.name for c in qdrant.get_collections().collections]
        if collection_name not in existing:
            logger.warning(f"Colección '{collection_name}' no existe")
            return []

        points, _ = qdrant.scroll(collection_name=collection_name, limit=10000)
        pdfs = set(p.payload["doc"] for p in points if "doc" in p.payload)
        
        pdf_list = list(pdfs)
        logger.info(f"PDFs encontrados: {len(pdf_list)}")
        return pdf_list
        
    except Exception as e:
        logger.error(f"Error listando PDFs: {e}")
        return []

def get_pdf_info(pdf_name: str, collection_name: str = "pdf_chunks") -> Dict[str, Any]:
    """
    Obtiene información detallada de un PDF específico.
    
    Args:
        pdf_name: Nombre del PDF
        collection_name: Nombre de la colección
        
    Returns:
        Diccionario con información del PDF
    """
    try:
        points, _ = qdrant.scroll(collection_name=collection_name, limit=10000)
        pdf_points = [p for p in points if p.payload.get("doc") == pdf_name]
        
        if not pdf_points:
            return {}
        
        # Calcular estadísticas
        total_chunks = len(pdf_points)
        total_chars = sum(p.payload.get("char_count", 0) for p in pdf_points)
        pages = set(p.payload.get("page", 0) for p in pdf_points)
        
        # Obtener metadatos del primer punto
        first_point = pdf_points[0]
        
        return {
            "name": pdf_name,
            "title": first_point.payload.get("title", ""),
            "author": first_point.payload.get("author", ""),
            "total_chunks": total_chunks,
            "total_pages": len(pages),
            "total_characters": total_chars,
            "created_at": first_point.payload.get("created_at", ""),
            "pages": sorted(list(pages))
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo información de PDF {pdf_name}: {e}")
        return {}

# --- Eliminar un PDF completo ---
def delete_pdf(pdf_name: str, collection_name: str = "pdf_chunks") -> bool:
    """
    Elimina un PDF completo de la colección.
    
    Args:
        pdf_name: Nombre del PDF a eliminar
        collection_name: Nombre de la colección
        
    Returns:
        True si se eliminó exitosamente, False si no se encontró
    """
    if not pdf_name:
        logger.warning("Nombre de PDF no proporcionado")
        return False
    
    try:
        points, _ = qdrant.scroll(collection_name=collection_name, limit=10000)
        ids_to_delete = [p.id for p in points if p.payload.get("doc") == pdf_name]

        if ids_to_delete:
            selector = models.PointIdsList(points=ids_to_delete)
            qdrant.delete(collection_name=collection_name, points_selector=selector)
            logger.info(f"PDF '{pdf_name}' eliminado con {len(ids_to_delete)} chunks")
            return True
        else:
            logger.warning(f"No se encontró PDF '{pdf_name}' en la colección")
            return False
            
    except Exception as e:
        logger.error(f"Error eliminando PDF {pdf_name}: {e}")
        return False

# --- Métricas y Analytics ---
def get_usage_metrics(collection_name: str = "pdf_chunks") -> Dict[str, Any]:
    """
    Obtiene métricas de uso del sistema.
    
    Args:
        collection_name: Nombre de la colección
        
    Returns:
        Diccionario con métricas
    """
    try:
        info = get_collection_info(collection_name)
        pdfs = list_pdfs(collection_name)
        
        # Calcular estadísticas por PDF
        pdf_stats = []
        total_chunks = 0
        total_chars = 0
        
        for pdf_name in pdfs:
            pdf_info = get_pdf_info(pdf_name, collection_name)
            if pdf_info:
                pdf_stats.append(pdf_info)
                total_chunks += pdf_info.get("total_chunks", 0)
                total_chars += pdf_info.get("total_characters", 0)
        
        return {
            "collection_info": info,
            "total_pdfs": len(pdfs),
            "total_chunks": total_chunks,
            "total_characters": total_chars,
            "average_chunks_per_pdf": total_chunks / len(pdfs) if pdfs else 0,
            "pdfs": pdf_stats
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo métricas: {e}")
        return {}

def clear_cache():
    """Limpia el cache de embeddings."""
    global embedding_cache
    cache_size = len(embedding_cache)
    embedding_cache.clear()
    logger.info(f"Cache limpiado: {cache_size} embeddings eliminados")
