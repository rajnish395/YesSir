// ===============================
// File: frontend/src/components/student/StudentDashboard.jsx
// Purpose: Student Dashboard for yesSir Project
// Features:
// 1) Shows logged-in student info (name + QID) in header
// 2) Student can APPLY OD (reason + from/to date + optional proof upload)
// 3) Loads student's OWN OD requests (non-eventTag) and shows in history table
// 4) Uses backend APIs:
//    - GET /od/all        -> fetch all OD requests
//    - POST /od/apply     -> submit new OD request (multipart/form-data)
// ===============================

import React, { useEffect, useState, useCallback } from "react";
import API from "../../services/api"; // ✅ Axios instance for backend requests
import UserChipMenu from "../common/UserChipMenu";
//import HeaderBackButton from "../common/HeaderBackButton";
import Breadcrumbs from "../common/BreadCrumbs";

export default function StudentDashboard() {
  /* =========================
     LOGGED-IN USER INFO
     - user details stored in localStorage during login
     - used for auto-filling QID and name
  ========================= */
  const user = JSON.parse(localStorage.getItem("user"));

  /* =========================
     OD TABLE STATE
     - ods: list of student's own OD requests
     - loading: table loading state
  ========================= */
  const [ods, setOds] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     APPLY OD FORM STATE
     - reason: OD reason string
     - fromDate/toDate: OD date range
     - proof: optional file (image/pdf)
     - submitting: submit button loader state
  ========================= */
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [proof, setProof] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /* =========================
     FUNCTION: Load Student OD Requests
     API: GET /od/all
     - Fetches all OD requests from backend
     - Filters:
        ✅ only OD requests of logged-in student
        ✅ excludes event-based OD entries (eventTag)
  ========================= */
  const loadMyODs = useCallback(async () => {
    try {
      const res = await API.get("/od/my");

      // ✅ Student ODs only (exclude eventTag)
      const myOD = res.data.filter((od) => !od.eventTag);
setOds(myOD);

      setOds(myOD); // ✅ update state
    } catch (err) {
      console.log("LOAD ERROR:", err);
    } finally {
      setLoading(false); // ✅ stop loading state
    }
  }, []);

  /* =========================
     ON MOUNT: Load OD requests
  ========================= */
  useEffect(() => {
    loadMyODs();
  }, [loadMyODs]);

  /* =========================
     FUNCTION: Submit OD Request
     API: POST /od/apply
     - Validates fields
     - Sends FormData (supports file upload)
     - On success:
        ✅ reset form
        ✅ reload OD table
  ========================= */
  const submitOD = async (e) => {
    e.preventDefault(); // ✅ prevent page reload
    if (submitting) return; // ✅ avoid double submit

    // ✅ Basic validations
    if (!reason.trim()) return alert("Reason is required");
    if (!fromDate) return alert("From Date is required");
    if (!toDate) return alert("To Date is required");

    try {
      setSubmitting(true); // ✅ start submit loader

      // ✅ Prepare multipart form data
      const formData = new FormData();
      formData.append("reason", reason);
      formData.append("fromDate", fromDate);
      formData.append("toDate", toDate);

      // ✅ Add proof file only if selected
      if (proof) formData.append("proof", proof);

      // ✅ Send apply OD request
      await API.post("/od/apply", formData);

      // ✅ reset form after success
      setReason("");
      setFromDate("");
      setToDate("");
      setProof(null);

      // ✅ reload OD history table
      await loadMyODs();

      alert("✅ OD Submitted Successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting OD");
    } finally {
      setSubmitting(false); // ✅ stop submit loader
    }
  };

  // ✅ loading UI while OD history is loading
  if (loading) return <h2 style={{ padding: 20 }}>Loading your OD...</h2>;

  return (
    <div style={styles.page} className="student-page">
      {/* =========================
          STICKY HEADER (Top)
          - Shows dashboard title + student name/QID chip
      ========================= */}
      <div style={styles.stickyHeader} className="student-sticky-header">
  <div style={styles.headerInner}>
    {/* ✅ LEFT: Back Button */}
    <div style={styles.headerLeft}>
      <Breadcrumbs
  items={[
    { label: "Home", to: "/" },
    { label: "Student Dashboard" },
  ]}
/>

    </div>

    {/* ✅ CENTER TITLE */}
    <div style={styles.headerCenter}>
      <h1 style={styles.headerTitle}>Student Dashboard</h1>
    </div>

    {/* ✅ RIGHT: User Chip Dropdown */}
    <div style={styles.headerRight}>
      <UserChipMenu />
    </div>
  </div>
</div>


      {/* =========================
          CONTENT AREA
          - Two cards:
            1) Apply OD Form
            2) My OD Requests history table
      ========================= */}
      <div style={styles.contentWrap} className="student-content">
        <div style={styles.grid}>
          {/* ======================================================
              LEFT CARD: APPLY OD FORM
              - Student fills OD details and submits request
          ====================================================== */}
          <div style={{ ...styles.card, ...styles.equalHeightCard }}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Apply OD</h3>
              <span style={styles.tagBlue}>New Request</span>
            </div>

            {/* OD Form */}
            <form onSubmit={submitOD} style={styles.form}>
              {/* Admission ID (Readonly autofill) */}
              <div style={styles.field}>
                <label style={styles.label}>Admission ID (QID)</label>
                <input
                  style={styles.inputReadonly}
                  value={user?.admissionId || ""}
                  readOnly
                />
              </div>

              {/* Student name (Readonly autofill) */}
              <div style={styles.field}>
                <label style={styles.label}>Student Name</label>
                <input
                  style={styles.inputReadonly}
                  value={user?.name || ""}
                  readOnly
                />
              </div>

              {/* OD Reason input */}
              <div style={styles.field}>
                <label style={styles.label}>Reason</label>
                <input
                  style={styles.input}
                  placeholder="Enter OD reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)} // ✅ update reason
                />
              </div>

              {/* From Date */}
              <div style={styles.field}>
                <label style={styles.label}>From Date</label>
                <input
                  style={styles.input}
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)} // ✅ update fromDate
                />
              </div>

              {/* To Date */}
              <div style={styles.field}>
                <label style={styles.label}>To Date</label>
                <input
                  style={styles.input}
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)} // ✅ update toDate
                />
              </div>

              {/* Proof upload (optional) */}
              <div style={styles.field}>
                <label style={styles.label}>Proof (optional)</label>
                <input
                  style={styles.fileInput}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setProof(e.target.files[0])} // ✅ store uploaded file
                />
              </div>

              {/* Submit button */}
              <button style={styles.primaryBtn} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit OD"}
              </button>

              {/* Helper message */}
              <p style={styles.helperText}>
                ✅ Your OD will be reviewed by faculty.
              </p>
            </form>
          </div>

          {/* ======================================================
              RIGHT CARD: OD TABLE (History)
              - Shows student OD requests (pending/approved/rejected)
          ====================================================== */}
          <div style={{ ...styles.card, ...styles.equalHeightCard }}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>My OD Requests</h3>
              <span style={styles.tag}>History</span>
            </div>

            <div style={styles.tableArea}>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  {/* Table header */}
                  <thead>
                    <tr style={styles.theadRow}>
                      <th style={styles.th}>Admission ID</th>
                      <th style={styles.th}>Reason</th>
                      <th style={styles.th}>From</th>
                      <th style={styles.th}>To</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>

                  {/* Table body */}
                  <tbody>
                    {/* Empty state */}
                    {ods.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={styles.emptyRow}>
                          No OD request found
                        </td>
                      </tr>
                    ) : (
                      // Render OD rows
                      ods.map((od) => (
                        <tr key={od._id} style={styles.tr}>
                          {/* Admission ID chip */}
                          <td style={styles.td}>
                            <span style={styles.qidChip}>
                              {od.admissionId ||
                                od.studentId?.admissionId ||
                                user?.admissionId ||
                                "—"}
                            </span>
                          </td>

                          {/* Reason */}
                          <td style={{ ...styles.td, ...styles.tdWrap }}>
                            {od.reason}
                          </td>

                          {/* From Date */}
                          <td style={styles.td}>
                            {new Date(od.fromDate).toLocaleDateString()}
                          </td>

                          {/* To Date */}
                          <td style={styles.td}>
                            {new Date(od.toDate).toLocaleDateString()}
                          </td>

                          {/* Status pill */}
                          <td style={styles.td}>
                            <span style={styles.statusPill(od.status)}>
                              {od.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* =========================
          Responsive Fix (Mobile CSS)
      ========================= */}
      <style>{`
/* ===============================
   GLOBAL SAFETY (NO OVERFLOW)
================================*/
html, body {
  max-width: 100%;
  overflow-x: hidden;
}

.student-page {
  overflow-x: hidden;
}

/* ===============================
   HEADER RESPONSIVENESS
================================*/
@media (max-width: 900px) {
  .student-content {
    padding: 18px 14px !important;
  }

  .student-sticky-header {
    padding: 14px !important;
  }

  .student-sticky-header > div {
    grid-template-columns: 1fr auto !important;
    row-gap: 12px;
  }

  .student-sticky-header h1 {
    font-size: 24px !important;
  }
}

/* ===============================
   MOBILE HEADER STACK
================================*/
@media (max-width: 650px) {
  .student-sticky-header > div {
    display: flex !important;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    text-align: center;
  }

  .student-sticky-header h1 {
    font-size: 22px !important;
  }
}

/* ===============================
   GRID & CARD FIX
================================*/
@media (max-width: 768px) {
  .student-content {
    padding: 14px 12px !important;
  }

  /* Remove forced height on mobile */
  .student-content [style*="height: 590px"] {
    height: auto !important;
  }
}

/* ===============================
   TABLE RESPONSIVENESS
================================*/
@media (max-width: 768px) {
  
  .student-content table {
    display: block !important;
    width: 100% !important;
    overflow-x: auto !important;
    white-space: nowrap !important;
    overflow-y: auto !important;

  }

  .student-content .table-wrap {
    overflow-x: auto !important;
  }
}

/* ===============================
   VERY SMALL DEVICES
================================*/
@media (max-width: 480px) {
  .student-content {
    padding: 12px 10px !important;
  }

  .student-sticky-header h1 {
    font-size: 20px !important;
  }

  .student-content button {
    font-size: 13px !important;
  }
}
  
`}</style>

    </div>
  );
}

/* =========================
   INLINE STYLES (UI only)
   - Student dashboard layout with sticky header and 2 cards
========================= */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f6fb",
  },

  stickyHeader: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "#f3f6fb",
    padding: "18px 18px 12px",
  },

  headerInner: {
    background: "linear-gradient(135deg, #1976d2, #125ea6)",
    borderRadius: 18,
    padding: "14px 16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    display: "grid",
    gridTemplateColumns: "120px 1fr 220px",
    alignItems: "center",
    gap: 14,
  },

  headerLeft: {},

  headerCenter: {
    textAlign: "center",
  },

  headerTitle: {
    margin: 0,
    fontSize: 30,
    fontWeight: 899,
    color: "white",
    paddingBottom: 4,
    paddingTop: 2,
  },

  headerRight: {
    display: "flex",
    justifyContent: "flex-end",
  },

  headerChip: {
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "white",
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 800,
    fontSize: 12,
    whiteSpace: "nowrap",
  },

  contentWrap: {
    padding: "26px 30px",
  },

  grid: {
    display: "grid",
    gap: 18,
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    alignItems: "start",
  },

  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },

  equalHeightCard: {
    height: 590,
    display: "flex",
    flexDirection: "column",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },

  cardTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
  },

  tag: {
    fontSize: 12,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#0f172a",
    border: "1px solid #e2e8f0",
  },

  tagBlue: {
    fontSize: 12,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    background: "#e0f2fe",
    color: "#0369a1",
    border: "1px solid #bae6fd",
  },

  tableArea: {
    flex: 1,
    overflow: "hidden",
  },

  tableWrap: {
    width: "100%",
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    borderRadius: 14,
    border: "1px solid #e5e7eb",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },

  theadRow: {
    background: "#f8fafc",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },

  th: {
    textAlign: "left",
    padding: "12px 14px",
    fontSize: 13,
    color: "#334155",
    fontWeight: 900,
    borderBottom: "1px solid #e5e7eb",
  },

  tr: {
    borderTop: "1px solid #eef2f7",
  },

  td: {
    padding: "12px 14px",
    fontSize: 13,
    color: "#0f172a",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  tdWrap: {
    whiteSpace: "normal",
    wordBreak: "break-word",
  },

  emptyRow: {
    padding: 16,
    textAlign: "center",
    color: "#64748b",
    fontWeight: 800,
  },

  qidChip: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#eef2ff",
    color: "#3730a3",
    border: "1px solid #c7d2fe",
    fontWeight: 900,
    fontSize: 12,
  },

  statusPill: (status) => ({
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    textTransform: "capitalize",
    border: "1px solid #e5e7eb",
    background:
      status === "approved"
        ? "#dcfce7"
        : status === "rejected"
        ? "#fee2e2"
        : "#fef3c7",
    color:
      status === "approved"
        ? "#166534"
        : status === "rejected"
        ? "#991b1b"
        : "#92400e",
  }),

  note: {
    marginTop: 10,
    fontSize: 12,
    color: "#64748b",
    fontWeight: 600,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    flex: 1,
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  label: {
    fontSize: 12,
    fontWeight: 900,
    color: "#334155",
  },

  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: 14,
    background: "white",
  },

  inputReadonly: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: 14,
    background: "#f8fafc",
    color: "#0f172a",
    fontWeight: 800,
    cursor: "not-allowed",
  },

  fileInput: {
    width: "100%",
    padding: "10px 10px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    background: "white",
    fontSize: 13,
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
    fontSize: 14,
    marginTop: 2,
  },

  helperText: {
    marginTop: 8,
    color: "#64748b",
    fontSize: 12,
    lineHeight: 1.4,
  },
};
