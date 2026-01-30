// ===============================
// File: frontend/src/pages/Home.jsx
// Purpose: Home / Landing Page for yesSir Project
// ✅ FIXED: No mediator page, direct dashboard redirect after login
// ✅ FIXED: No flash/blink on already logged-in users (loader shown)
// ===============================

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ direct redirect
import API from "../services/api"; // ✅ Axios instance for backend calls

// ✅ Detect mobile screen size (used to adjust styling)
const isMobile = window.innerWidth <= 600;

export default function Home() {
  const navigate = useNavigate();

  // ✅ Always read latest token/user from localStorage
  const freshToken = localStorage.getItem("token");
  const freshUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // ✅ UI loader to prevent flash
  const [checking, setChecking] = useState(true);

  // ✅ Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ If already logged in -> redirect without flash
  useEffect(() => {
    if (freshToken && freshUser?.role) {
      const path =
        freshUser.role === "admin"
          ? "/admin"
          : freshUser.role === "coordinator"
          ? "/coordinator"
          : freshUser.role === "student"
          ? "/student"
          : freshUser.role === "faculty"
          ? "/faculty"
          : "/";

      navigate(path, { replace: true });
      return;
    }

    // ✅ if not logged in, show login page
    setChecking(false);
  }, [freshToken, freshUser?.role, navigate]);

  // ✅ LOGIN FUNCTION
  const submitLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim() || !password.trim()) {
      alert("Email and Password are required");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ Direct redirect to dashboard (NO mediator page)
      const role = res.data.user.role;

      const path =
        role === "admin"
          ? "/admin"
          : role === "coordinator"
          ? "/coordinator"
          : role === "student"
          ? "/student"
          : role === "faculty"
          ? "/faculty"
          : "/";

      navigate(path, { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loader screen (prevents flash)
  if (checking) {
    return (
      <div className="App page">
        <header
          className="App-header"
          style={{
            ...styles.headerBase,
            ...styles.headerWithLogin,
          }}
        >
          <img src="/YesSir_logo.png" alt="YesSir Logo" className="app-logo" />

          {/* ✅ Same place text (logo ke niche) */}
          <nav style={{ marginTop: 14 }}>
            <span style={{ fontWeight: 600, color: "rgba(232, 232, 232, 0.9)" }}>
              Please Login to continue
            </span>
          </nav>

          <div style={styles.loginInline}>
            <h2 style={styles.loginTitle}>Redirecting...</h2>

            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>
              Please wait...
            </div>
          </div>

          <p style={{ marginTop: 18, color: "rgba(255,255,255,0.8)" }}>
            Welcome to Quantum University
          </p>
        </header>
      </div>
    );
  }

  // ✅ Login Page UI
  return (
    <div className="App page">
      <header
        className="App-header"
        style={{
          ...styles.headerBase,
          ...styles.headerWithLogin,
        }}
      >
        {/* ✅ LOGO */}
        <img src="/YesSir_logo.png" alt="YesSir Logo" className="app-logo" />

        {/* ✅ SAME PLACE TEXT */}
        <nav style={{ marginTop: 14 }}>
          <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
            Please Login to continue
          </span>
        </nav>

        {/* ✅ LOGIN FORM */}
        <div style={styles.loginInline}>
          <h2 style={styles.loginTitle}>Login</h2>

          <form onSubmit={submitLogin} style={styles.form}>
            <input
              className="login-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />

            <input
              className="login-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />

            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        <p style={{ marginTop: 18, color: "rgba(255,255,255,0.8)" }}>
          Welcome to Quantum University
        </p>
      </header>
    </div>
  );
}

/* ===============================
   INLINE STYLES (UI only)
=============================== */
const styles = {
  headerBase: {
    width: isMobile ? "90%" : "90%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    padding: "30px 20px",
    borderRadius: isMobile ? 0 : 0,
    marginRight: isMobile ? 20 : 25,
  },

  headerWithLogin: {
    minHeight: isMobile ? "82vh" : "76vh",
  },

  loginInline: {
    width: "100%",
    maxWidth: 360,
    marginTop: 12,
    paddingTop: 14,
    borderTop: "1px solid rgba(255,255,255,0.25)",
  },

  loginTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 10,
    textAlign: "center",
    color: "white",
    opacity: 0.95,
  },

  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 10,
    border: "1px solid rgb(255, 255, 255)",
    background: "rgba(110, 109, 109, 0.1)",
    color: "white",
    fontSize: 14,
    outline: "none",
  },

  btn: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 10,
    border: "none",
    background: "white",
    color: "#0051ff",
    fontWeight: 798,
    cursor: "pointer",
    fontSize: 16,
  },
};
