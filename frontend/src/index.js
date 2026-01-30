// ===============================
// File: frontend/src/index.js
// Purpose: React App Entry Point for yesSir Project
// Features:
// 1) Creates React root using createRoot()
// 2) Wraps the entire app inside BrowserRouter (React Router enabled)
// 3) Renders <App /> as the main component
// 4) Passes multiple components as props to App (currently unused in App.js routes)
// 5) Imports global App.css styling
// ===============================

import React from "react";
import { createRoot } from "react-dom/client"; // ✅ React 18 root rendering
import { BrowserRouter } from "react-router-dom"; // ✅ enables routing across app

/* ===== EXISTING IMPORTS (UNCHANGED) ===== */
// ✅ Main app routes component
import App from "./App";

// ✅ Auth components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// ✅ Student components
import ApplyOD from "./components/student/ApplyOD";
import StudentDashboard from "./components/student/StudentDashboard";

// ✅ Faculty dashboard
import FacultyDashboard from "./components/faculty/FacultyDashboard";

// ✅ Common protected route wrapper
import PrivateRoute from "./components/common/PrivateRoute";

// ✅ Coordinator dashboard
import CoordinatorDashboard from "./components/coordinator/CoordinatorDashboard";

// ✅ Admin dashboard
import AdminDashboard from "./admin/AdminDashboard";

// ✅ Global app CSS
import "./App.css";

/* ===== ROOT RENDER ===== */
// ✅ Mount the React app into <div id="root"></div> in public/index.html
createRoot(document.getElementById("root")).render(
  // ✅ BrowserRouter provides routing context for the entire app
  <BrowserRouter>
    {/* ✅ App is rendered as the main component */}
    <App
      // ✅ Passing components as props (kept unchanged)
      // Note: In current App.js, these props are not used directly,
      // but keeping them as-is as per existing structure.
      Login={Login}
      Register={Register}
      ApplyOD={ApplyOD}
      FacultyDashboard={FacultyDashboard}
      StudentDashboard={StudentDashboard}
      PrivateRoute={PrivateRoute}
      CoordinatorDashboard={CoordinatorDashboard}
      AdminDashboard={AdminDashboard}
    />
  </BrowserRouter>
);
