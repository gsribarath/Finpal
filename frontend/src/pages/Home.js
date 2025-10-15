import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Navigation links for the navbar and footer
const NAV_LINKS = [
  { name: 'Home', href: '/home' },
  { name: 'Add Expense', href: '/add-expense' },
  { name: 'Expenses List', href: '/expenses-list' },
  { name: 'Settings', href: '/settings' },
  { name: 'Profile', href: '/profile' },
];

// Quick action cards for the homepage
const QUICK_ACTIONS = [
  { icon: '➕', title: 'Add Expense', desc: 'Log a new expense instantly.' },
  { icon: '📊', title: 'View Reports', desc: 'Analyze your spending trends.' },
  { icon: '📅', title: 'Upcoming Bills', desc: 'See upcoming payments.' },
  { icon: '⚙️', title: 'Settings', desc: 'Customize your experience.' },
];

export default function Home() {
  const [user, setUser] = useState(null);
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
    <div style={{ fontFamily: 'Poppins, Inter, sans-serif', minHeight: '100vh', background: 'linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 100%)', display: 'flex', flexDirection: 'column' }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Top Navigation Bar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 2.5rem', background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <img src="https://img.icons8.com/color/48/000000/money-bag.png" alt="FinPal Logo" style={{ width: 32, height: 32 }} />
          <span style={{ fontWeight: 700, fontSize: '1.35rem', letterSpacing: '0.5px', color: '#1976d2' }}>FinPal</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {NAV_LINKS.map(link => (
            <a
              key={link.name}
              href={link.href}
              style={{
                fontSize: '1.08rem',
                fontWeight: 600,
                color: '#333',
                textDecoration: 'none',
                padding: '0.3rem 0.7rem',
                borderRadius: '6px',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseOver={e => (e.target.style.background = '#e3f2fd', e.target.style.color = '#1976d2')}
              onMouseOut={e => (e.target.style.background = 'none', e.target.style.color = '#333')}
            >
              {link.name}
            </a>
          ))}
          <button
            onClick={handleLogout}
            style={{
              background: '#f44336',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

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
