import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // tu backend FastAPI
});

export const uploadPDF = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/ingest", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const fetchPDFs = () => api.get("/pdfs");

export const deletePDF = (name) => api.delete(`/delete_pdf/${name}`);

export const chatWithPDF = (message, pdf_name = null) =>
  api.post("/chat", { message, pdf_name });

export const summarizePDF = (pdf_name) =>
  api.get(`/summary/${encodeURIComponent(pdf_name)}`);

export const comparePDFs = (pdfs) =>
  api.post("/compare", { pdfs });

export const classifyPDF = (pdf_name) =>
  api.get(`/classify/${encodeURIComponent(pdf_name)}`);
