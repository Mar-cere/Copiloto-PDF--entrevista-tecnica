// src/pages/Chat.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { chatWithPDF, fetchPDFs } from "../api/api";
import Header from "../components/Header";

export default function Chat() {
  const [pdfs, setPDFs] = useState([]);
  const [selectedPDF, setSelectedPDF] = useState("");
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const loadPDFs = async () => {
    try {
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

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = message;
    setChatHistory((prev) => [...prev, { user: userMessage, timestamp: new Date() }]);
    setMessage("");
    setLoading(true);
    setError("");

    try {
      const res = await chatWithPDF(userMessage, selectedPDF || null);
      setChatHistory((prev) => [
        ...prev,
        { bot: res.data.bot_response, timestamp: new Date() },
      ]);
    } catch (err) {
      setError("Error al enviar el mensaje");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (confirm("¿Estás seguro de que quieres limpiar el historial del chat?")) {
      setChatHistory([]);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827' }}>
      <Header />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#f9fafb', margin: '0 0 8px 0' }}>Chat con IA</h1>
            <p style={{ fontSize: '16px', color: '#9ca3af', margin: 0 }}>
              Haz preguntas sobre tus documentos PDF y obtén respuestas inteligentes
            </p>
          </div>

          {/* PDF Selector */}
          <div style={{ backgroundColor: 'rgb(33 41 54)', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', border: '1px solid #374151' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#e5e7eb', marginBottom: '8px' }}>
                  Seleccionar documento (opcional)
                </label>
                <select
                  value={selectedPDF}
                  onChange={(e) => setSelectedPDF(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #4b5563',
                    backgroundColor: '#1f2937',
                    color: '#f9fafb',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="">Todos los documentos</option>
                  {pdfs.map((pdf) => (
                    <option key={pdf} value={pdf}>
                      {pdf}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={clearChat}
                  disabled={chatHistory.length === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    backgroundColor: chatHistory.length === 0 ? '#4b5563' : '#4b5563',
                    color: '#e5e7eb',
                    borderRadius: '8px',
                    border: '1px solid #6b7280',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: chatHistory.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (chatHistory.length > 0) {
                      e.target.style.backgroundColor = '#6b7280';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (chatHistory.length > 0) {
                      e.target.style.backgroundColor = '#4b5563';
                    }
                  }}
                >
                                         <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                     </svg>
                    Limpiar chat
                </button>
                <Link to="/" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  backgroundColor: '#4b5563',
                  color: '#e5e7eb',
                  borderRadius: '8px',
                  border: '1px solid #6b7280',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#6b7280';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#4b5563';
                }}>
                                         <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                     </svg>
                    Volver
                </Link>
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

          {/* Chat Messages */}
          <div style={{ backgroundColor: 'rgb(33 41 54)', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', border: '1px solid #374151', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 16px 24px', borderBottom: '1px solid #374151' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#f9fafb', margin: 0 }}>Conversación</h2>
                {selectedPDF && (
                  <span style={{ 
                    padding: '4px 12px', 
                    backgroundColor: '#3b82f6', 
                    color: 'white', 
                    borderRadius: '16px', 
                    fontSize: '12px', 
                    fontWeight: 500 
                  }}>
                    Documento: {selectedPDF}
                  </span>
                )}
              </div>
            </div>
            
            <div style={{ padding: 0 }}>
              <div style={{ height: '400px', overflowY: 'auto', padding: '24px' }}>
                {chatHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                                         <div style={{ width: '48px', height: '48px', backgroundColor: '#1e293b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                       <svg style={{ width: '24px', height: '24px', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                       </svg>
                     </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#f9fafb', margin: '0 0 8px 0' }}>Inicia una conversación</h3>
                    <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                      Haz una pregunta sobre tus documentos PDF para comenzar
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {chatHistory.map((entry, idx) => (
                      <div key={idx}>
                        {entry.user && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ maxWidth: '75%' }}>
                              <div style={{ 
                                backgroundColor: '#3b82f6', 
                                color: 'white', 
                                padding: '16px', 
                                borderRadius: '12px 12px 4px 12px',
                                position: 'relative'
                              }}>
                                <p style={{ margin: '0 0 8px 0', lineHeight: '1.4' }}>{entry.user}</p>
                                <span style={{ fontSize: '11px', opacity: 0.8 }}>
                                  {formatTime(entry.timestamp)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        {entry.bot && (
                          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <div style={{ maxWidth: '75%' }}>
                              <div style={{ 
                                backgroundColor: '#374151', 
                                color: '#e5e7eb', 
                                padding: '16px', 
                                borderRadius: '12px 12px 12px 4px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                                 <div style={{ width: '24px', height: '24px', backgroundColor: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                 <svg style={{ width: '12px', height: '12px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                                 </svg>
                               </div>
                                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#f9fafb' }}>Copiloto IA</span>
                                </div>
                                <div>
                                  <p style={{ margin: 0, lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{entry.bot}</p>
                                </div>
                                <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px', display: 'block' }}>
                                  {formatTime(entry.timestamp)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {loading && (
                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ maxWidth: '75%' }}>
                          <div style={{ 
                            backgroundColor: '#374151', 
                            color: '#e5e7eb', 
                            padding: '16px', 
                            borderRadius: '12px 12px 12px 4px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                             <div style={{ width: '24px', height: '24px', backgroundColor: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                 <svg style={{ width: '12px', height: '12px', color: 'white', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                                   <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                   <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                 </svg>
                               </div>
                              <span style={{ fontSize: '13px', fontWeight: 500, color: '#f9fafb' }}>Copiloto IA está escribiendo...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div style={{ backgroundColor: 'rgb(33 41 54)', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', border: '1px solid #374151' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu pregunta aquí..."
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #4b5563',
                    backgroundColor: '#1f2937',
                    color: '#f9fafb',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.backgroundColor = '#111827';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#4b5563';
                    e.target.style.backgroundColor = '#1f2937';
                  }}
                />
              </div>
              <button 
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: loading || !message.trim() ? '#4b5563' : '#3b82f6',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading && message.trim()) {
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && message.trim()) {
                    e.target.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {loading ? (
                  <>
                                         <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                     <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                      Enviando...
                  </>
                ) : (
                  <>
                                         <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                   </svg>
                      Enviar
                  </>
                )}
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '12px', marginBottom: 0 }}>
              Presiona Enter para enviar • Shift + Enter para nueva línea
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

