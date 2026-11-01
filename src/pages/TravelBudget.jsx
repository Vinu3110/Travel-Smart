
import React, { useEffect, useState } from "react";
import "./TravelTools.css";

function TravelBudget() {
  const [budget, setBudget] = useState(() => {
    return localStorage.getItem("travelSmartBudget") || "";
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("travelSmartExpenses") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  useEffect(() => {
    localStorage.setItem("travelSmartBudget", budget);
  }, [budget]);

  useEffect(() => {
    localStorage.setItem(
      "travelSmartExpenses",
      JSON.stringify(expenses)
    );
  }, [expenses]);

  const addExpense = (e) => {
    e.preventDefault();

    const value = Number(amount);

    if (!title.trim() || !Number.isFinite(value) || value <= 0) {
      return;
    }

    setExpenses((previous) => [
      ...previous,
      {
        id: Date.now(),
        title: title.trim(),
        amount: value,
        category
      }
    ]);

    setTitle("");
    setAmount("");
  };

  const deleteExpense = (id) => {
    setExpenses((previous) =>
      previous.filter((expense) => expense.id !== id)
    );
  };

  const totalSpent = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const budgetValue = Number(budget) || 0;
  const remaining = budgetValue - totalSpent;
  const percentage = budgetValue > 0
    ? Math.min((totalSpent / budgetValue) * 100, 100)
    : 0;

  return (
    <div className="travel-tools">
      <h1>Travel Budget Tracker</h1>
      <p className="tool-description">
        Manage your trip expenses and stay within your budget.
      </p>

      <div className="tool-card">
        <label>Set your total budget</label>
        <input
          className="tool-input"
          type="number"
          min="0"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Enter budget in INR"
        />

        <div className="tool-list">
          <div className="tool-item">
            <p>Total Budget</p>
            <div className="tool-total">
              ₹{budgetValue.toFixed(2)}
            </div>
          </div>

          <div className="tool-item">
            <p>Total Spent</p>
            <div className="tool-total">
              ₹{totalSpent.toFixed(2)}
            </div>
          </div>

          <div className="tool-item">
            <p>Remaining</p>
            <div className="tool-total">
              ₹{remaining.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="tool-progress">
          <div
            className="tool-progress-bar"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {budgetValue > 0 && remaining < 0 && (
          <p className="tool-error">
            You have exceeded your budget!
          </p>
        )}
      </div>

      <div className="tool-card">
        <h3>Add an Expense</h3>

        <form className="tool-form" onSubmit={addExpense}>
          <input
            className="tool-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Expense name"
          />

          <input
            className="tool-input"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in INR"
          />

          <select
            className="tool-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Food</option>
            <option>Transport</option>
            <option>Hotel</option>
            <option>Shopping</option>
            <option>Activities</option>
            <option>Other</option>
          </select>

          <button className="tool-button">Add Expense</button>
        </form>
      </div>

      <div className="tool-card">
        <h3>Expense History</h3>

        {expenses.length === 0 ? (
          <p className="tool-message">No expenses added yet.</p>
        ) : (
          expenses.map((expense) => (
            <div className="tool-row" key={expense.id}>
              <div>
                <strong>{expense.title}</strong>
                <p>{expense.category}</p>
              </div>

              <strong>₹{expense.amount.toFixed(2)}</strong>

              <button
                className="tool-button danger"
                onClick={() => deleteExpense(expense.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TravelBudget;
