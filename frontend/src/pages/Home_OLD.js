import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Quick action cards for the homepage
const QUICK_ACTIONS = [
  { icon: '➕', title: 'Add Expense', desc: 'Log a new expense', href: '/add-expense' },
  { icon: '📊', title: 'View List', desc: 'See all expenses', href: '/expenses-list' },
  { icon: '⚙️', title: 'Settings', desc: 'Customize app', href: '/settings' },
  { icon: '👤', title: 'Profile', desc: 'Your account', href: '/profile' },
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info
    axios.get('http://localhost:5000/api/me', { withCredentials: true })
      .then(res => {
        setUser(res.data);
      })
      .catch(() => {
        navigate('/welcome');
      });
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
      // Clear FinPal session data on logout
      sessionStorage.removeItem('finpal_categoryExpenses');
      sessionStorage.removeItem('finpal_monthlyTotal');
      navigate('/welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div style={{ 
      fontFamily: 'Poppins, Inter, sans-serif', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 100%)', 
      display: 'flex', 
      flexDirection: 'column',
      paddingBottom: '80px'
    }}>
      
      {/* Mobile Top Navigation Bar */}
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

      {/* Hero Section */}
      <section style={{ textAlign: 'center', margin: '3.5rem 0 2.5rem 0', padding: '0 1rem' }}>
        <h1 style={{ fontSize: '2.7rem', fontWeight: 700, color: '#1976d2', marginBottom: '1.1rem', letterSpacing: '0.5px' }}>
          Welcome back{user?.name ? `, ${user.name}` : user?.email ? `, ${user.email.split('@')[0]}` : ''}!
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#444', marginBottom: '2rem', fontWeight: 500 }}>
          Track your expenses, manage bills, and build financial discipline for your family.
        </p>
        <button
          style={{
            background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '1.1rem',
            padding: '0.85rem 2.2rem',
            border: 'none',
            borderRadius: '30px',
            boxShadow: '0 4px 16px rgba(67,233,123,0.12)',
            cursor: 'pointer',
            transition: 'transform 0.18s',
          }}
          onMouseOver={e => (e.target.style.transform = 'scale(1.06)')}
          onMouseOut={e => (e.target.style.transform = 'scale(1)')}
        >
          Get Started
        </button>
      </section>

      {/* Dashboard Preview Widget */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.2rem' }}>
        <div style={{ background: '#fff', borderRadius: '18px', boxShadow: '0 2px 12px rgba(25,118,210,0.08)', padding: '1.2rem 2.2rem', minWidth: 260, display: 'flex', alignItems: 'center', gap: '1.1rem', fontWeight: 600, fontSize: '1.15rem', color: '#1976d2', letterSpacing: '0.5px', animation: 'fadeIn 0.7s' }}>
          <span role="img" aria-label="expenses" style={{ fontSize: '1.7rem' }}>💸</span>
          This month's total expenses: <span style={{ color: '#d32f2f', fontWeight: 700, marginLeft: '0.5rem' }}>₹12,000</span>
        </div>
      </div>

      {/* Quick Action Cards */}
      <section style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2.2rem', marginBottom: '3.5rem', padding: '0 1rem' }}>
        {QUICK_ACTIONS.map((action, idx) => (
          <div
            key={action.title}
            style={{
              background: '#fff',
              borderRadius: '18px',
              boxShadow: '0 2px 16px rgba(67,233,123,0.10)',
              width: 220,
              minHeight: 160,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.3rem 1rem',
              cursor: 'pointer',
              transition: 'transform 0.18s, box-shadow 0.18s',
              fontWeight: 500,
              animation: `fadeInUp 0.7s ${0.1 * idx}s`,
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.04)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(25,118,210,0.13)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 2px 16px rgba(67,233,123,0.10)';
            }}
          >
            <span style={{ fontSize: '2.2rem', marginBottom: '0.7rem' }}>{action.icon}</span>
            <div style={{ fontWeight: 700, fontSize: '1.13rem', color: '#1976d2', marginBottom: '0.5rem' }}>{action.title}</div>
            <div style={{ color: '#444', fontSize: '0.98rem', textAlign: 'center' }}>{action.desc}</div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={{ background: 'linear-gradient(90deg, #1976d2 0%, #43e97b 100%)', color: '#fff', padding: '2rem 0 1.2rem 0', textAlign: 'center', marginTop: 'auto', fontSize: '1rem', boxShadow: '0 -2px 12px rgba(25,118,210,0.08)' }}>
        <div style={{ marginBottom: '0.7rem', fontWeight: 600 }}>
          &copy; {new Date().getFullYear()} FinPal – Smart Budgeting App. All rights reserved.
        </div>
        <div style={{ marginBottom: '0.7rem' }}>
          Contact: <a href="mailto:info@smartbudget.com" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 500 }}>info@smartbudget.com</a>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {NAV_LINKS.map(link => (
            <a key={link.name} href={link.href} style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: '1.05rem', transition: 'color 0.2s' }}
              onMouseOver={e => (e.target.style.color = '#e0f7fa')}
              onMouseOut={e => (e.target.style.color = '#fff')}
            >
              {link.name}
            </a>
          ))}
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
        @media (max-width: 700px) {
          nav { flex-direction: column; gap: 1rem; padding: 1rem 1.2rem; }
          section { margin: 2rem 0 1.2rem 0; }
          .quick-actions { flex-direction: column; gap: 1.2rem; }
        }
        @media (max-width: 500px) {
          h1 { font-size: 2rem !important; }
          .quick-actions > div { width: 95vw !important; }
        }
      `}</style>
    </div>
  );
}
