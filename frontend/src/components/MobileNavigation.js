import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Modern icon components
const IconMenu = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const IconClose = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconHome = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const IconPlus = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v8M8 12h8"/>
  </svg>
);

const IconChart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/>
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
  </svg>
);

const IconSettings = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
  </svg>
);

const IconUser = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconLogout = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16,17 21,12 16,7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IconWallet = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
    <circle cx="18" cy="12" r="2"/>
  </svg>
);

export default function MobileNavigation({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
      sessionStorage.removeItem('finpal_categoryExpenses');
      sessionStorage.removeItem('finpal_monthlyTotal');
      navigate('/welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '1rem 1.25rem', 
        background: 'rgba(255,255,255,0.98)', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1976d2' }}>
            <IconWallet />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.35rem', letterSpacing: '0.5px', color: '#1976d2' }}>FinPal</span>
        </div>
        
        {/* Hamburger Menu */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            color: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: '60px',
          right: 0,
          left: 0,
          background: 'rgba(255,255,255,0.98)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 99,
          padding: '1rem',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a href="/home" style={{ padding: '0.75rem', color: '#333', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, borderRadius: '8px', background: '#f5f7fa', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}><IconHome /></div> Home
            </a>
            <a href="/add-expense" style={{ padding: '0.75rem', color: '#333', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, borderRadius: '8px', background: '#f5f7fa', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}><IconPlus /></div> Add Expense
            </a>
            <a href="/expenses-list" style={{ padding: '0.75rem', color: '#333', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, borderRadius: '8px', background: '#f5f7fa', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}><IconChart /></div> Expenses List
            </a>
            <a href="/settings" style={{ padding: '0.75rem', color: '#333', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, borderRadius: '8px', background: '#f5f7fa', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}><IconSettings /></div> Settings
            </a>
            <a href="/profile" style={{ padding: '0.75rem', color: '#333', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, borderRadius: '8px', background: '#f5f7fa', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}><IconUser /></div> Profile
            </a>
            <button onClick={handleLogout} style={{ padding: '0.75rem', background: '#f44336', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}><IconLogout /></div> Logout
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar - Mobile */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255,255,255,0.98)',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '0.75rem 0',
        paddingBottom: 'max(0.75rem, (env(safe-area-inset-bottom, 0)))',
        zIndex: 100
      }}>
        <a 
          href="/home" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textDecoration: 'none', 
            color: location.pathname === '/home' ? '#1976d2' : '#666', 
            fontSize: '0.75rem', 
            fontWeight: 600,
            minWidth: '60px',
            padding: '0.25rem'
          }}
        >
          <div style={{ marginBottom: '0.25rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '24px' }}><IconHome /></div>
          Home
        </a>
        <a 
          href="/add-expense" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textDecoration: 'none', 
            color: location.pathname === '/add-expense' ? '#1976d2' : '#666', 
            fontSize: '0.75rem', 
            fontWeight: 600,
            minWidth: '60px',
            padding: '0.25rem'
          }}
        >
          <div style={{ marginBottom: '0.25rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '24px' }}><IconPlus /></div>
          Add
        </a>
        <a 
          href="/expenses-list" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textDecoration: 'none', 
            color: location.pathname === '/expenses-list' ? '#1976d2' : '#666', 
            fontSize: '0.75rem', 
            fontWeight: 600,
            minWidth: '60px',
            padding: '0.25rem'
          }}
        >
          <div style={{ marginBottom: '0.25rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '24px' }}><IconChart /></div>
          List
        </a>
        <a 
          href="/profile" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textDecoration: 'none', 
            color: location.pathname === '/profile' ? '#1976d2' : '#666', 
            fontSize: '0.75rem', 
            fontWeight: 600,
            minWidth: '60px',
            padding: '0.25rem'
          }}
        >
          <div style={{ marginBottom: '0.25rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '24px' }}><IconUser /></div>
          Profile
        </a>
      </nav>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
