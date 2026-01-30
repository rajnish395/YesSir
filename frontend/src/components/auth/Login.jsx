// ===============================
// File: frontend/src/components/Login.jsx
// Purpose: Login Page for yesSir Project
// Features:
// 1) Takes email + password input
// 2) Sends login request to backend
// 3) Stores JWT token + user details in localStorage
// 4) Redirects user based on role after successful login
// ===============================

import React, { useState } from "react";
import API from "../../services/api"; // ✅ Axios instance for backend API calls

export default function Login() {
  /* ===============================
     STATE: Email + Password inputs
     - Controlled input states for login form
  =============================== */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* ===============================
     FUNCTION: Handle Login Submit
     API: POST /auth/login
     - Sends email/password to backend
     - Stores token + user info in localStorage
     - Redirects based on role
  =============================== */
  const submit = async (e) => {
    e.preventDefault(); // ✅ stop page reload on form submit

    try {
      // ✅ Login request to backend
      const res = await API.post("/auth/login", { email, password });

      // ✅ Store JWT token for authenticated requests
      localStorage.setItem("token", res.data.token);

      // ✅ Store user object so frontend can show role/name etc.
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ Role-based redirection after login
      // Note: currently all roles redirect to "/"
      if (res.data.user.role === "student") window.location.href = "/";
      else if (res.data.user.role === "faculty") window.location.href = "/";
      else if (res.data.user.role === "coordinator") window.location.href = "/";
      else if (res.data.user.role === "admin") window.location.href = "/";
    } catch (err) {
      // ✅ If login fails (wrong credentials / server error)
      alert("Invalid Credentials");
    }
  };

  return (
    <div style={styles.page} className="page">
      {/* ✅ Login card container */}
      <div style={styles.card}>
        {/* ✅ Page heading */}
        <h2 style={styles.title}>Login</h2>

        {/* ✅ Login form */}
        <form onSubmit={submit} style={styles.form}>
          {/* ===============================
              INPUT: Email
              - Controlled by email state
              - type=email ensures email format input UI
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
              - Controlled by password state
              - type=password hides typed characters
          =============================== */}
          <input
            type="password"
            placeholder="Password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)} // ✅ update password state
          />

          {/* ✅ Submit button triggers submit() */}
          <button style={styles.button}>Login</button>
        </form>
      </div>
    </div>
  );
}

/* ===============================
   INLINE STYLES
   - Styles are defined in same file
   - Used for centered card UI and clean form styling
=============================== */
const styles = {
  // Page wrapper centers the login card
  page: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "80px",
  },

  // Card container styling
  card: {
    width: "350px",
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    border: "1px solid #eee",
  },

  // Login title styling
  title: {
    textAlign: "center",
    marginBottom: "25px",
    fontWeight: "600",
    color: "#333",
  },

  // Form layout = vertical stack
  form: {
    display: "flex",
    flexDirection: "column",
  },

  // Input fields styling
  input: {
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },

  // Button styling (primary action)
  button: {
    padding: "12px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
  },
};
