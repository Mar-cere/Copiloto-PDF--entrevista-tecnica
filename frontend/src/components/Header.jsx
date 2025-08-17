import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header style={{ backgroundColor: 'rgb(33 41 54)', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', borderBottom: '1px solid #374151' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#3b82f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#f9fafb' }}>Copiloto PDF</span>
          </Link>

          {/* Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link 
              to="/" 
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s',
                backgroundColor: isActive('/') ? '#1e293b' : 'transparent',
                color: isActive('/') ? '#3b82f6' : '#9ca3af',
                border: isActive('/') ? '1px solid #374151' : '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/')) {
                  e.target.style.backgroundColor = '#374151';
                  e.target.style.color = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/')) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#9ca3af';
                }
              }}
            >
              Inicio
            </Link>
            <Link 
              to="/chat" 
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s',
                backgroundColor: isActive('/chat') ? '#1e293b' : 'transparent',
                color: isActive('/chat') ? '#3b82f6' : '#9ca3af',
                border: isActive('/chat') ? '1px solid #374151' : '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/chat')) {
                  e.target.style.backgroundColor = '#374151';
                  e.target.style.color = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/chat')) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#9ca3af';
                }
              }}
            >
              Chat
            </Link>
            <Link 
              to="/summaries" 
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s',
                backgroundColor: isActive('/summaries') ? '#1e293b' : 'transparent',
                color: isActive('/summaries') ? '#3b82f6' : '#9ca3af',
                border: isActive('/summaries') ? '1px solid #374151' : '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/summaries')) {
                  e.target.style.backgroundColor = '#374151';
                  e.target.style.color = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/summaries')) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#9ca3af';
                }
              }}
            >
              Resúmenes
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
