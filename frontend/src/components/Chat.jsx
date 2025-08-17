import { useState } from "react";
import { chatMessage } from "../api/api";

export default function Chat({ selectedPDF }) {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);

  const handleSend = async () => {
    if (!message) return;
    const res = await chatMessage(message, selectedPDF);
    setHistory([...history, { user: message, bot: res.bot_response }]);
    setMessage("");
  };

  return (
    <div style={{ 
      backgroundColor: 'rgb(33 41 54)', 
      borderRadius: '12px', 
      padding: '24px',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      border: '1px solid #374151'
    }}>
      <h3 style={{ 
        fontSize: '20px', 
        fontWeight: 600, 
        color: '#f9fafb', 
        margin: '0 0 20px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <svg style={{ width: '20px', height: '20px', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Chat {selectedPDF ? `con ${selectedPDF}` : "(todos los PDFs)"}
      </h3>
      
      <div style={{ 
        maxHeight: '400px', 
        overflowY: 'auto', 
        border: '1px solid #4b5563', 
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#1f2937',
        marginBottom: '20px'
      }}>
        {history.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#9ca3af',
            fontSize: '14px'
          }}>
            <svg style={{ width: '32px', height: '32px', margin: '0 auto 12px auto', color: '#4b5563' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Inicia una conversación haciendo una pregunta
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {history.map((h, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Mensaje del usuario */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '8px',
                  alignSelf: 'flex-end'
                }}>
                  <div style={{ 
                    backgroundColor: '#3b82f6', 
                    color: 'white', 
                    padding: '12px 16px', 
                    borderRadius: '12px 12px 4px 12px',
                    maxWidth: '80%',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}>
                    {h.user}
                  </div>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    backgroundColor: '#3b82f6', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg style={{ width: '16px', height: '16px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* Mensaje del bot */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '8px',
                  alignSelf: 'flex-start'
                }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    backgroundColor: '#10b981', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg style={{ width: '16px', height: '16px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div style={{ 
                    backgroundColor: '#374151', 
                    color: '#e5e7eb', 
                    padding: '12px 16px', 
                    borderRadius: '12px 12px 12px 4px',
                    maxWidth: '80%',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}>
                    {h.bot}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <input 
          value={message} 
          onChange={e => setMessage(e.target.value)} 
          placeholder="Escribe tu pregunta..." 
          style={{
            flex: 1,
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
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
        />
        <button 
          onClick={handleSend}
          disabled={!message.trim()}
          style={{
            padding: '12px 20px',
            backgroundColor: message.trim() ? '#3b82f6' : '#4b5563',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 500,
            cursor: message.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            if (message.trim()) {
              e.target.style.backgroundColor = '#2563eb';
            }
          }}
          onMouseLeave={(e) => {
            if (message.trim()) {
              e.target.style.backgroundColor = '#3b82f6';
            }
          }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Enviar
        </button>
      </div>
    </div>
  );
}

