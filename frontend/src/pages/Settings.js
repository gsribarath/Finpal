import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MobileNavigation from '../components/MobileNavigation';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    currency: 'INR',
    language: 'en',
    budgetAlerts: true,
    exportFormat: 'csv'
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info
    axios.get('http://localhost:5000/api/me', { withCredentials: true })
      .then(res => {
        setUser(res.data);
      })
      .catch(() => {
        navigate('/welcome');
      })
      .finally(() => {
        setLoading(false);
      });

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('finpal_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [navigate]);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('finpal_settings', JSON.stringify(newSettings));
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
      sessionStorage.removeItem('finpal_categoryExpenses');
      sessionStorage.removeItem('finpal_monthlyTotal');
      localStorage.removeItem('finpal_settings');
      navigate('/welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const clearData = () => {
    if (window.confirm('Are you sure you want to clear all your expense data? This action cannot be undone.')) {
      sessionStorage.removeItem('finpal_categoryExpenses');
      sessionStorage.removeItem('finpal_monthlyTotal');
      alert('✅ Data cleared successfully!');
    }
  };

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
          <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading settings...</div>
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
            ⚙️ Settings
          </h1>
          <p style={{ 
            fontSize: '0.95rem', 
            color: '#666', 
            lineHeight: '1.5' 
          }}>
            Customize your FinPal experience
          </p>
        </div>

        {/* App Preferences */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '16px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🎨 App Preferences
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Notifications */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>
                  🔔 Push Notifications
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  Get notified about expense reminders
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.notifications ? '#4caf50' : '#ccc',
                  borderRadius: '28px',
                  transition: '0.4s',
                  transform: settings.notifications ? 'translateX(22px)' : 'translateX(0px)',
                  '&:before': {
                    position: 'absolute',
                    content: '""',
                    height: '22px',
                    width: '22px',
                    left: '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.4s'
                  }
                }} />
              </label>
            </div>

            {/* Currency */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>
                  💱 Currency
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  Default currency for expenses
                </div>
              </div>
              <select
                value={settings.currency}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '2px solid #e1e5e9',
                  fontSize: '0.9rem',
                  minWidth: '80px'
                }}
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
              </select>
            </div>

            {/* Language */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>
                  🌐 Language
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  App display language
                </div>
              </div>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '2px solid #e1e5e9',
                  fontSize: '0.9rem',
                  minWidth: '100px'
                }}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="ta">தமிழ்</option>
                <option value="te">తెలుగు</option>
              </select>
            </div>

            {/* Budget Alerts */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>
                  🚨 Budget Alerts
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  Warn when approaching budget limits
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
                <input
                  type="checkbox"
                  checked={settings.budgetAlerts}
                  onChange={(e) => handleSettingChange('budgetAlerts', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.budgetAlerts ? '#4caf50' : '#ccc',
                  borderRadius: '28px',
                  transition: '0.4s'
                }} />
              </label>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '16px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            💾 Data Management
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={() => alert('Export feature coming soon!')}
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
              Export Data
            </button>
            
            <button
              onClick={() => alert('Backup feature coming soon!')}
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
              <span style={{ fontSize: '1.5rem' }}>☁️</span>
              Backup to Cloud
            </button>
            
            <button
              onClick={clearData}
              style={{
                background: '#ffebee',
                border: '2px solid #ffcdd2',
                padding: '1rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#d32f2f',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🗑️</span>
              Clear All Data
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '16px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            👤 Account
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={() => navigate('/profile')}
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
              <span style={{ fontSize: '1.5rem' }}>✏️</span>
              Edit Profile
            </button>
            
            <button
              onClick={() => alert('Privacy policy coming soon!')}
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
              <span style={{ fontSize: '1.5rem' }}>🔒</span>
              Privacy Policy
            </button>
            
            <button
              onClick={handleLogout}
              style={{
                background: '#ffebee',
                border: '2px solid #ffcdd2',
                padding: '1rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#d32f2f',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🚪</span>
              Logout
            </button>
          </div>
        </div>

        {/* App Info */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem', 
          padding: '1rem',
          color: '#666',
          fontSize: '0.85rem'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>FinPal v1.0.0</strong>
          </div>
          <div>
            Made with ❤️ for better financial management
          </div>
        </div>
      </div>

      {/* Mobile tap effect */}
      <style>{`
        button:active, select:focus {
          transform: scale(0.98);
        }
        
        select:focus {
          border-color: #1976d2 !important;
          outline: none;
        }
      `}</style>
    </div>
  );
}