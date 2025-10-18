import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Navigation links matching Home page
const NAV_LINKS = [
  { name: 'Home', href: '/home' },
  { name: 'Add Expense', href: '/add-expense' },
  { name: 'Expenses List', href: '/expenses-list' },
  { name: 'Settings', href: '/settings' },
  { name: 'Profile', href: '/profile' },
];

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
  const [categoryExpenses, setCategoryExpenses] = useState({
    food: [],
    rent: [],
    bills: [],
    education: [],
    transport: [],
    shopping: [],
    medical: [],
    entertainment: [],
    miscellaneous: []
  });
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
    recurring: false,
    recurringType: "monthly",
    setReminder: false,
    reminderDate: "",
    reminderTime: "",
    splitExpense: false,
    splitMembers: "",
    billImage: null
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

    // Load saved data from sessionStorage to maintain data until logout
    const savedCategoryExpenses = sessionStorage.getItem('finpal_categoryExpenses');
    const savedMonthlyTotal = sessionStorage.getItem('finpal_monthlyTotal');
    
    if (savedCategoryExpenses) {
      setCategoryExpenses(JSON.parse(savedCategoryExpenses));
    }
    
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

  const handleFileChange = (e) => {
    setForm(prev => ({
      ...prev,
      billImage: e.target.files[0]
    }));
  };

  const autoSuggestCategory = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes('groceries') || desc.includes('food') || desc.includes('restaurant') || desc.includes('cafe')) {
      setForm(prev => ({ ...prev, category: 'food' }));
    } else if (desc.includes('taxi') || desc.includes('bus') || desc.includes('train') || desc.includes('petrol')) {
      setForm(prev => ({ ...prev, category: 'transport' }));
    } else if (desc.includes('electricity') || desc.includes('water') || desc.includes('gas') || desc.includes('internet')) {
      setForm(prev => ({ ...prev, category: 'bills' }));
    }
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, description: value }));
    if (value.length > 3) {
      autoSuggestCategory(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post("http://localhost:5000/add_expense", form, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
      });
      
      // Create new expense entry
      const expenseAmount = parseFloat(form.amount);
      const category = form.category;
      const newExpense = {
        id: Date.now(),
        amount: expenseAmount,
        description: form.description,
        date: form.date,
        time: form.time,
        payment_mode: form.payment_mode
      };
      
      // Update category expenses by adding to the array
      setCategoryExpenses(prev => {
        const updated = {
          ...prev,
          [category]: [...prev[category], newExpense]
        };
        // Save to sessionStorage with finpal prefix
        sessionStorage.setItem('finpal_categoryExpenses', JSON.stringify(updated));
        return updated;
      });
      
      // Update monthly total
      setMonthlyTotal(prev => {
        const updated = prev + expenseAmount;
        // Save to sessionStorage with finpal prefix
        sessionStorage.setItem('finpal_monthlyTotal', updated.toString());
        return updated;
      });
      
      alert("Expense Added Successfully! 🎉");
      
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
        recurring: false,
        recurringType: "monthly",
        setReminder: false,
        reminderDate: "",
        reminderTime: "",
        splitExpense: false,
        splitMembers: "",
        billImage: null
      });
      
    } catch (error) {
      alert("Error adding expense: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
      // Clear session data on logout with finpal prefix
      sessionStorage.removeItem('finpal_categoryExpenses');
      sessionStorage.removeItem('finpal_monthlyTotal');
      navigate('/welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div style={{ fontFamily: 'Poppins, Inter, sans-serif', minHeight: '100vh', background: 'linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 100%)', display: 'flex', flexDirection: 'column' }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Top Navigation Bar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 2.5rem', background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <img src="https://img.icons8.com/color/48/000000/money-bag.png" alt="FinPal Logo" style={{ width: 32, height: 32 }} />
          <span style={{ fontWeight: 700, fontSize: '1.35rem', letterSpacing: '0.5px', color: '#1976d2' }}>FinPal</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {NAV_LINKS.map(link => (
            <a
              key={link.name}
              href={link.href}
              style={{
                fontSize: '1.08rem',
                fontWeight: 600,
                color: link.href === '/add-expense' ? '#1976d2' : '#333',
                textDecoration: 'none',
                padding: '0.3rem 0.7rem',
                borderRadius: '6px',
                background: link.href === '/add-expense' ? '#e3f2fd' : 'none',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseOver={e => link.href !== '/add-expense' && (e.target.style.background = '#e3f2fd', e.target.style.color = '#1976d2')}
              onMouseOut={e => link.href !== '/add-expense' && (e.target.style.background = 'none', e.target.style.color = '#333')}
            >
              {link.name}
            </a>
          ))}
          <button
            onClick={handleLogout}
            style={{
              background: '#f44336',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '3rem 2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 700, color: '#1976d2', marginBottom: '1rem', letterSpacing: '-0.5px' }}>
            Add a New Expense
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '0' }}>
            Track your expenses instantly and maintain your personal budget with ease.
          </p>
        </div>

        {/* Main Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem', alignItems: 'start', maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Left Column - Expense Form */}
          <div style={{ background: 'white', padding: '3rem', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
            {/* Welcome message */}
            {user && (
              <div style={{ 
                background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                marginBottom: '2.5rem',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', color: '#1976d2' }}>Welcome back, {user.name}! 👋</h3>
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#666' }}>Monthly Total: ₹{monthlyTotal.toLocaleString()}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* User Info Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#333', fontSize: '1rem' }}>Name</label>
                  <input
                    type="text"
                    name="user_name"
                    value={form.user_name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e1e5e9',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s',
                      background: '#f8f9fa',
                      boxSizing: 'border-box'
                    }}
                    readOnly
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#333', fontSize: '1rem' }}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e1e5e9',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s',
                      background: '#f8f9fa',
                      boxSizing: 'border-box'
                    }}
                    readOnly
                  />
                </div>
              </div>

              {/* Category and Amount */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#333', fontSize: '1rem' }}>Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e1e5e9',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = '#1976d2'}
                    onBlur={e => e.target.style.borderColor = '#e1e5e9'}
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
                  <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#333', fontSize: '1rem' }}>Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e1e5e9',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = '#1976d2'}
                    onBlur={e => e.target.style.borderColor = '#e1e5e9'}
                  />
                </div>
              </div>

              {/* Payment Mode and Date/Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#333', fontSize: '1rem' }}>Payment Mode</label>
                  <select
                    name="payment_mode"
                    value={form.payment_mode}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e1e5e9',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = '#1976d2'}
                    onBlur={e => e.target.style.borderColor = '#e1e5e9'}
                  >
                    <option value="">Select Payment Mode</option>
                    {PAYMENT_MODES.map(mode => (
                      <option key={mode.value} value={mode.value}>{mode.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#333', fontSize: '1rem' }}>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e1e5e9',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = '#1976d2'}
                    onBlur={e => e.target.style.borderColor = '#e1e5e9'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#333', fontSize: '1rem' }}>Time</label>
                  <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e1e5e9',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = '#1976d2'}
                    onBlur={e => e.target.style.borderColor = '#e1e5e9'}
                  />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#333', fontSize: '1rem' }}>Description / Notes</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleDescriptionChange}
                  placeholder="e.g., Bought groceries at Reliance Fresh"
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid #e1e5e9',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#1976d2'}
                  onBlur={e => e.target.style.borderColor = '#e1e5e9'}
                />
              </div>

              {/* Advanced Options */}
              <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#333', fontSize: '1.2rem' }}>Advanced Options</h3>
                
                {/* Recurring Expense */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="recurring"
                      checked={form.recurring}
                      onChange={handleChange}
                      style={{ width: '20px', height: '20px' }}
                    />
                    <span style={{ fontWeight: 600, color: '#333', fontSize: '1rem' }}>Recurring Expense</span>
                  </label>
                  {form.recurring && (
                    <select
                      name="recurringType"
                      value={form.recurringType}
                      onChange={handleChange}
                      style={{
                        marginTop: '1rem',
                        padding: '0.8rem',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        width: '180px',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  )}
                </div>

                {/* Bill Reminder */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="setReminder"
                      checked={form.setReminder}
                      onChange={handleChange}
                      style={{ width: '20px', height: '20px' }}
                    />
                    <span style={{ fontWeight: 600, color: '#333', fontSize: '1rem' }}>Set Reminder for Next Payment</span>
                  </label>
                  {form.setReminder && (
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                      <input
                        type="date"
                        name="reminderDate"
                        value={form.reminderDate}
                        onChange={handleChange}
                        style={{ padding: '0.8rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                      />
                      <input
                        type="time"
                        name="reminderTime"
                        value={form.reminderTime}
                        onChange={handleChange}
                        style={{ padding: '0.8rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                      />
                    </div>
                  )}
                </div>

                {/* Split Expense */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="splitExpense"
                      checked={form.splitExpense}
                      onChange={handleChange}
                      style={{ width: '20px', height: '20px' }}
                    />
                    <span style={{ fontWeight: 600, color: '#333', fontSize: '1rem' }}>Split this expense with family members</span>
                  </label>
                  {form.splitExpense && (
                    <input
                      type="text"
                      name="splitMembers"
                      value={form.splitMembers}
                      onChange={handleChange}
                      placeholder="Enter names/emails separated by commas"
                      style={{
                        marginTop: '1rem',
                        width: '100%',
                        padding: '0.8rem',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  )}
                </div>

                {/* Photo Upload */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#333', fontSize: '1rem' }}>Upload Bill/Receipt</label>
                  <input
                    type="file"
                    name="billImage"
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading ? '#ccc' : 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '1.2rem 2.5rem',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
                    transition: 'transform 0.2s',
                    minWidth: '160px'
                  }}
                  onMouseOver={e => !loading && (e.target.style.transform = 'translateY(-2px)')}
                  onMouseOut={e => !loading && (e.target.style.transform = 'translateY(0)')}
                >
                  {loading ? 'Saving...' : '💾 Save Expense'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setForm({
                    user_name: user?.name || "",
                    email: user?.email || "",
                    category: "",
                    amount: "",
                    payment_mode: "",
                    description: "",
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
                    recurring: false,
                    recurringType: "monthly",
                    setReminder: false,
                    reminderDate: "",
                    reminderTime: "",
                    splitExpense: false,
                    splitMembers: "",
                    billImage: null
                  })}
                  style={{
                    background: '#f5f5f5',
                    color: '#333',
                    border: '2px solid #ddd',
                    padding: '1.2rem 2.5rem',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: '160px'
                  }}
                  onMouseOver={e => (e.target.style.background = '#e0e0e0')}
                  onMouseOut={e => (e.target.style.background = '#f5f5f5')}
                >
                  🔄 Reset Form
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  style={{
                    background: 'transparent',
                    color: '#1976d2',
                    border: '2px solid #1976d2',
                    padding: '1.2rem 2.5rem',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: '160px'
                  }}
                  onMouseOver={e => (e.target.style.background = '#1976d2', e.target.style.color = 'white')}
                  onMouseOut={e => (e.target.style.background = 'transparent', e.target.style.color = '#1976d2')}
                >
                  🏠 Back to Dashboard
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Category Expenses */}
          <div>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
              <h3 style={{ margin: '0 0 2rem 0', color: '#333', fontSize: '1.4rem', textAlign: 'center', fontWeight: 700 }}>� Expense Categories</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {CATEGORIES.map(category => {
                  const categoryTotal = categoryExpenses[category.value].reduce((sum, expense) => sum + expense.amount, 0);
                  const expenseCount = categoryExpenses[category.value].length;
                  
                  return (
                    <div key={category.value} style={{ 
                      background: '#f8f9fa', 
                      borderRadius: '12px',
                      border: '1px solid #e1e5e9',
                      transition: 'all 0.2s'
                    }}>
                      <div style={{
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '1rem 1.2rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <span style={{ fontSize: '1.4rem' }}>{category.icon}</span>
                          <span style={{ fontWeight: 600, color: '#333', fontSize: '1rem' }}>{category.label}</span>
                          {expenseCount > 0 && (
                            <span style={{ 
                              background: '#1976d2', 
                              color: 'white', 
                              borderRadius: '50%', 
                              width: '20px', 
                              height: '20px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}>
                              {expenseCount}
                            </span>
                          )}
                        </div>
                        <div style={{ 
                          fontWeight: 700, 
                          color: categoryTotal > 0 ? '#e91e63' : '#666', 
                          fontSize: '1rem',
                          minWidth: '80px',
                          textAlign: 'right'
                        }}>
                          ₹{categoryTotal.toLocaleString()}
                        </div>
                      </div>
                      
                      {/* Show individual expenses for this category */}
                      {categoryExpenses[category.value].length > 0 && (
                        <div style={{ 
                          borderTop: '1px solid #e1e5e9', 
                          padding: '0.8rem 1.2rem' 
                        }}>
                          {categoryExpenses[category.value].slice(-3).map((expense) => (
                            <div key={expense.id} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.5rem',
                              fontSize: '0.85rem',
                              color: '#666'
                            }}>
                              <span>{expense.description || 'No description'}</span>
                              <span style={{ fontWeight: 600, color: '#e91e63' }}>₹{expense.amount}</span>
                            </div>
                          ))}
                          {categoryExpenses[category.value].length > 3 && (
                            <div style={{ fontSize: '0.75rem', color: '#999', textAlign: 'center', marginTop: '0.5rem' }}>
                              +{categoryExpenses[category.value].length - 3} more expenses
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Total Summary */}
              <div style={{ 
                marginTop: '2rem', 
                padding: '1.5rem', 
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', 
                borderRadius: '16px',
                color: 'white',
                textAlign: 'center'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 600 }}>Monthly Total</h4>
                <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>₹{monthlyTotal.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: 'rgba(255,255,255,0.95)', padding: '3rem 2rem', textAlign: 'center', borderTop: '1px solid #e1e5e9', marginTop: '4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <img src="https://img.icons8.com/color/32/000000/money-bag.png" alt="FinPal Logo" style={{ width: 28, height: 28 }} />
              <span style={{ fontWeight: 700, color: '#1976d2', fontSize: '1.2rem' }}>FinPal</span>
            </div>
            <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
              {NAV_LINKS.map(link => (
                <a key={link.name} href={link.href} style={{ color: '#666', textDecoration: 'none', fontSize: '1rem', fontWeight: 500 }}>
                  {link.name}
                </a>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #e1e5e9', paddingTop: '1.5rem', color: '#666', fontSize: '1rem' }}>
            © 2025 FinPal – Smart Budgeting App. Designed for families to manage expenses efficiently and track personal budgets.
          </div>
        </div>
      </footer>
    </div>
  );
}
