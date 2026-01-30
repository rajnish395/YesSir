// ===============================
// File: frontend/src/components/faculty/EventDashboard.jsx
// Purpose: Faculty Event OD Dashboard for yesSir Project
// Features:
// 1) Fetches all OD requests from backend
// 2) Filters only Event-based OD entries (where eventTag exists)
// 3) Displays OD records in a table with status color coding
// ===============================

import React, { useEffect, useState } from "react";
import API from "../../services/api"; // ✅ Axios instance for backend API calls

export default function EventDashboard() {
  /* ===============================
     STATE: OD Requests List
     - ods stores the filtered OD entries (only event-based)
  =============================== */
  const [ods, setOds] = useState([]);

  /* ===============================
     FUNCTION: Load Event-based OD
     API: GET /od/all
     - Fetches all OD entries from backend
     - Filters only those which contain eventTag (event-based ODs)
  =============================== */
  const loadOD = async () => {
    try {
      // ✅ fetch all OD entries
      const res = await API.get("/od/all");

      // ✅ keep only event-based ODs (uploaded through Excel / event flows)
      setOds(res.data.filter((o) => o.eventTag));
    } catch (err) {
      // ✅ basic error logging
      console.log(err);
    }
  };

  /* ===============================
     ON MOUNT: Load OD once
     - Runs only once when component mounts
  =============================== */
  useEffect(() => {
    loadOD();
  }, []);

  return (
    <div style={page} className="page">
      {/* ✅ Main dashboard card container */}
      <div style={card}>
        {/* ✅ Page title */}
        <h1 style={heading}>Event OD Dashboard</h1>

        {/* ✅ Subtitle / description */}
        <p style={{ color: "#555", marginBottom: 20 }}>
          Track all Event-based OD generated through Excel Uploads
        </p>

        {/* ===============================
            TABLE: Event-based OD Listing
            - Shows Student info + event + approval status
        =============================== */}
        <div style={tableWrapper}>
          <table style={table}>
            {/* Table heading */}
            <thead>
              <tr style={theadRow}>
                <th style={th}>Student</th>
                <th style={th}>Admission ID</th>
                <th style={th}>Section</th>
                <th style={th}>Event</th>
                <th style={th}>Status</th>
              </tr>
            </thead>

            {/* Table body */}
            <tbody>
              {/* ✅ If no event-based OD data */}
              {ods.length === 0 ? (
                <tr>
                  <td colSpan={5} style={emptyText}>
                    No Event-based OD uploaded yet
                  </td>
                </tr>
              ) : (
                // ✅ Render all event ODs
                ods.map((o) => (
                  <tr key={o._id} style={row}>
                    {/* ✅ Student name (via populated studentId) */}
                    <td style={td}>{o.studentId?.name}</td>

                    {/* ✅ Student admissionId (QID) */}
                    <td style={td}>{o.studentId?.admissionId}</td>

                    {/* ✅ Student section */}
                    <td style={td}>{o.studentId?.section}</td>

                    {/* ✅ Event Tag / Event Name */}
                    <td style={td}>{o.eventTag}</td>

                    {/* ✅ Status with color coding */}
                    <td
                      style={{
                        ...td,
                        fontWeight: 700,
                        color:
                          o.status === "approved"
                            ? "#16a34a" // green
                            : o.status === "rejected"
                            ? "#dc2626" // red
                            : "#fb923c", // pending/orange
                      }}
                    >
                      {o.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ===============================
   INLINE STYLES (UI only)
   - Simple responsive centered card
   - Table with clean header + row separators
=============================== */

/* Page wrapper */
const page = {
  minHeight: "100vh",
  background: "#eef2f7",
  padding: "50px 30px",
  display: "flex",
  justifyContent: "center",
};

/* Card container */
const card = {
  width: "100%",
  maxWidth: "1050px",
  background: "white",
  padding: "35px 40px",
  borderRadius: "16px",
  boxShadow: "0 6px 28px rgba(0,0,0,0.08)",
  border: "1px solid #e5e7eb",
};

/* Main title */
const heading = {
  fontSize: 32,
  marginBottom: 8,
  fontWeight: 700,
  color: "#111827",
};

/* Table wrapper (scroll if needed) */
const tableWrapper = {
  overflowX: "auto",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  marginTop: 15,
};

/* Table base style */
const table = {
  width: "100%",
  borderCollapse: "collapse",
};

/* Table header row */
const theadRow = {
  background: "#f3f4f6",
  height: 55,
};

/* Table header cell */
const th = {
  padding: "12px 14px",
  fontWeight: 600,
  fontSize: 14,
  textAlign: "left",
  color: "#374151",
};

/* Table data row */
const row = {
  borderBottom: "1px solid #e5e7eb",
  height: 50,
};

/* Table data cell */
const td = {
  padding: "10px 14px",
  fontSize: 14,
  color: "#1f2937",
};

/* Empty state row style */
const emptyText = {
  padding: 20,
  textAlign: "center",
  color: "#6b7280",
  fontSize: 15,
  fontWeight: 500,
};
