import React, { useEffect, useState, useCallback } from "react";
import API from "../../services/api"; // ✅ Axios instance for backend requests



/* ✅ Table header row styling
   - sticky so header remains visible while scrolling vertically */
const theadRow = {
  background: "#f8fafc",
  position: "sticky",
  top: 0,
  zIndex: 2,
};

/* ✅ Table heading cell style */
const thStyle = {
  padding: "10px 12px",
  textAlign: "center",
  fontWeight: 900,
  fontSize: 12,
  color: "#334155",
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  verticalAlign: "middle",
};

/* ✅ Table row divider style */
const trStyle = {
  borderBottom: "1px solid #eef2f7",
};

/* ✅ Table data cell style
   - Uses ellipsis for long values */
const tdStyle = {
  padding: "10px 12px",
  fontSize: 12,
  color: "#0f172a",
  borderBottom: "1px solid #eef2f7",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  boxSizing: "border-box",
  textAlign: "left",
  verticalAlign: "middle",
};

/* ✅ Empty state row styling */
const emptyTd = {
  padding: 14,
  textAlign: "center",
  color: "#64748b",
  fontWeight: 700,
  fontSize: 12,
};

/* ✅ Column width definitions
   - Used with <colgroup> for fixed layout inside card
   - Helps prevent horizontal scroll */
const col = {
  name: { width: "30%" },
  qid: { width: "16%" },
  course: { width: "18%" },
  section: { width: "8%" },
  email: { width: "28%" },
};

export default function EventFormTable({ eventId }) {
  /* ===============================
     STATE: Submissions rows + loading
     - rows: stores student submissions for event
     - loading: shows loading state while API is fetching
  =============================== */
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ===============================
     FUNCTION: Load submissions for event
     API: GET /events/submissions/:eventId
     - Fetches submissions list and updates rows state
     - Wrapped in useCallback to avoid re-creating function unnecessarily
  =============================== */
  const load = useCallback(async () => {
    if (!eventId) return; // ✅ guard: cannot fetch without eventId

    try {
      setLoading(true); // ✅ start loader
      const res = await API.get(`/events/submissions/${eventId}`); // ✅ fetch submissions
      setRows(res.data); // ✅ store submissions in state
    } catch (err) {
      // ✅ log error if request fails
      console.error("Failed to load submissions");
    } finally {
      setLoading(false); // ✅ stop loader
    }
  }, [eventId]);

  /* ===============================
     INITIAL LOAD + AUTO REFRESH
     - Loads submissions once when eventId changes
     - Auto refresh every 5 seconds to show live submissions
     - Cleanup interval on unmount
  =============================== */
  useEffect(() => {
    if (!eventId) return; // ✅ guard

    load(); // ✅ initial load

    // ✅ Auto refresh every 5 seconds
    const interval = setInterval(load, 5000);

    // ✅ cleanup interval on component unmount/change
    return () => clearInterval(interval);
  }, [eventId, load]);

  /* ===============================
     UI: If no eventId given
     - Shows message instead of table
  =============================== */
  if (!eventId) {
    return (
      <p style={{ color: "#777", fontSize: 12 }}>
        Start an event to view submissions
      </p>
    );
  }

  /* ===============================
     UI: First load loading state
     - Only shows loading message when rows are empty
  =============================== */
  if (loading && rows.length === 0) {
    return <p style={{ fontSize: 12 }}>Loading submissions...</p>;
  }

  return (

    
    <div style={{ width: "100%" }}>
      {/* ===============================
          TABLE WRAPPER
          - Fixed maxHeight + vertical scroll
          - Horizontal scroll disabled
      =============================== */}
      <div
        className="table-wrapper"
        style={{
          width: "100%",
          maxHeight: 260,
          overflowY: "auto", // ✅ vertical scroll for many submissions
          overflowX: "hidden", // ✅ no horizontal scroll
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          background: "white",
        }}
      >
        {/* ===============================
            MAIN TABLE
            - tableLayout: fixed ensures columns fit inside card
            - colgroup is used for fixed column widths
        =============================== */}
        <table
          width="100%"
          cellPadding="0"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            borderSpacing: 0,
          }}
        >
          {/* ===============================
              FIXED WIDTH COLUMNS
              - Helps prevent table from overflowing
              - Controls relative width distribution
          =============================== */}
          <colgroup>
            <col style={col.name} />
            <col style={col.qid} />
            <col style={col.course} />
            <col style={col.section} />
            <col style={col.email} />
          </colgroup>

          {/* ===============================
              TABLE HEADERS (Sticky)
              - Name aligned left
              - Others centered
          =============================== */}
          <thead>
            <tr style={theadRow}>
              <th style={{ ...thStyle, textAlign: "left" }}>Name</th>
              <th style={thStyle}>QID</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Course</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Section</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Email</th>
            </tr>
          </thead>

          {/* ===============================
              TABLE BODY
              - If rows empty -> show "No submissions"
              - Else -> map submissions list into rows
          =============================== */}
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="5" style={emptyTd}>
                  No submissions yet
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r._id} style={trStyle}>
                  {/* ✅ Student Name */}
                  <td style={tdStyle} title={r.name || ""}>
                    {r.name || "—"}
                  </td>

                  {/* ✅ Student Admission ID / QID */}
                  <td
                    style={{ ...tdStyle, textAlign: "center" }}
                    title={r.admissionId || ""}
                  >
                    {r.admissionId || "—"}
                  </td>

                  {/* ✅ Course name
                      - overflow visible so course can show completely if needed */}
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "center",
                      overflow: "visible",
                      textOverflow: "clip",
                    }}
                    title={r.course || ""}
                  >
                    {r.course || "—"}
                  </td>

                  {/* ✅ Section */}
                  <td
                    style={{ ...tdStyle, textAlign: "center" }}
                    title={r.section || ""}
                  >
                    {r.section || "—"}
                  </td>

                  {/* ✅ Email */}
                  <td style={tdStyle} title={r.email || ""}>
                    {r.email || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style>{`
  @media (max-width: 768px) {
    
  }
`}</style>

    </div>
  );
}

