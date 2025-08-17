import { useState } from "react";
import { uploadPDF } from "../api/api";

export default function UploadPDF({ onUpload }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const res = await uploadPDF(file);
    setLoading(false);
    alert(res.message);
    onUpload(); // refrescar lista de PDFs
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} />
      <button type="submit" disabled={loading}>{loading ? "Subiendo..." : "Subir PDF"}</button>
    </form>
  );
}

