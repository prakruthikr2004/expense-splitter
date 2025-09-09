import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const ExpensesContext = createContext();

export const ExpensesProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch expenses from backend
  const fetchExpenses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses", err);
    }
  };

  // Add new expense
  const addExpense = async (expense) => {
    try {
      const res = await axios.post("http://localhost:5000/api/expenses", expense, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses([res.data, ...expenses]);
    } catch (err) {
      console.error("Error adding expense", err);
    }
  };

  // Delete expense
  const deleteExpense = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(expenses.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Error deleting expense", err);
    }
  };

  useEffect(() => {
    if (token) fetchExpenses();
  }, [token]);

  return (
    <ExpensesContext.Provider value={{ expenses, addExpense, deleteExpense }}>
      {children}
    </ExpensesContext.Provider>
  );
};
