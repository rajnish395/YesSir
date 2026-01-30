// ===============================
// File: frontend/src/components/common/HeaderBackButton.jsx
// Purpose: Left side back button for dashboards
// ===============================

import React from "react";

export default function HeaderBackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      style={styles.btn}
      title="Go Back"
    >
      ← Back
    </button>
  );
}

const styles = {
  btn: {
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "white",
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};
