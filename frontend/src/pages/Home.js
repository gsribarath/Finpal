import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MobileNavigation from '../components/MobileNavigation';

// Modern icon components
const IconPlus = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v8M8 12h8"/>
  </svg>
);

const IconChart = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/>
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
  </svg>
);

const IconSettings = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
  </svg>
);

const IconUser = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconWallet = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
    <circle cx="18" cy="12" r="2"/>
  </svg>
);

// Quick action cards for the homepage
const QUICK_ACTIONS = [
  { icon: <IconPlus />, title: 'Add Expense', desc: 'Log a new expense', href: '/add-expense' },
  { icon: <IconChart />, title: 'View List', desc: 'See all expenses', href: '/expenses-list' },
  { icon: <IconSettings />, title: 'Settings', desc: 'Customize app', href: '/settings' },
  { icon: <IconUser />, title: 'Profile', desc: 'Your account', href: '/profile' },
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

  return (
    <div id="home-page" style={{ 
      fontFamily: 'Poppins, Inter, sans-serif', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 100%)', 
      display: 'flex', 
      flexDirection: 'column',
      paddingBottom: '80px'
    }}>
      
      <MobileNavigation user={user} />

      {/* Hero Section */}
      <section style={{ textAlign: 'center', margin: '2rem 0 1.5rem 0', padding: '0 1.25rem' }}>
        <h1 style={{ 
          fontSize: window.innerWidth <= 480 ? '1.8rem' : '2.2rem', 
          fontWeight: 700, 
          color: '#1976d2', 
          marginBottom: '0.75rem', 
          letterSpacing: '0.3px',
          lineHeight: '1.3'
        }}>
          Welcome back{user?.name ? `, ${user.name}` : user?.email ? `, ${user.email.split('@')[0]}` : ''}!
        </h1>
        <p style={{ 
          fontSize: window.innerWidth <= 480 ? '0.95rem' : '1.1rem', 
          color: '#555', 
          marginBottom: '1.5rem', 
          fontWeight: 500,
          lineHeight: '1.5'
        }}>
          Track your expenses, manage bills, and build financial discipline
        </p>
        <button
          onClick={() => navigate('/add-expense')}
          style={{
            background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '1rem',
            padding: '0.85rem 2rem',
            border: 'none',
            borderRadius: '30px',
            boxShadow: '0 4px 16px rgba(67,233,123,0.2)',
            cursor: 'pointer',
            transition: 'transform 0.18s',
          }}
        >
          Add Expense
        </button>
      </section>

      {/* Dashboard Preview Widget */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '0 1.25rem 1.5rem 1.25rem' }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: '16px', 
          boxShadow: '0 2px 12px rgba(25,118,210,0.08)', 
          padding: window.innerWidth <= 480 ? '0.875rem 1rem' : '1rem 1.25rem', 
          width: '100%',
          maxWidth: '400px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '0.75rem', 
          fontWeight: 600, 
          fontSize: window.innerWidth <= 480 ? '0.85rem' : '0.95rem', 
          color: '#1976d2', 
          letterSpacing: '0.3px',
          flexWrap: 'wrap',
          textAlign: 'center'
        }}>
        <div style={{ 
          color: '#1976d2', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginRight: window.innerWidth <= 480 ? '0.5rem' : '0.75rem'
        }}>
          <IconWallet />
        </div>
          <span>This month's total:</span>
          <span style={{ color: '#d32f2f', fontWeight: 700, fontSize: window.innerWidth <= 480 ? '1rem' : '1.1rem' }}>₹12,000</span>
        </div>
      </div>

      {/* Quick Action Cards */}
      <section className="home-actions" style={{ 
        display: 'grid', 
        gridTemplateColumns: window.innerWidth <= 480 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: window.innerWidth <= 480 ? '0.75rem' : '1rem', 
        margin: '0 1.25rem 2rem 1.25rem',
        maxWidth: '600px',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: window.innerWidth <= 480 ? '0 0.5rem' : '0'
      }}>
        {QUICK_ACTIONS.map((action) => (
          <div
            key={action.title}
            onClick={() => navigate(action.href)}
            style={{
              background: '#fff',
              borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(67,233,123,0.10)',
              minHeight: window.innerWidth <= 480 ? '120px' : '140px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: window.innerWidth <= 480 ? '1rem 0.75rem' : '1.25rem 1rem',
              cursor: 'pointer',
              transition: 'transform 0.18s, box-shadow 0.18s',
              fontWeight: 500,
            }}
          >
            <div style={{ color: '#1976d2', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{action.icon}</div>
            <div style={{ fontWeight: 700, fontSize: window.innerWidth <= 480 ? '0.9rem' : '1rem', color: '#1976d2', marginBottom: '0.35rem', textAlign: 'center' }}>{action.title}</div>
            <div style={{ color: '#666', fontSize: window.innerWidth <= 480 ? '0.75rem' : '0.85rem', textAlign: 'center' }}>{action.desc}</div>
          </div>
        ))}
      </section>

      {/* Quick Stats Section */}
      <section style={{ 
        margin: '0 1.25rem 2rem 1.25rem',
        maxWidth: '600px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          padding: '1.5rem'
        }}>
          <h3 style={{ 
            margin: '0 0 1.5rem 0', 
            fontSize: '1.2rem', 
            color: '#333', 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📊 Quick Stats
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem'
          }}>
            {/* Total Expenses */}
            <div style={{
              background: '#f8f9fa',
              padding: '1.25rem 1rem',
              borderRadius: '16px',
              textAlign: 'center',
              border: '2px solid #e1e5e9'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                📊
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                Total Expenses
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1976d2' }}>
                ₹0
              </div>
            </div>

            {/* This Month */}
            <div style={{
              background: '#f8f9fa',
              padding: '1.25rem 1rem',
              borderRadius: '16px',
              textAlign: 'center',
              border: '2px solid #e1e5e9'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                📅
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                This Month
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d32f2f' }}>
                ₹0
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile tap effect and responsive styles */}
      <style>{`
        button:active, a:active, div[onclick]:active {
          transform: scale(0.95);
        }
        
        @media (max-width: 480px) {
          #home-page .home-actions {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem !important;
          }
        }
        
        @supports (padding: max(0px)) {
          #home-page { 
            padding-bottom: max(80px, calc(80px + env(safe-area-inset-bottom))) !important; 
          }
        }
      `}</style>
    </div>
  );
}
