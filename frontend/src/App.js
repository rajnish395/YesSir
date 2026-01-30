// ===============================
// File: frontend/src/App.js
// Purpose: Main Routing File for yesSir Project (React Router)
// Features:
// 1) Defines all app routes (Home, Auth, Dashboards, Public Event Form)
// 2) Role-based routing (Student/Faculty/Coordinator/Admin)
// 3) Reads token + user from localStorage for authentication checks
// 4) Provides logout function to clear session
// ===============================

import React from "react";
import { Routes, Route } from "react-router-dom"; // ✅ React Router route definitions

// ===============================
// AUTH PAGES (Login/Register)
// ===============================
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import RoleRoute from "./components/common/RoleRoute";


// ===============================
// STUDENT MODULE
// ===============================
import ApplyOD from "./components/student/ApplyOD";
import StudentDashboard from "./components/student/StudentDashboard";

// ===============================
// FACULTY MODULE
// ===============================
import FacultyDashboard from "./components/faculty/FacultyDashboard";

// ===============================
// COORDINATOR MODULE
// ===============================
import CoordinatorDashboard from "./components/coordinator/CoordinatorDashboard";

// ===============================
// ADMIN MODULE
// ===============================
import AdminDashboard from "./admin/AdminDashboard";

// ===============================
// PUBLIC EVENT FORM (QR based attendance submission page)
// ===============================
import EventAttendanceForm from "./pages/EventAttendanceForm";

// ===============================
// HOME / LANDING PAGE
// ===============================
import Home from "./pages/Home";

function App() {
  /* ===============================
     AUTH SESSION DATA
     - token: JWT stored after login
     - user: logged in user details stored in localStorage
  =============================== */
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  /* ===============================
     FUNCTION: Logout
     - Clears auth session data
     - Redirects user to Home page
  =============================== */
  const logout = () => {
    localStorage.removeItem("token"); // ✅ remove JWT token
    localStorage.removeItem("user"); // ✅ remove user info
    window.location.href = "/"; // ✅ redirect to homepage
  };

  return (
    <Routes>
      {/* ===============================
          HOME ROUTE
          - Landing page shows login form OR dashboard buttons depending on token
      =============================== */}
      <Route
        path="/"
        element={<Home token={token} user={user} logout={logout} />}
      />

      {/* ===============================
          AUTH ROUTES
          - Login + Register pages
      =============================== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ===============================
          PUBLIC EVENT FORM ROUTE
          - Accessed by QR scan on mobile
          - Dynamic param: :eventId
      =============================== */}
      <Route
        path="/event-form/:eventId"
        element={<EventAttendanceForm />}
      />

      {/* ===============================
          STUDENT ROUTES (Protected by Role)
          - Only visible if token exists AND role = student
      =============================== */}
      {/* 🎓 STUDENT ROUTES */}
<Route
  path="/student"
  element={
    <RoleRoute allowedRoles={["student"]}>
      <StudentDashboard />
    </RoleRoute>
  }
/>

<Route
  path="/apply"
  element={
    <RoleRoute allowedRoles={["student"]}>
      <ApplyOD />
    </RoleRoute>
  }
/>

{/* 👨‍🏫 FACULTY ROUTES */}
<Route
  path="/faculty"
  element={
    <RoleRoute allowedRoles={["faculty"]}>
      <FacultyDashboard />
    </RoleRoute>
  }
/>

{/* 🛠 COORDINATOR ROUTES */}
<Route
  path="/coordinator"
  element={
    <RoleRoute allowedRoles={["coordinator"]}>
      <CoordinatorDashboard />
    </RoleRoute>
  }
/>

{/* 🛠 ADMIN ROUTES */}
<Route
  path="/admin"
  element={
    <RoleRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </RoleRoute>
  }
/>

    </Routes>
  );
}

export default App; // ✅ export App component
