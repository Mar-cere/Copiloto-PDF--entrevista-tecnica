import os
import uuid

from openai import OpenAI
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.models import PointStruct

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
qdrant = QdrantClient(url="http://localhost:6333")


# --- Embeddings ---
def get_embedding(text: str):
    response = client.embeddings.create(
        model="text-embedding-3-large",
        input=text
    )
    return response.data[0].embedding


# --- Colección ---
def create_collection_if_not_exists(collection_name: str, vector_size: int):
    existing = [c.name for c in qdrant.get_collections().collections]
    if collection_name not in existing:
        qdrant.create_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(
                size=vector_size,
                distance=models.Distance.COSINE
            )
        )
        print(f"Colección '{collection_name}' creada con éxito.")
    else:
        print(f"Colección '{collection_name}' ya existe.")


# --- Guardar Chunks ---
def store_chunks(chunks, collection_name="pdf_chunks", vector_size=3072):
    create_collection_if_not_exists(collection_name, vector_size)

    points = []
    for i, chunk in enumerate(chunks):
        embedding = get_embedding(chunk["chunk"])
        points.append(
            PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding,
                payload={
                    "text": chunk["chunk"],
                    "doc": chunk["doc"],
                    "page": chunk["page"]
                }
            )
        )

    qdrant.upsert(collection_name=collection_name, points=points)
    print(f"Se guardaron {len(points)} chunks en '{collection_name}'.")


# --- Buscar Chunks ---
def search_chunks(query, top_k=5, collection_name="pdf_chunks", pdf_name: str = None):
    # Generar embedding
    embedding = client.embeddings.create(
        model="text-embedding-3-large",
        input=query
    ).data[0].embedding

    # Crear filtro si se especifica pdf_name
    qdrant_filter = None
    if pdf_name:
        qdrant_filter = models.Filter(
            must=[models.FieldCondition(
                key="doc",
                match=models.MatchValue(value=pdf_name)
            )]
        )

    # Buscar en Qdrant
    results = qdrant.search(
        collection_name=collection_name,
        query_vector=embedding,
        limit=top_k,
        query_filter=qdrant_filter
    )

    return [r.payload["text"] for r in results]



# --- Generar Respuesta ---
def generate_answer(question, context_chunks):
    context_text = "\n".join(context_chunks)
    prompt = f"Usa el siguiente contexto para responder la pregunta:\n{context_text}\n\nPregunta: {question}\nRespuesta:"

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )
    return response.choices[0].message.content


# --- Listar PDFs ---
def list_pdfs(collection_name="pdf_chunks"):
    existing = [c.name for c in qdrant.get_collections().collections]
    if collection_name not in existing:
        return []

    points, _ = qdrant.scroll(collection_name=collection_name, limit=10000)
    pdfs = set(p.payload["doc"] for p in points if "doc" in p.payload)
    return list(pdfs)


# --- Eliminar un PDF completo ---
def delete_pdf(pdf_name, collection_name="pdf_chunks"):
    points, _ = qdrant.scroll(collection_name=collection_name, limit=10000)

    ids_to_delete = [p.id for p in points if p.payload.get("doc") == pdf_name]

    if ids_to_delete:
        selector = models.PointIdsList(points=ids_to_delete)
        qdrant.delete(collection_name=collection_name, points_selector=selector)
        print(f"PDF '{pdf_name}' eliminado con {len(ids_to_delete)} chunks")
    else:
        print(f"No se encontró PDF '{pdf_name}' en la colección.")
