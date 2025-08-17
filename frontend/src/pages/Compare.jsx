// src/pages/Compare.jsx
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPDFs, comparePDFs } from "../api/api";
import Header from "../components/Header";

export default function Compare() {
  const { pdfName } = useParams(); // PDF actual seleccionado
  const [pdfs, setPdfs] = useState([]);
  const [selectedPDF1, setSelectedPDF1] = useState(pdfName || "");
  const [selectedPDF2, setSelectedPDF2] = useState("");
  const [comparison, setComparison] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPDFs = async () => {
      try {
        const response = await fetchPDFs();
        setPdfs(response.data.pdfs);
        // Si no hay PDF actual, seleccionar el primero
        if (!pdfName && response.data.pdfs.length > 0) {
          setSelectedPDF1(response.data.pdfs[0]);
        }
      } catch (err) {
        setError("Error al cargar los documentos");
        console.error(err);
      }
    };

    loadPDFs();
  }, [pdfName]);

  const handleCompare = async () => {
    if (!selectedPDF1 || !selectedPDF2) {
      setError("Debes seleccionar dos documentos para comparar");
      return;
    }

    if (selectedPDF1 === selectedPDF2) {
      setError("Debes seleccionar dos documentos diferentes");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await comparePDFs([selectedPDF1, selectedPDF2]);
      setComparison(response.data.comparison);
    } catch (err) {
      setError("Error al comparar los documentos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827' }}>
      <Header />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <Link to="/summaries" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: '#4b5563',
                color: '#e5e7eb',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#6b7280';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#4b5563';
              }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </Link>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#f9fafb', margin: '0 0 8px 0' }}>Comparar Documentos</h1>
                <p style={{ fontSize: '16px', color: '#9ca3af', margin: 0 }}>
                  Selecciona dos documentos PDF para comparar sus contenidos
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#7f1d1d', border: '1px solid #991b1b', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg style={{ width: '20px', height: '20px', color: '#fca5a5' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span style={{ color: '#fecaca', fontSize: '14px' }}>{error}</span>
              </div>
            </div>
          )}

          {/* PDF Selection */}
          <div style={{ backgroundColor: 'rgb(33 41 54)', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', border: '1px solid #374151', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#f9fafb', margin: '0 0 20px 0' }}>Seleccionar Documentos</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              {/* Documento 1 */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#e5e7eb', marginBottom: '8px' }}>
                  Documento 1
                </label>
                <select
                  value={selectedPDF1}
                  onChange={(e) => setSelectedPDF1(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #4b5563',
                    backgroundColor: '#1f2937',
                    color: '#f9fafb',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="">Seleccionar documento</option>
                  {pdfs.map((pdf) => (
                    <option key={pdf} value={pdf}>
                      {pdf}
                    </option>
                  ))}
                </select>
              </div>

              {/* Documento 2 */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#e5e7eb', marginBottom: '8px' }}>
                  Documento 2
                </label>
                <select
                  value={selectedPDF2}
                  onChange={(e) => setSelectedPDF2(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #4b5563',
                    backgroundColor: '#1f2937',
                    color: '#f9fafb',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="">Seleccionar documento</option>
                  {pdfs.map((pdf) => (
                    <option key={pdf} value={pdf}>
                      {pdf}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={handleCompare}
              disabled={loading || !selectedPDF1 || !selectedPDF2}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: loading || !selectedPDF1 || !selectedPDF2 ? '#4b5563' : '#8b5cf6',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 500,
                cursor: loading || !selectedPDF1 || !selectedPDF2 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading && selectedPDF1 && selectedPDF2) {
                  e.target.style.backgroundColor = '#7c3aed';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && selectedPDF1 && selectedPDF2) {
                  e.target.style.backgroundColor = '#8b5cf6';
                }
              }}
            >
              {loading ? (
                <>
                  <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Comparando...
                </>
              ) : (
                <>
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Comparar Documentos
                </>
              )}
            </button>
          </div>

          {/* Comparison Result */}
          {comparison && (
            <div style={{ backgroundColor: 'rgb(33 41 54)', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', border: '1px solid #374151', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px 16px 24px', borderBottom: '1px solid #374151' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#f9fafb', margin: 0 }}>Resultado de la Comparación</h2>
              </div>
              
              <div style={{ padding: '24px' }}>
                <div style={{ 
                  whiteSpace: 'pre-wrap', 
                  color: '#e5e7eb', 
                  lineHeight: '1.6',
                  fontSize: '15px'
                }}>
                  {comparison}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
