import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AddExpense from "./pages/AddExpense";
import ExpensesList from "./pages/ExpensesList";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import FamilyMode from "./pages/FamilyMode";
import { useTranslation } from 'react-i18next';
import RequireAuth from "./RequireAuth";

function App() {
  const { t, i18n } = useTranslation();
  return (
    <Router>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        } />
        <Route path="/add-expense" element={
          <RequireAuth>
            <AddExpense />
          </RequireAuth>
        } />
        <Route path="/expenses-list" element={
          <RequireAuth>
            <ExpensesList />
          </RequireAuth>
        } />
        <Route path="/settings" element={
          <RequireAuth>
            <Settings />
          </RequireAuth>
        } />
        <Route path="/profile" element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        } />
        <Route path="/family-mode" element={
          <RequireAuth>
            <FamilyMode />
          </RequireAuth>
        } />
        <Route path="/" element={<Navigate to="/welcome" />} />
        <Route path="*" element={<Navigate to="/welcome" />} />
      </Routes>
    </Router>
  );
}

export default App;
