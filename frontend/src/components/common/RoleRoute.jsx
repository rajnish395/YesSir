// ===============================
// File: frontend/src/components/common/RoleRoute.jsx
// Purpose: Role based route protection for yesSir Project
// Features:
// - If token missing -> redirect to "/"
// - If role mismatch -> redirect to "/"
// - If role matches -> render children
// ===============================

import React from "react";
import { Navigate } from "react-router-dom";

export default function RoleRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // ✅ Not logged in -> go home
  if (!token) return <Navigate to="/" />;

  // ✅ If role not allowed -> go home
  if (!user?.role || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
    return <Navigate to="/" />;
  }

  return children;
}
