import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MobileNavigation from '../components/MobileNavigation';

// Quick action cards for the homepage
const QUICK_ACTIONS = [
  { icon: '➕', title: 'Add Expense', desc: 'Log a new expense', href: '/add-expense' },
  { icon: '📊', title: 'View List', desc: 'See all expenses', href: '/expenses-list' },
  { icon: '⚙️', title: 'Settings', desc: 'Customize app', href: '/settings' },
  { icon: '👤', title: 'Profile', desc: 'Your account', href: '/profile' },
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
    <div style={{ 
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
          padding: '1rem 1.25rem', 
          width: '100%',
          maxWidth: '400px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '0.75rem', 
          fontWeight: 600, 
          fontSize: '0.95rem', 
          color: '#1976d2', 
          letterSpacing: '0.3px',
          flexWrap: 'wrap',
          textAlign: 'center'
        }}>
          <span role="img" aria-label="expenses" style={{ fontSize: '1.5rem' }}>💸</span>
          <span>This month's total:</span>
          <span style={{ color: '#d32f2f', fontWeight: 700, fontSize: '1.1rem' }}>₹12,000</span>
        </div>
      </div>

      {/* Quick Action Cards */}
      <section style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem', 
        margin: '0 1.25rem 2rem 1.25rem',
        maxWidth: '600px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        {QUICK_ACTIONS.map((action) => (
          <div
            key={action.title}
            onClick={() => navigate(action.href)}
            style={{
              background: '#fff',
              borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(67,233,123,0.10)',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem 1rem',
              cursor: 'pointer',
              transition: 'transform 0.18s, box-shadow 0.18s',
              fontWeight: 500,
            }}
          >
            <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{action.icon}</span>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1976d2', marginBottom: '0.35rem', textAlign: 'center' }}>{action.title}</div>
            <div style={{ color: '#666', fontSize: '0.85rem', textAlign: 'center' }}>{action.desc}</div>
          </div>
        ))}
      </section>

      {/* Mobile tap effect */}
      <style>{`
        button:active, a:active, div[onclick]:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
}
