import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Icon Components
const IconFamily = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconShieldCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12l2 2 4-4"/>
    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
    <path d="M12 21c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
  </svg>
);

const IconWallet = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
    <circle cx="18" cy="12" r="2"/>
  </svg>
);

const IconReceipt = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>
);

const IconSync = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"/>
    <path d="M1 20v-6h6"/>
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10"/>
    <path d="M3.51 15a9 9 0 0 0 14.85 3.36L23 14"/>
  </svg>
);

const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <circle cx="12" cy="16" r="1"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v8M8 12h8"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"/>
    <path d="M12 19l-7-7 7-7"/>
  </svg>
);

export default function FamilyMode() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock family data for demonstration
  const [mockFamily] = useState([
    {
      id: 1,
      name: 'Rajesh Kumar',
      role: 'Father',
      avatar: '👨',
      status: 'connected',
      expenses: 45000,
      color: '#1976d2'
    },
    {
      id: 2,
      name: 'Priya Kumar',
      role: 'Mother', 
      avatar: '👩',
      status: 'connected',
      expenses: 32000,
      color: '#e91e63'
    },
    {
      id: 3,
      name: 'Arjun Kumar',
      role: 'Child',
      avatar: '👦',
      status: 'pending',
      expenses: 8500,
      color: '#ff9800'
    }
  ]);

  useEffect(() => {
    // Get user info
    axios.get('http://localhost:5000/api/me', { withCredentials: true })
      .then(res => {
        setUser(res.data);
        setFamilyMembers(mockFamily);
      })
      .catch(() => {
        navigate('/welcome');
      });
  }, [navigate]);

  const handleConnectMember = async () => {
    if (!email) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newMember = {
        id: Date.now(),
        name: email.split('@')[0],
        role: 'Family Member',
        avatar: '👤',
        status: 'pending',
        expenses: 0,
        color: '#4caf50'
      };
      setFamilyMembers([...familyMembers, newMember]);
      setEmail('');
      setShowConnectForm(false);
      setLoading(false);
    }, 1500);
  };

  const totalFamilyExpenses = familyMembers.reduce((sum, member) => sum + member.expenses, 0);

  return (
    <div style={{
      fontFamily: 'Poppins, Inter, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e8 50%, #f3e5f5 100%)',
      paddingBottom: '20px'
    }}>
      
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1976d2 0%, #4caf50 100%)',
        padding: '20px',
        color: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '12px',
              padding: '10px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconArrowLeft />
          </button>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <IconFamily />
              Family Mode
            </h1>
            <p style={{
              margin: '5px 0 0 0',
              opacity: 0.9,
              fontSize: '0.9rem'
            }}>
              Connect & track expenses together
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        
        {/* Family Overview Card */}
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '25px',
          marginBottom: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '1.3rem',
              fontWeight: '600',
              color: '#333'
            }}>Family Overview</h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(76,175,80,0.1)',
              padding: '6px 12px',
              borderRadius: '20px',
              color: '#4caf50',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              <IconLock />
              Secure
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              borderRadius: '16px',
              padding: '20px',
              color: '#fff',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '5px' }}>
                ₹{totalFamilyExpenses.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Total Family Expenses</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #4caf50, #81c784)',
              borderRadius: '16px',
              padding: '20px',
              color: '#fff',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '5px' }}>
                {familyMembers.length}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Connected Members</div>
            </div>
          </div>
        </div>

        {/* Family Members */}
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '25px',
          marginBottom: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: '#333' }}>
              Family Members
            </h3>
            <button
              onClick={() => setShowConnectForm(true)}
              style={{
                background: 'linear-gradient(135deg, #1976d2, #4caf50)',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 16px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <IconPlus />
              Connect
            </button>
          </div>

          {familyMembers.map((member) => (
            <div key={member.id} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '15px',
              borderRadius: '16px',
              marginBottom: '12px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(248,249,250,0.8))',
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '20px',
                background: `linear-gradient(135deg, ${member.color}, ${member.color}99)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginRight: '15px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {member.avatar}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: '600',
                  fontSize: '1rem',
                  color: '#333',
                  marginBottom: '4px'
                }}>
                  {member.name}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#666',
                  marginBottom: '6px'
                }}>
                  {member.role}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#1976d2'
                }}>
                  ₹{member.expenses.toLocaleString('en-IN')} spent
                </div>
              </div>

              <div style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: member.status === 'connected' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
                color: member.status === 'connected' ? '#4caf50' : '#ff9800'
              }}>
                {member.status === 'connected' ? '✓ Connected' : '⏳ Pending'}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px',
          marginBottom: '20px'
        }}>
          {[
            { icon: <IconWallet />, title: 'Shared Budget', desc: 'Manage family budget', color: '#1976d2' },
            { icon: <IconReceipt />, title: 'Bills & Expenses', desc: 'Track all expenses', color: '#e91e63' },
            { icon: <IconSync />, title: 'Sync Data', desc: 'Real-time updates', color: '#4caf50' },
            { icon: <IconShieldCheck />, title: 'Privacy Settings', desc: 'Data protection', color: '#ff9800' }
          ].map((action, index) => (
            <div key={index} style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{
                color: action.color,
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'center'
              }}>
                {action.icon}
              </div>
              <div style={{
                fontWeight: '600',
                fontSize: '0.9rem',
                color: '#333',
                marginBottom: '4px'
              }}>
                {action.title}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#666'
              }}>
                {action.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Security Notice */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(25,118,210,0.05), rgba(76,175,80,0.05))',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(25,118,210,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{ color: '#1976d2' }}>
            <IconLock />
          </div>
          <div>
            <div style={{
              fontWeight: '600',
              fontSize: '0.9rem',
              color: '#333',
              marginBottom: '4px'
            }}>
              Your family data is secure & private
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: '#666',
              lineHeight: '1.4'
            }}>
              End-to-end encryption • Local data storage • No sharing without permission
            </div>
          </div>
        </div>
      </div>

      {/* Connect Member Modal */}
      {showConnectForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '30px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '1.3rem',
              fontWeight: '600',
              color: '#333',
              textAlign: 'center'
            }}>
              Connect Family Member
            </h3>
            
            <input
              type="email"
              placeholder="Enter family member's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '12px',
                border: '2px solid #e0e0e0',
                fontSize: '1rem',
                marginBottom: '20px',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'inherit'
              }}
            />

            <div style={{
              display: 'flex',
              gap: '10px'
            }}>
              <button
                onClick={() => setShowConnectForm(false)}
                style={{
                  flex: 1,
                  padding: '15px',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  background: '#fff',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConnectMember}
                disabled={loading || !email}
                style={{
                  flex: 1,
                  padding: '15px',
                  borderRadius: '12px',
                  border: 'none',
                  background: loading ? '#ccc' : 'linear-gradient(135deg, #1976d2, #4caf50)',
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                {loading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
