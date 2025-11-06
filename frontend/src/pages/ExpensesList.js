import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MobileNavigation from '../components/MobileNavigation';

export default function ExpensesList() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
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

    // Fetch expenses
    axios.get('http://localhost:5000/api/expenses', { withCredentials: true })
      .then(res => {
        setExpenses(res.data.expenses || []);
      })
      .catch(err => {
        console.error('Error fetching expenses:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const getCategoryIcon = (category) => {
    const icons = {
      food: '🍽️',
      rent: '🏠',
      bills: '💡',
      education: '📚',
      transport: '🚗',
      shopping: '🛍️',
      medical: '🏥',
      entertainment: '🎬',
      miscellaneous: '📦'
    };
    return icons[category] || '💰';
  };

  const getPaymentModeIcon = (mode) => {
    const icons = {
      cash: '💵',
      upi: '📱',
      debit_card: '💳',
      credit_card: '💳',
      emi: '🏦',
      other: '💰'
    };
    return icons[mode] || '💰';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'all') return true;
    return expense.category === filter;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date || b.created_at) - new Date(a.date || a.created_at);
    }
    if (sortBy === 'amount') {
      return b.amount - a.amount;
    }
    return 0;
  });

  const categories = [...new Set(expenses.map(exp => exp.category))];

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
          <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading your expenses...</div>
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
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ 
            fontSize: window.innerWidth <= 480 ? '1.8rem' : '2.2rem', 
            fontWeight: 700, 
            color: '#1976d2', 
            marginBottom: '0.5rem', 
            letterSpacing: '0.3px' 
          }}>
            📊 Your Expenses
          </h1>
          <p style={{ 
            fontSize: '0.95rem', 
            color: '#666', 
            lineHeight: '1.5' 
          }}>
            Track and analyze your spending patterns
          </p>
        </div>

        {/* Total Summary */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', 
          padding: '1.5rem', 
          borderRadius: '16px', 
          marginBottom: '1.5rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', opacity: 0.9 }}>
            Total Expenses
          </h3>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            ₹{getTotalExpenses().toLocaleString()}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            {expenses.length} {expenses.length === 1 ? 'transaction' : 'transactions'}
          </div>
        </div>

        {/* Filters */}
        <div style={{ 
          background: 'white', 
          padding: '1rem', 
          borderRadius: '12px', 
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                Filter by Category
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '2px solid #e1e5e9',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {getCategoryIcon(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '2px solid #e1e5e9',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value="date">Date (Latest First)</option>
                <option value="amount">Amount (Highest First)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        {sortedExpenses.length === 0 ? (
          <div style={{ 
            background: 'white', 
            padding: '3rem 1.5rem', 
            borderRadius: '16px', 
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>No expenses found</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#999' }}>
              {filter === 'all' ? 'Start by adding your first expense!' : `No expenses in ${filter} category.`}
            </p>
            <button
              onClick={() => navigate('/add-expense')}
              style={{
                background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ➕ Add First Expense
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sortedExpenses.map((expense, index) => (
              <div
                key={expense.id || index}
                style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  borderLeft: '4px solid #1976d2'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>
                        {getCategoryIcon(expense.category)}
                      </span>
                      <span style={{ fontWeight: 600, color: '#333', textTransform: 'capitalize' }}>
                        {expense.category}
                      </span>
                    </div>
                    
                    {expense.description && (
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                        {expense.description}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: '#888' }}>
                      <span>📅 {formatDate(expense.date || expense.created_at)}</span>
                      <span>
                        {getPaymentModeIcon(expense.payment_mode)} {expense.payment_mode?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#d32f2f' }}>
                      ₹{expense.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats Section */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          padding: '1.5rem',
          marginTop: '1.5rem'
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
                ₹{getTotalExpenses().toLocaleString()}
              </div>
            </div>

            {/* Transaction Count */}
            <div 
              onClick={() => navigate('/add-expense')}
              style={{
                background: '#f8f9fa',
                padding: '1.25rem 1rem',
                borderRadius: '16px',
                textAlign: 'center',
                border: '2px solid #e1e5e9',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                ➕
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                Add New
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#4caf50' }}>
                Expense
              </div>
            </div>
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