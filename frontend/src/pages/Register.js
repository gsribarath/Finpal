import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5000/api/register', { 
        name: name.trim(),
        email: email.trim(), 
        password 
      }, { withCredentials: true });
      
      if (res.data.success) {
        // Redirect to login with success message
        navigate('/login?registered=true');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

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
        padding: '40px', 
        borderRadius: '20px', 
        boxShadow: '0 15px 40px rgba(0,0,0,0.08)', 
        width: '400px', 
        textAlign: 'center' 
      }}>
        <div style={{ marginBottom: '30px' }}>
          {/* FinPal Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginBottom: '20px' }}>
            <img src="https://img.icons8.com/color/48/000000/money-bag.png" alt="FinPal Logo" style={{ width: 40, height: 40 }} />
            <span style={{ fontWeight: 700, fontSize: '1.8rem', letterSpacing: '0.5px', color: '#1976d2' }}>FinPal</span>
          </div>
          
          <h2 style={{ 
            margin: '0 0 10px 0', 
            color: '#333', 
            fontSize: '28px',
            fontWeight: '600'
          }}>Join FinPal!</h2>
          <p style={{ 
            margin: 0, 
            color: '#666', 
            fontSize: '14px' 
          }}>Create your account to get started</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          marginBottom: '25px'
        }}>
          <input 
            type="text" 
            placeholder="Full Name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
            style={{ 
              padding: '14px', 
              borderRadius: '8px', 
              border: '2px solid #e1e5e9', 
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#667eea'}
            onBlur={e => e.target.style.borderColor = '#e1e5e9'}
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={{ 
              padding: '14px', 
              borderRadius: '8px', 
              border: '2px solid #e1e5e9', 
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#667eea'}
            onBlur={e => e.target.style.borderColor = '#e1e5e9'}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            style={{ 
              padding: '14px', 
              borderRadius: '8px', 
              border: '2px solid #e1e5e9', 
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#667eea'}
            onBlur={e => e.target.style.borderColor = '#e1e5e9'}
          />
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            required 
            style={{ 
              padding: '14px', 
              borderRadius: '8px', 
              border: '2px solid #e1e5e9', 
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#667eea'}
            onBlur={e => e.target.style.borderColor = '#e1e5e9'}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '14px', 
              borderRadius: '8px', 
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: '#fff', 
              border: 'none', 
              fontWeight: '600',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div style={{ 
          margin: '20px 0', 
          color: '#999', 
          fontSize: '14px',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            background: '#e1e5e9'
          }}></div>
          <span style={{ 
            background: '#fff', 
            padding: '0 15px',
            position: 'relative'
          }}>or</span>
        </div>
        
        <button 
          onClick={handleGoogleRegister} 
          style={{ 
            padding: '14px', 
            borderRadius: '8px', 
            background: '#fff', 
            border: '2px solid #4285F4', 
            color: '#4285F4', 
            fontWeight: '600',
            fontSize: '16px',
            width: '100%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s'
          }}
          onMouseOver={e => {
            e.target.style.background = '#4285F4';
            e.target.style.color = '#fff';
          }}
          onMouseOut={e => {
            e.target.style.background = '#fff';
            e.target.style.color = '#4285F4';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        
        <div style={{ marginTop: '25px' }}>
          <Link
            to="/login"
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            Already have an account? Sign in
          </Link>
        </div>
        
        {error && (
          <div style={{ 
            color: '#f44336', 
            marginTop: '20px',
            padding: '12px',
            background: '#ffebee',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;
