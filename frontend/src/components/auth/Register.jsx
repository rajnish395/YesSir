// ===============================
// File: frontend/src/components/Register.jsx
// Purpose: Register Page for yesSir Project
// Features:
// 1) Takes name, email, password and role input
// 2) Sends register request to backend
// 3) On success -> redirects user to login page
// Note: Role selection includes Admin also (depends on backend restrictions)
// ===============================

import React, { useState } from "react";
import API from "../../services/api"; // ✅ Axios instance for backend API calls

export default function Register() {
  /* ===============================
     STATE: Form Inputs
     - Controlled state for register form fields
     - role default is "student"
  =============================== */
  const [name, setName] = useState(""); // ✅ full name input
  const [email, setEmail] = useState(""); // ✅ email input
  const [password, setPassword] = useState(""); // ✅ password input
  const [role, setRole] = useState("student"); // ✅ role selection dropdown state

  /* ===============================
     FUNCTION: Handle Register Submit
     API: POST /auth/register
     - Sends user registration data to backend
     - Redirects to login page after success
  =============================== */
  const submit = async (e) => {
    e.preventDefault(); // ✅ prevent page reload on submit

    try {
      // ✅ Backend request to create a new user account
      await API.post("/auth/register", { name, email, password, role });

      // ✅ Redirect to login after successful registration
      window.location.href = "/login";
    } catch (err) {
      // ✅ Handles backend/validation errors
      alert("Error registering user");
    }
  };

  return (
    <div style={styles.page} className="page">
      {/* ✅ Register card UI container */}
      <div style={styles.card}>
        {/* ✅ Page heading */}
        <h2 style={styles.title}>Register</h2>

        {/* ✅ Register form */}
        <form onSubmit={submit} style={styles.form}>
          {/* ===============================
              INPUT: Full Name
              - Controlled input (name state)
          =============================== */}
          <input
            type="text"
            placeholder="Full Name"
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)} // ✅ update name state
          />

          {/* ===============================
              INPUT: Email
              - Controlled input (email state)
          =============================== */}
          <input
            type="email"
            placeholder="Email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)} // ✅ update email state
          />

          {/* ===============================
              INPUT: Password
              - Controlled input (password state)
              - type=password hides the typed text
          =============================== */}
          <input
            type="password"
            placeholder="Password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)} // ✅ update password state
          />

          {/* ===============================
              SELECT: Role
              - Allows user/admin to select role
              - Default "student"
              - Includes student/faculty/coordinator/admin
          =============================== */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)} // ✅ update role state
            style={styles.input}
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="coordinator">Coordinator</option>
            <option value="admin">Admin</option>
          </select>

          {/* ✅ Submit button triggers submit() */}
          <button style={styles.button}>Register</button>
        </form>
      </div>
    </div>
  );
}

/* ===============================
   INLINE STYLES
   - Centered card form layout
   - Simple clean register UI
=============================== */
const styles = {
  // Page wrapper for centered card
  page: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "80px",
  },

  // Card container styling
  card: {
    width: "400px",
    background: "white",
    padding: "35px",
    borderRadius: "12px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    border: "1px solid #eee",
  },

  // Heading style
  title: {
    textAlign: "center",
    marginBottom: "25px",
    fontWeight: "600",
    color: "#333",
  },

  // Form layout
  form: {
    display: "flex",
    flexDirection: "column",
  },

  // Inputs & dropdown styling
  input: {
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },

  // Register button (green)
  button: {
    padding: "12px",
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
  },
};
