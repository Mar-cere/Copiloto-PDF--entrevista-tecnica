// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPDFs, uploadPDF, deletePDF } from "../api/api";
import Header from "../components/Header";

export default function Home() {
  const [pdfs, setPDFs] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const loadPDFs = async () => {
    try {
      setError("");
      const res = await fetchPDFs();
      setPDFs(res.data.pdfs);
    } catch (err) {
      setError("Error al cargar los PDFs");
      console.error(err);
    }
  };

  useEffect(() => {
    loadPDFs();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor selecciona un archivo");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      await uploadPDF(file);
      setFile(null);
      await loadPDFs();
    } catch (err) {
      setError("Error al subir el PDF");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (name) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${name}"?`)) {
      return;
    }
    
    try {
      setError("");
      await deletePDF(name);
      await loadPDFs();
    } catch (err) {
      setError("Error al eliminar el PDF");
      console.error(err);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        setError("Solo se permiten archivos PDF");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Gestiona y Analiza tus PDFs con IA
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sube tus documentos PDF y obtén respuestas inteligentes, resúmenes automáticos 
            y análisis detallados usando inteligencia artificial.
          </p>
        </div>

        {/* Upload Section */}
        <div style={{ backgroundColor: 'rgb(33 41 54)', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden', marginBottom: '32px' }}>
          <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid #374151' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#f9fafb', margin: '0 0 8px 0' }}>Subir Nuevo PDF</h2>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>Arrastra un archivo PDF o haz clic para seleccionar</p>
          </div>
          
          <div style={{ padding: '20px 24px 24px 24px' }}>
            {error && (
              <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#7f1d1d', border: '1px solid #991b1b', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <svg style={{ width: '20px', height: '20px', color: '#fca5a5' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  <span style={{ color: '#fecaca', fontSize: '14px' }}>{error}</span>
                </div>
              </div>
            )}

            <div 
              style={{
                border: '2px dashed',
                borderColor: dragActive ? '#3b82f6' : '#4b5563',
                borderRadius: '10px',
                padding: '32px 24px',
                textAlign: 'center',
                transition: 'all 0.2s',
                backgroundColor: dragActive ? '#1e293b' : '#374151'
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <svg style={{ width: '32px', height: '32px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <label style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '12px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}>
                    Seleccionar archivo PDF
                    <input 
                      type="file" 
                      accept=".pdf"
                      onChange={(e) => setFile(e.target.files[0])} 
                      style={{ display: 'none' }}
                    />
                  </label>
                  
                  {file && (
                    <div style={{ 
                      padding: '12px 16px', 
                      backgroundColor: '#065f46', 
                      border: '1px solid #047857', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px' 
                    }}>
                      <svg style={{ width: '16px', height: '16px', color: '#10b981' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span style={{ color: '#d1fae5', fontWeight: 500, fontSize: '14px' }}>{file.name}</span>
                    </div>
                  )}
                  
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                    Máximo 5 PDFs simultáneos • Solo archivos PDF
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={handleUpload} 
                disabled={loading || !file}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: loading || !file ? '#4b5563' : '#3b82f6',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: loading || !file ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading && file) {
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && file) {
                    e.target.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {loading ? (
                  <>
                    <svg style={{ width: '16px', height: '16px' }} className="animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Subiendo...
                  </>
                ) : (
                  <>
                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Subir PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* PDFs List */}
        <div style={{ backgroundColor: 'rgb(33 41 54)', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid #374151' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#f9fafb', margin: '0 0 8px 0' }}>Documentos PDF</h2>
                <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                  {pdfs.length === 0 
                    ? "No hay documentos cargados" 
                    : `${pdfs.length} documento${pdfs.length !== 1 ? 's' : ''} cargado${pdfs.length !== 1 ? 's' : ''}`
                  }
                </p>
              </div>
              {pdfs.length > 0 && (
                <Link to="/chat" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '10px 16px', 
                  backgroundColor: '#4b5563', 
                  color: '#e5e7eb', 
                  borderRadius: '8px', 
                  textDecoration: 'none', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  transition: 'all 0.2s',
                  border: '1px solid #6b7280'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#6b7280';
                  e.target.style.color = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#4b5563';
                  e.target.style.color = '#e5e7eb';
                }}>
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Ir al Chat
                </Link>
              )}
            </div>
          </div>
          
          <div style={{ padding: '20px 24px 24px 24px' }}>
            {pdfs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                                 <svg style={{ width: '48px', height: '48px', color: '#4b5563', margin: '0 auto 16px auto' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#f9fafb', margin: '0 0 8px 0' }}>No hay documentos</h3>
                <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>Sube tu primer PDF para comenzar a analizarlo con IA</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pdfs.map((pdf) => (
                  <div key={pdf} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '16px 20px', 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151', 
                    borderRadius: '10px', 
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.1)'
                  }} 
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#111827';
                    e.target.style.borderColor = '#4b5563';
                    e.target.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
                  }} 
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#1f2937';
                    e.target.style.borderColor = '#374151';
                    e.target.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.1)';
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                             <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        backgroundColor: '#fef2f2', 
                        borderRadius: '10px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexShrink: 0,
                        border: '1px solid #fecaca'
                      }}>
                         <svg style={{ width: '20px', height: '20px', color: '#dc2626' }} fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                         </svg>
                       </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ 
                          fontWeight: 600, 
                          color: '#f9fafb', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          fontSize: '15px',
                          margin: '0 0 4px 0'
                        }}>{pdf}</h3>
                        <p style={{ 
                          fontSize: '13px', 
                          color: '#9ca3af',
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ 
                            width: '6px', 
                            height: '6px', 
                            backgroundColor: '#10b981', 
                            borderRadius: '50%',
                            display: 'inline-block'
                          }}></span>
                          Documento PDF
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <Link 
                        to={`/summary/${encodeURIComponent(pdf)}`}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          padding: '8px 12px',
                          backgroundColor: '#4b5563',
                          color: '#e5e7eb',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: 500,
                          transition: 'all 0.2s',
                          border: '1px solid #6b7280'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#6b7280';
                          e.target.style.color = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#4b5563';
                          e.target.style.color = '#e5e7eb';
                        }}
                      >
                                                 <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                         </svg>
                        <span>Resumen</span>
                      </Link>
                      <button 
                        onClick={() => handleDelete(pdf)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          padding: '8px 12px',
                          backgroundColor: '#7f1d1d',
                          color: '#fca5a5',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 500,
                          transition: 'all 0.2s',
                          border: '1px solid #991b1b',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#991b1b';
                          e.target.style.borderColor = '#b91c1c';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#7f1d1d';
                          e.target.style.borderColor = '#991b1b';
                        }}
                      >
                                                 <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

