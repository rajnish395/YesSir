// ===============================
// File: frontend/src/components/common/DashboardTabsRow.jsx
// Purpose: Clean tabs row below dashboard header
// ===============================

import React from "react";

export default function DashboardTabsRow({ tabs = [], active, onChange }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.inner}>
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            style={{
              ...styles.tab,
              ...(active === t.value ? styles.activeTab : {}),
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    padding: "0 18px 12px",
    background: "#f3f6fb",
  },
  inner: {
    display: "inline-flex",
    gap: 8,
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 999,
    padding: 6,
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  },
  tab: {
    padding: "10px 14px",
    borderRadius: 999,
    border: "none",
    background: "transparent",
    fontWeight: 900,
    fontSize: 13,
    cursor: "pointer",
    color: "#334155",
  },
  activeTab: {
    background: "#2563eb",
    color: "white",
  },
};
