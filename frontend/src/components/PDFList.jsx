import { useEffect, useState } from "react";
import { getPDFs, deletePDF, summarizePDF } from "../api/api";

export default function PDFList({ onSelect }) {
  const [pdfs, setPDFs] = useState([]);

  const fetchPDFs = async () => {
    const data = await getPDFs();
    setPDFs(data.pdfs);
  };

  useEffect(() => { fetchPDFs(); }, []);

  const handleDelete = async (name) => {
    await deletePDF(name);
    fetchPDFs();
  };

  const handleSummary = async (name) => {
    const res = await summarizePDF(name);
    alert(res.summary);
  };

  return (
    <div>
      <h3>PDFs disponibles</h3>
      <ul>
        {pdfs.map(pdf => (
          <li key={pdf}>
            {pdf}
            <button onClick={() => onSelect(pdf)}>Seleccionar</button>
            <button onClick={() => handleSummary(pdf)}>Resumen</button>
            <button onClick={() => handleDelete(pdf)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

