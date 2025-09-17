import React from "react";
import ReactDOM from "react-dom/client";
import './theme.css';
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import App from "./App.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import DashboardLayout from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Expenses from "./pages/Expenses.jsx";
import Groups from "./pages/Groups.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { ExpensesProvider } from "./context/ExpensesContext.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import GroupExpenses from "./pages/GroupExpensePage.jsx";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <UserProvider>
  <BrowserRouter>
    <Routes>
      {/* Landing / Home */}
      <Route path="/" element={<App />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Dashboard with nested routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ExpensesProvider>
              <DashboardLayout />
            </ExpensesProvider>
          </ProtectedRoute>
        }
      >
        {/* Default redirect inside dashboard */}
        <Route index element={<Navigate to="home" replace />} />

        {/* Dashboard sections */}
        <Route path="home" element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="groups" element={<Groups />} />

        {/* Group expenses page (nested under groups) */}
        <Route path="groups/:id/expenses" element={<GroupExpenses />} />
      </Route>
    </Routes>
  </BrowserRouter>
  </UserProvider>
);
