import React, { useEffect, useState } from "react";

export default function ExpensesList() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/expenses")
      .then(res => res.json())
      .then(data => setExpenses(data));
  }, []);

  return (
    <div>
      <h2>Expenses</h2>
      <ul>
        {expenses.map(exp => (
          <li key={exp.id || exp.email + exp.amount}>
            {exp.user_name} - {exp.category} - ₹{exp.amount} ({exp.payment_mode})
          </li>
        ))}
      </ul>
    </div>
  );
}
