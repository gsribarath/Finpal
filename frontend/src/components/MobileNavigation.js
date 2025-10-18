import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

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
          <img src="https://img.icons8.com/color/48/000000/money-bag.png" alt="FinPal Logo" style={{ width: 32, height: 32 }} />
          <span style={{ fontWeight: 700, fontSize: '1.35rem', letterSpacing: '0.5px', color: '#1976d2' }}>FinPal</span>
        </div>
        
        {/* Hamburger Menu */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
            color: '#1976d2'
          }}
        >
          {menuOpen ? '✕' : '☰'}
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
            <a href="/home" style={{ padding: '0.75rem', color: '#333', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, borderRadius: '8px', background: '#f5f7fa' }}>🏠 Home</a>
            <a href="/add-expense" style={{ padding: '0.75rem', color: '#333', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, borderRadius: '8px', background: '#f5f7fa' }}>➕ Add Expense</a>
            <a href="/expenses-list" style={{ padding: '0.75rem', color: '#333', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, borderRadius: '8px', background: '#f5f7fa' }}>📊 Expenses List</a>
            <a href="/settings" style={{ padding: '0.75rem', color: '#333', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, borderRadius: '8px', background: '#f5f7fa' }}>⚙️ Settings</a>
            <a href="/profile" style={{ padding: '0.75rem', color: '#333', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, borderRadius: '8px', background: '#f5f7fa' }}>👤 Profile</a>
            <button onClick={handleLogout} style={{ padding: '0.75rem', background: '#f44336', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}>
              🚪 Logout
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
            fontWeight: 600 
          }}
        >
          <span style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🏠</span>
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
            fontWeight: 600 
          }}
        >
          <span style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>➕</span>
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
            fontWeight: 600 
          }}
        >
          <span style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📊</span>
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
            fontWeight: 600 
          }}
        >
          <span style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>👤</span>
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
