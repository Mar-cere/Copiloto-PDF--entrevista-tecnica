from PyPDF2 import PdfReader

def extract_text_from_pdf(file_path):
    reader = PdfReader(file_path)
    text_by_page = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text:
            text_by_page.append({
                "page": i + 1,
                "text": text.strip()
            })
    return text_by_page

def chunk_text(text, chunk_size=1000, overlap=200):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks


