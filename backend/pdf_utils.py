import os
import logging
import re
from typing import List, Dict, Optional
from PyPDF2 import PdfReader
from PyPDF2.errors import PdfReadError

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_path: str) -> List[Dict[str, any]]:
    """
    Extrae texto de un archivo PDF con manejo robusto de errores y metadatos.
    
    Args:
        file_path: Ruta al archivo PDF
        
    Returns:
        Lista de diccionarios con texto por página y metadatos
    """
    try:
        # Validar que el archivo existe
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"El archivo {file_path} no existe")
        
        # Validar que es un archivo PDF
        if not file_path.lower().endswith('.pdf'):
            raise ValueError(f"El archivo {file_path} no es un PDF válido")
        
        reader = PdfReader(file_path)
        
        # Verificar si el PDF está encriptado
        if reader.is_encrypted:
            raise ValueError("El PDF está encriptado y no se puede procesar")
        
        # Extraer metadatos
        metadata = reader.metadata
        title = metadata.get('/Title', 'Sin título') if metadata else 'Sin título'
        author = metadata.get('/Author', 'Autor desconocido') if metadata else 'Autor desconocido'
        
        logger.info(f"Procesando PDF: {title} por {author} - {len(reader.pages)} páginas")
        
        text_by_page = []
        for i, page in enumerate(reader.pages):
            try:
                text = page.extract_text()
                if text and text.strip():
                    # Limpiar y normalizar texto
                    cleaned_text = clean_text(text)
                    if cleaned_text:
                        text_by_page.append({
                            "page": i + 1,
                            "text": cleaned_text,
                            "title": title,
                            "author": author,
                            "char_count": len(cleaned_text)
                        })
                        logger.debug(f"Página {i + 1}: {len(cleaned_text)} caracteres")
                else:
                    logger.warning(f"Página {i + 1}: Sin texto extraíble")
            except Exception as e:
                logger.error(f"Error procesando página {i + 1}: {e}")
                continue
        
        if not text_by_page:
            raise ValueError("No se pudo extraer texto del PDF")
        
        logger.info(f"Extracción completada: {len(text_by_page)} páginas con texto")
        return text_by_page
        
    except PdfReadError as e:
        logger.error(f"Error leyendo PDF {file_path}: {e}")
        raise ValueError(f"El archivo PDF está corrupto o no es válido: {e}")
    except Exception as e:
        logger.error(f"Error inesperado procesando {file_path}: {e}")
        raise

def clean_text(text: str) -> str:
    """
    Limpia y normaliza el texto extraído del PDF.
    
    Args:
        text: Texto crudo del PDF
        
    Returns:
        Texto limpio y normalizado
    """
    if not text:
        return ""
    
    # Eliminar caracteres de control excepto saltos de línea
    text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    
    # Normalizar espacios y saltos de línea
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r' +', ' ', text)
    
    # Eliminar líneas vacías múltiples
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    
    # Eliminar espacios al inicio y final
    text = text.strip()
    
    return text

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """
    Divide el texto en chunks inteligentes respetando la estructura natural.
    
    Args:
        text: Texto a dividir
        chunk_size: Tamaño máximo del chunk
        overlap: Superposición entre chunks
        
    Returns:
        Lista de chunks de texto
    """
    if not text or len(text) <= chunk_size:
        return [text] if text else []
    
    # Dividir por párrafos primero
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""
    
    for paragraph in paragraphs:
        # Si el párrafo es muy largo, dividirlo
        if len(paragraph) > chunk_size:
            if current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = ""
            
            # Dividir párrafo largo
            sub_chunks = split_long_paragraph(paragraph, chunk_size, overlap)
            chunks.extend(sub_chunks)
        else:
            # Verificar si agregar este párrafo excede el límite
            if len(current_chunk + "\n\n" + paragraph) <= chunk_size:
                current_chunk += ("\n\n" + paragraph) if current_chunk else paragraph
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = paragraph
    
    # Agregar el último chunk
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    # Aplicar overlap entre chunks
    if len(chunks) > 1 and overlap > 0:
        chunks = apply_overlap(chunks, overlap)
    
    logger.info(f"Texto dividido en {len(chunks)} chunks")
    return chunks

def split_long_paragraph(paragraph: str, chunk_size: int, overlap: int) -> List[str]:
    """
    Divide un párrafo largo en chunks más pequeños.
    """
    chunks = []
    start = 0
    
    while start < len(paragraph):
        end = start + chunk_size
        
        # Intentar cortar en un espacio o puntuación
        if end < len(paragraph):
            # Buscar el último espacio antes del límite
            last_space = paragraph.rfind(' ', start, end)
            if last_space > start:
                end = last_space
        
        chunk = paragraph[start:end].strip()
        if chunk:
            chunks.append(chunk)
        
        start = end - overlap if end < len(paragraph) else end
    
    return chunks

def apply_overlap(chunks: List[str], overlap: int) -> List[str]:
    """
    Aplica superposición entre chunks consecutivos.
    """
    if len(chunks) <= 1:
        return chunks
    
    overlapped_chunks = []
    for i, chunk in enumerate(chunks):
        if i == 0:
            overlapped_chunks.append(chunk)
        else:
            # Agregar parte del chunk anterior al inicio
            prev_chunk = chunks[i-1]
            overlap_text = prev_chunk[-overlap:] if len(prev_chunk) > overlap else prev_chunk
            overlapped_chunks.append(overlap_text + "\n" + chunk)
    
    return overlapped_chunks

def get_pdf_metadata(file_path: str) -> Dict[str, any]:
    """
    Extrae metadatos del PDF sin procesar el contenido completo.
    
    Args:
        file_path: Ruta al archivo PDF
        
    Returns:
        Diccionario con metadatos del PDF
    """
    try:
        reader = PdfReader(file_path)
        metadata = reader.metadata or {}
        
        return {
            "title": metadata.get('/Title', 'Sin título'),
            "author": metadata.get('/Author', 'Autor desconocido'),
            "subject": metadata.get('/Subject', ''),
            "creator": metadata.get('/Creator', ''),
            "producer": metadata.get('/Producer', ''),
            "pages": len(reader.pages),
            "is_encrypted": reader.is_encrypted
        }
    except Exception as e:
        logger.error(f"Error obteniendo metadatos de {file_path}: {e}")
        return {}


