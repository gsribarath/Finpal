import React from 'react';
import { Link } from 'react-router-dom';

function Welcome() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 100%)',
      fontFamily: 'Poppins, Inter, sans-serif'
    }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
      
      <div style={{ 
        background: '#fff', 
        padding: '60px 40px', 
        borderRadius: '20px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)', 
        maxWidth: '500px', 
        textAlign: 'center' 
      }}>
        <div style={{ marginBottom: '40px' }}>
          {/* FinPal Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '20px' }}>
            <img src="https://img.icons8.com/color/48/000000/money-bag.png" alt="FinPal Logo" style={{ width: 48, height: 48 }} />
            <h1 style={{ 
              margin: 0, 
              color: '#1976d2', 
              fontSize: '36px',
              fontWeight: '700',
              letterSpacing: '0.5px'
            }}>FinPal</h1>
          </div>
          
          <p style={{ 
            margin: 0, 
            color: '#666', 
            fontSize: '18px',
            lineHeight: '1.6'
          }}>Take control of your finances with our intelligent budgeting app. Track expenses, set goals, and achieve financial freedom.</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <Link 
            to="/register"
            style={{ 
              padding: '16px 24px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', 
              color: '#fff', 
              border: 'none', 
              fontWeight: '600',
              fontSize: '18px',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(25,118,210,0.3)'
            }}
          >
            Get Started - Sign Up
          </Link>
          
          <Link 
            to="/login"
            style={{ 
              padding: '16px 24px', 
              borderRadius: '12px', 
              background: 'transparent', 
              color: '#1976d2', 
              border: '2px solid #1976d2', 
              fontWeight: '600',
              fontSize: '18px',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.2s'
            }}
          >
            Already have an account? Sign In
          </Link>
        </div>
        
        <div style={{ marginTop: '40px', fontSize: '14px', color: '#888' }}>
          <p>✓ Secure & Private</p>
          <p>✓ Easy Expense Tracking</p>
          <p>✓ Smart Analytics</p>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
