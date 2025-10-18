import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MobileNavigation from '../components/MobileNavigation';

// Category options with icons
const CATEGORIES = [
  { value: 'food', label: 'Food', icon: '🍽️' },
  { value: 'rent', label: 'Rent', icon: '🏠' },
  { value: 'bills', label: 'Bills', icon: '💡' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'medical', label: 'Medical', icon: '🏥' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'miscellaneous', label: 'Miscellaneous', icon: '📦' },
];

// Payment mode options
const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'emi', label: 'EMI' },
  { value: 'other', label: 'Other' },
];

export default function AddExpense() {
  const [user, setUser] = useState(null);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    user_name: "",
    email: "",
    category: "",
    amount: "",
    payment_mode: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
  });

  useEffect(() => {
    // Get user info and prefill form
    axios.get('http://localhost:5000/api/me', { withCredentials: true })
      .then(res => {
        setUser(res.data);
        setForm(prev => ({
          ...prev,
          user_name: res.data.name || '',
          email: res.data.email || ''
        }));
      })
      .catch(() => {
        navigate('/welcome');
      });

    // Load saved monthly total
    const savedMonthlyTotal = sessionStorage.getItem('finpal_monthlyTotal');
    if (savedMonthlyTotal) {
      setMonthlyTotal(parseFloat(savedMonthlyTotal));
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.category || !form.amount || !form.payment_mode) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post("http://localhost:5000/add_expense", form, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
      });
      
      // Update monthly total
      const expenseAmount = parseFloat(form.amount);
      setMonthlyTotal(prev => {
        const updated = prev + expenseAmount;
        sessionStorage.setItem('finpal_monthlyTotal', updated.toString());
        return updated;
      });
      
      alert("💰 Expense Added Successfully!");
      
      // Reset form but keep user info
      setForm({
        user_name: user?.name || "",
        email: user?.email || "",
        category: "",
        amount: "",
        payment_mode: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      });
      
    } catch (error) {
      alert("Error adding expense: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

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
            Add a New Expense
          </h1>
          <p style={{ 
            fontSize: '0.95rem', 
            color: '#666', 
            lineHeight: '1.5' 
          }}>
            Track your expenses instantly and maintain your personal budget with ease.
          </p>
        </div>

        {/* Welcome Message */}
        {user && (
          <div style={{ 
            background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)', 
            padding: '1.25rem', 
            borderRadius: '16px', 
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#1976d2' }}>
              Welcome back, {user.name}! 👋
            </h3>
            <p style={{ margin: 0, fontSize: '1rem', color: '#666' }}>
              Monthly Total: <span style={{ fontWeight: 700, color: '#d32f2f' }}>₹{monthlyTotal.toLocaleString()}</span>
            </p>
          </div>
        )}

        {/* Expense Form */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '20px', 
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)' 
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Basic Info Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' }}>
                  Name
                </label>
                <input
                  type="text"
                  name="user_name"
                  value={form.user_name}
                  onChange={handleChange}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e1e5e9',
                    fontSize: '1rem',
                    backgroundColor: '#f8f9fa',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e1e5e9',
                    fontSize: '1rem',
                    backgroundColor: '#f8f9fa',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Category and Amount Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' }}>
                  Category *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e1e5e9',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' }}>
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e1e5e9',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Payment Mode and Date Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' }}>
                  Payment Mode *
                </label>
                <select
                  name="payment_mode"
                  value={form.payment_mode}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e1e5e9',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select Payment Mode</option>
                  {PAYMENT_MODES.map(mode => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' }}>
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e1e5e9',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' }}>
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter expense description..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #e1e5e9',
                  fontSize: '1rem',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: 'none',
                background: loading ? '#ccc' : 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(67,233,123,0.3)',
                transition: 'all 0.2s',
                marginTop: '0.5rem'
              }}
            >
              {loading ? '💾 Adding Expense...' : '💰 Add Expense'}
            </button>
          </form>
        </div>

        {/* Quick Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: '12px', 
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>💸</div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>This Month</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#d32f2f' }}>
              ₹{monthlyTotal.toLocaleString()}
            </div>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: '12px', 
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📊</div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>View</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1976d2' }}>
              <a href="/expenses-list" style={{ color: 'inherit', textDecoration: 'none' }}>
                All Expenses
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile tap effect */}
      <style>{`
        button:active, input:focus, select:focus, textarea:focus {
          transform: scale(0.98);
        }
        
        input:focus, select:focus, textarea:focus {
          border-color: #1976d2 !important;
          outline: none;
        }
      `}</style>
    </div>
  );
}