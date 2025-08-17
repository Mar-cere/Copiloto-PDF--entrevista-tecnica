// src/components/Summary.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { summarizePDF } from "../api/api";

export default function Summary({ pdfName }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await summarizePDF(pdfName);
      setSummary(res.data.summary);
    } catch (err) {
      setError("Error al generar el resumen del documento");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pdfName) {
      loadSummary();
    }
  }, [pdfName]);

  const handleRegenerate = () => {
    loadSummary();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827' }}>
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
                <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#f9fafb', margin: '0 0 8px 0' }}>Resumen del Documento</h1>
                <p style={{ fontSize: '16px', color: '#9ca3af', margin: 0 }}>
                  Análisis automático generado por inteligencia artificial
                </p>
              </div>
            </div>
            
            {/* Document Info */}
            <div style={{ backgroundColor: 'rgb(33 41 54)', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', border: '1px solid #374151' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#dc2626', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#f9fafb', margin: '0 0 4px 0' }}>{pdfName}</h2>
                  <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>Documento PDF</p>
                </div>
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

          {/* Summary Content */}
          <div style={{ backgroundColor: 'rgb(33 41 54)', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', border: '1px solid #374151', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 16px 24px', borderBottom: '1px solid #374151' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#f9fafb', margin: '0 0 8px 0' }}>Resumen Automático</h2>
                  <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                    Análisis del contenido generado por IA
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={handleRegenerate}
                    disabled={loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      backgroundColor: loading ? '#4b5563' : '#4b5563',
                      color: '#e5e7eb',
                      borderRadius: '8px',
                      border: '1px solid #6b7280',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = '#6b7280';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = '#4b5563';
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generando...
                      </>
                    ) : (
                      <>
                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Regenerar
                      </>
                    )}
                  </button>
                  <Link 
                    to={`/chat?pdf=${encodeURIComponent(pdfName)}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#3b82f6';
                    }}
                  >
                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Hacer preguntas
                  </Link>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '24px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#1e293b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <svg style={{ width: '24px', height: '24px', color: '#3b82f6', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#f9fafb', margin: '0 0 8px 0' }}>Generando resumen...</h3>
                  <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                    La IA está analizando el documento y creando un resumen detallado
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <svg style={{ width: '20px', height: '20px', color: '#3b82f6' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span style={{ fontWeight: 500, color: '#3b82f6' }}>Resumen Generado por IA</span>
                    </div>
                    <p style={{ color: '#e5e7eb', margin: 0, lineHeight: '1.5' }}>
                      Este resumen ha sido generado automáticamente analizando el contenido completo del documento. 
                      Para obtener información más específica, puedes hacer preguntas directas en el chat.
                    </p>
                  </div>
                  
                  <div style={{ 
                    whiteSpace: 'pre-wrap', 
                    color: '#e5e7eb', 
                    lineHeight: '1.6',
                    fontSize: '15px'
                  }}>
                    {summary}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
            <div style={{ backgroundColor: 'rgb(33 41 54)', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', border: '1px solid #374151', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f9fafb', margin: '0 0 8px 0' }}>Hacer Preguntas</h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 16px 0' }}>
                Haz preguntas específicas sobre el contenido del documento
              </p>
              <Link to="/chat" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s',
                width: '100%',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
              }}>
                Ir al Chat
              </Link>
            </div>

            <div style={{ backgroundColor: 'rgb(33 41 54)', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', border: '1px solid #374151', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#8b5cf6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f9fafb', margin: '0 0 8px 0' }}>Comparar Documentos</h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 16px 0' }}>
                Compara este documento con otros para encontrar diferencias
              </p>
              <Link to={`/compare/${encodeURIComponent(pdfName)}`} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s',
                width: '100%',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#7c3aed';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#8b5cf6';
              }}>
                Comparar con otro
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

