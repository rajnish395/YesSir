import React, { useState } from "react";

export default function RSVPBox() {
  const [enabled, setEnabled] = useState(false);

  const [expectedCount, setExpectedCount] = useState("");
  const [note, setNote] = useState("");
  const [deadline, setDeadline] = useState("");
  const [limitPerSection, setLimitPerSection] = useState(false);

  if (!enabled) {
    return (
      <div style={styles.box}>
        <p style={styles.text}>
          RSVP helps you estimate attendance before starting QR.
        </p>

        <button style={styles.primaryBtn} onClick={() => setEnabled(true)}>
          Enable RSVP
        </button>

        <p style={styles.helper}>
          ✅ After event starts, RSVP box will hide automatically (later we link it).
        </p>
      </div>
    );
  }

  return (
    <div style={styles.box}>
      <div style={styles.row}>
        <div style={styles.col}>
          <label style={styles.label}>Expected Students</label>
          <input
            type="number"
            min="0"
            placeholder="e.g. 60"
            value={expectedCount}
            onChange={(e) => setExpectedCount(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.col}>
          <label style={styles.label}>RSVP Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={styles.input}
          />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={styles.label}>Note (optional)</label>
        <input
          placeholder="e.g. Only 2nd year students"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.toggleRow}>
        <input
          type="checkbox"
          checked={limitPerSection}
          onChange={() => setLimitPerSection((p) => !p)}
        />
        <span style={styles.toggleText}>
          Limit RSVP by Section (future)
        </span>
      </div>

      <div style={styles.actions}>
        <button
          style={styles.saveBtn}
          onClick={() => alert("✅ RSVP saved (frontend only for now)")}
        >
          Save RSVP
        </button>

        <button style={styles.cancelBtn} onClick={() => setEnabled(false)}>
          Disable
        </button>
      </div>

      <p style={styles.helper}>
        ⚡ Next step: backend me RSVP store + attendance dashboard me show.
      </p>
    </div>
  );
}

const styles = {
  box: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 14,
  },

  text: {
    fontSize: 13,
    fontWeight: 700,
    color: "#334155",
    marginBottom: 12,
  },

  helper: {
    marginTop: 10,
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
  },

  row: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },

  col: {
    flex: 1,
    minWidth: 150,
  },

  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 900,
    color: "#334155",
    marginBottom: 6,
  },

  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: 13,
    background: "white",
  },

  toggleRow: {
    marginTop: 12,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  toggleText: {
    fontSize: 12,
    fontWeight: 800,
    color: "#0f172a",
  },

  actions: {
    display: "flex",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
  },

  primaryBtn: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },

  saveBtn: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 12,
    border: "none",
    background: "#16a34a",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },

  cancelBtn: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #dc2626",
    background: "white",
    color: "#dc2626",
    fontWeight: 900,
    cursor: "pointer",
  },
};
