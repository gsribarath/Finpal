import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MobileNavigation from '../components/MobileNavigation';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info
    axios.get('http://localhost:5000/api/me', { withCredentials: true })
      .then(res => {
        setUser(res.data);
        setFormData({
          name: res.data.name || '',
          email: res.data.email || ''
        });
      })
      .catch(() => {
        navigate('/welcome');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    // In a real app, you'd send this to your backend
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(prev => ({ ...prev, ...formData }));
      setEditing(false);
      alert('✅ Profile updated successfully!');
    } catch (error) {
      alert('❌ Failed to update profile');
    }
  };

  const stats = [
    { icon: '💰', label: 'Total Expenses', value: '₹12,000', color: '#d32f2f' },
    { icon: '📊', label: 'This Month', value: '₹5,500', color: '#1976d2' },
    { icon: '📅', label: 'Days Active', value: '45', color: '#388e3c' },
    { icon: '🏆', label: 'Categories', value: '8', color: '#f57c00' }
  ];

  if (loading) {
    return (
      <div style={{ 
        fontFamily: 'Poppins, Inter, sans-serif', 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: 'Poppins, Inter, sans-serif', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 100%)', 
      paddingBottom: '80px'
    }}>
      
      <MobileNavigation user={user} />

      {/* Page Content */}
      <div style={{ padding: '1.5rem 1.25rem', maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: window.innerWidth <= 480 ? '1.8rem' : '2.2rem', 
            fontWeight: 700, 
            color: '#1976d2', 
            marginBottom: '0.5rem', 
            letterSpacing: '0.3px' 
          }}>
            👤 Your Profile
          </h1>
          <p style={{ 
            fontSize: '0.95rem', 
            color: '#666', 
            lineHeight: '1.5' 
          }}>
            Manage your account and view your statistics
          </p>
        </div>

        {/* Profile Card */}
        <div style={{ 
          background: 'white', 
          padding: '2rem 1.5rem', 
          borderRadius: '20px', 
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          {/* Avatar */}
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: 'white',
            margin: '0 auto 1.5rem auto'
          }}>
            👤
          </div>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #e1e5e9',
                  fontSize: '1rem',
                  textAlign: 'center',
                  boxSizing: 'border-box'
                }}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                readOnly
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #e1e5e9',
                  fontSize: '1rem',
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#4caf50',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ✅ Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: user.name || '',
                      email: user.email || ''
                    });
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e1e5e9',
                    background: 'white',
                    color: '#666',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#333' }}>
                {user.name || 'User'}
              </h2>
              <p style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', color: '#666' }}>
                {user.email}
              </p>
              <button
                onClick={() => setEditing(true)}
                style={{
                  background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ✏️ Edit Profile
              </button>
            </>
          )}
        </div>

        {/* Statistics Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {stats.map((stat, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                padding: '1.25rem 1rem',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                borderLeft: `4px solid ${stat.color}`
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '16px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: '#333' }}>
            Quick Actions
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => navigate('/add-expense')}
              style={{
                background: '#f8f9fa',
                border: '2px solid #e1e5e9',
                padding: '1rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>➕</span>
              Add New Expense
            </button>
            
            <button
              onClick={() => navigate('/expenses-list')}
              style={{
                background: '#f8f9fa',
                border: '2px solid #e1e5e9',
                padding: '1rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>📊</span>
              View All Expenses
            </button>
            
            <button
              onClick={() => navigate('/settings')}
              style={{
                background: '#f8f9fa',
                border: '2px solid #e1e5e9',
                padding: '1rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>⚙️</span>
              App Settings
            </button>
          </div>
        </div>
      </div>

      {/* Mobile tap effect */}
      <style>{`
        button:active, input:focus {
          transform: scale(0.98);
        }
        
        input:focus {
          border-color: #1976d2 !important;
          outline: none;
        }
      `}</style>
    </div>
  );
}