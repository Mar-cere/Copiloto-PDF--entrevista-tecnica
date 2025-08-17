from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from pdf_utils import extract_text_from_pdf, chunk_text
from vector_utils import (
    store_chunks, 
    search_chunks, 
    generate_answer, 
    create_collection_if_not_exists,
    list_pdfs,
    delete_pdf
)

app = FastAPI(title="Copiloto PDF API")

VECTOR_SIZE = 3072
MAX_PDFS = 5  # límite de PDFs permitidos

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

class CompareRequest(BaseModel):
    pdfs: List[str]  # Se envían 2 PDFs para comparar

# ----------------- ENDPOINTS EXISTENTES -----------------
@app.get("/")
def root():
    return {"message": "API funcionando"}

@app.post("/chat")
def chat_contextual(req: ChatRequest):
    # Validar si se busca en un PDF específico
    if req.pdf_name:
        existing_pdfs = list_pdfs()
        if req.pdf_name not in existing_pdfs:
            raise HTTPException(
                status_code=404, 
                detail=f"El PDF '{req.pdf_name}' no existe en la base de datos"
            )
        chunks = search_chunks(req.message, pdf_name=req.pdf_name)
    else:
        chunks = search_chunks(req.message)
    
    answer = generate_answer(req.message, chunks)
    
    return {
        "user_message": req.message,
        "pdf_used": req.pdf_name if req.pdf_name else "todos",
        "bot_response": answer
    }

@app.post("/ingest")
async def ingest_pdf(file: UploadFile = File(...)):
    existing_pdfs = list_pdfs()
    if len(existing_pdfs) >= MAX_PDFS:
        raise HTTPException(
            status_code=400,
            detail=f"Ya hay {MAX_PDFS} PDFs cargados. Elimina uno antes de subir otro."
        )
    
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    
    pages = extract_text_from_pdf(temp_path)
    all_chunks = []
    for page in pages:
        chunks = chunk_text(page["text"])
        for c in chunks:
            all_chunks.append({
                "doc": file.filename,
                "page": page["page"],
                "chunk": c
            })
    
    create_collection_if_not_exists("pdf_chunks", VECTOR_SIZE)
    store_chunks(all_chunks)
    
    return {
        "filename": file.filename,
        "num_chunks": len(all_chunks),
        "message": "PDF procesado y chunks guardados en Qdrant"
    }

@app.get("/pdfs")
def get_pdfs():
    return {"pdfs": list_pdfs()}

@app.delete("/delete_pdf/{pdf_name}")
def delete_pdf_endpoint(pdf_name: str):
    deleted = delete_pdf(pdf_name)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"PDF '{pdf_name}' no encontrado")
    return {"message": f"PDF '{pdf_name}' eliminado correctamente"}

# ----------------- FUNCIONALIDADES OPCIONALES -----------------
@app.get("/summary/{pdf_name}")
def summarize_pdf(pdf_name: str):
    chunks = search_chunks("", pdf_name=pdf_name)
    if not chunks:
        raise HTTPException(status_code=404, detail="PDF no encontrado")
    full_text = " ".join(chunks)
    summary = generate_answer(f"Resume el siguiente documento:", [full_text])
    return {"pdf": pdf_name, "summary": summary}

@app.post("/compare")
def compare_pdfs(req: CompareRequest):
    if len(req.pdfs) != 2:
        raise HTTPException(status_code=400, detail="Debes enviar exactamente 2 PDFs")
    
    chunks_a = search_chunks("", pdf_name=req.pdfs[0])
    chunks_b = search_chunks("", pdf_name=req.pdfs[1])
    
    if not chunks_a or not chunks_b:
        raise HTTPException(status_code=404, detail="Uno de los PDFs no existe")
    
    text_a = " ".join(chunks_a)
    text_b = " ".join(chunks_b)
    
    comparison = generate_answer(
        f"Documento 1 ({req.pdfs[0]}):\n{text_a}\n\n"
        f"Documento 2 ({req.pdfs[1]}):\n{text_b}\n\n"
        "Compara ambos documentos resaltando diferencias y similitudes.",
        []
    )
    return {"comparison": comparison}

@app.get("/classify/{pdf_name}")
def classify_pdf(pdf_name: str):
    chunks = search_chunks("", pdf_name=pdf_name)
    if not chunks:
        raise HTTPException(status_code=404, detail="PDF no encontrado")
    
    topics = []
    for c in chunks:
        topic = generate_answer(
            "Clasifica el siguiente texto en un tema principal y uno secundario:",
            [c]
        )
        topics.append(topic)
    
    return {"pdf": pdf_name, "topics": topics}
