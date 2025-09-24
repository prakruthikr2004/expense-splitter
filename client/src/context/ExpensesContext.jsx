import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const ExpensesContext = createContext();

export const ExpensesProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch expenses from backend
  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${process.env.VITE_API_URL}/api/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses", err);
    }
  };

  // Add new expense (just call API, socket will update state)
  const addExpense = async (expense) => {
    try {
      await axios.post(`${process.env.VITE_API_URL}/api/expenses`, expense, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Error adding expense", err);
    }
  };

  // Delete expense (just call API, socket will update state)
  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${process.env.VITE_API_URL}/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Error deleting expense", err);
    }
  };

  useEffect(() => {
    if (token) fetchExpenses();
  }, [token]);

  return (
    <ExpensesContext.Provider value={{ expenses, setExpenses, addExpense, deleteExpense }}>
      {children}
    </ExpensesContext.Provider>
  );
};
