import React from "react";
import { Link } from "react-router-dom";

export default function Breadcrumbs({ items = [] }) {
  return (
    <div style={styles.wrap}>
      {items.map((it, idx) => (
        <span key={idx} style={styles.item}>
          {it.to ? (
            <Link to={it.to} style={styles.link}>
              {it.label}
            </Link>
          ) : (
            <span style={styles.current}>{it.label}</span>
          )}

          {idx !== items.length - 1 && <span style={styles.sep}>⟩</span>}
        </span>
      ))}
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "white",
    fontWeight: 799,
    fontSize: 15,
    whiteSpace: "nowrap",
  },
  item: { display: "flex", alignItems: "center", gap: 8 },
  link: {
    color: "white",
    textDecoration: "none",
    opacity: 1,
  },
  current: { color: "white", opacity: 0.85 },
  sep: { opacity: 0.7 },
};
