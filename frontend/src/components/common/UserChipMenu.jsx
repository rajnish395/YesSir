// ===============================
// File: frontend/src/components/common/UserChipMenu.jsx
// Purpose: Simple professional chip + dropdown (Logout only)
// ===============================

import React, { useEffect, useRef, useState } from "react";

export default function UserChipMenu() {
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      {/* ✅ Chip Button (Tag style) */}
      <button
        type="button"
        style={styles.chipBtn}
        onClick={() => setOpen((p) => !p)}
      >
        <span style={styles.userIcon}>👤</span>

        <span style={styles.chipText}>
          {user?.name || "User"}
          {user?.admissionId ? ` (${user.admissionId})` : ""}
        </span>

        <span style={styles.arrow}>{open ? "▲" : "▼"}</span>
      </button>

      {/* ✅ Dropdown (Logout only) */}
      {open && (
        <div style={styles.menu}>
          <button type="button" style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    position: "relative",
    display: "inline-block",
  },

  // ✅ Chip = Tag style (clean)
  chipBtn: {
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "white",
    padding: "9px 12px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
  },

  userIcon: {
    fontSize: 14,
    lineHeight: 1,
  },

  chipText: {
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: "0.2px",
  },

  arrow: {
    fontSize: 10,
    opacity: 0.9,
    marginLeft: 2,
  },

  // ✅ Dropdown container
  menu: {
    position: "absolute",
    top: "120%",
    right: 0,
    width: 190,
    background: "white",
    borderRadius: 14,
    boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    zIndex: 999,
  },

  // ✅ Logout button (professional)
  logoutBtn: {
    width: "100%",
    textAlign: "center",
    padding: "11px 12px",
    background: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
    color: "#dc2626",
  },
};
