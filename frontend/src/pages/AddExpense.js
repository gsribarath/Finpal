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
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post("http://localhost:5000/add_expense", form, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
      });
      
      // Update monthly total
      const expenseAmount = parseFloat(form.amount);
      const newTotal = monthlyTotal + expenseAmount;
      setMonthlyTotal(newTotal);
      sessionStorage.setItem('finpal_monthlyTotal', newTotal.toString());
      
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
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ 
            fontSize: window.innerWidth <= 480 ? '1.8rem' : '2.2rem', 
            fontWeight: 700, 
            color: '#1976d2', 
            marginBottom: '0.5rem', 
            letterSpacing: '0.3px' 
          }}>
            ➕ Add Expense
          </h1>
          <p style={{ 
            fontSize: '0.95rem', 
            color: '#666', 
            lineHeight: '1.5' 
          }}>
            Track your spending easily
          </p>
        </div>

        {/* Monthly Total Summary */}
        {user && (
          <div style={{ 
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', 
            padding: '1.5rem', 
            borderRadius: '16px', 
            marginBottom: '1.5rem',
            textAlign: 'center',
            color: 'white'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', opacity: 0.9 }}>
              Welcome back, {user.name}! 👋
            </h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              ₹{monthlyTotal.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              Total expenses this month
            </div>
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
            
            {/* Category */}
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

            {/* Amount */}
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

            {/* Payment Mode */}
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

            {/* Date and Time Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' }}>
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
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
                �
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                Total Expenses
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1976d2' }}>
                ₹{monthlyTotal.toLocaleString()}
              </div>
            </div>

            {/* This Month */}
            <div 
              onClick={() => navigate('/expenses-list')}
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
                �
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                View All
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1976d2' }}>
                Expenses
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile tap effect */}
      <style>{`
        button:active, a:active {
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
