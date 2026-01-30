// ===============================
// File: frontend/src/components/common/PrivateRoute.jsx
// Purpose: Route Protection (Auth Guard) for yesSir Project
// Feature:
// 1) Checks if JWT token exists in localStorage
// 2) If token missing -> redirect user to /login
// 3) If token present -> allow access to protected route
// Usage Example:
// <PrivateRoute><Dashboard /></PrivateRoute>
// ===============================

import React from "react";
import { Navigate } from "react-router-dom"; // ✅ Used to redirect to another route

export default function PrivateRoute({ children }) {
  // ✅ Get token from localStorage (set during login)
  const token = localStorage.getItem("token");

  // ✅ If token not present => user not logged in => redirect to login page
  if (!token) return <Navigate to="/login" />;

  // ✅ If token exists => allow rendering of protected component/page
  return children;
}
