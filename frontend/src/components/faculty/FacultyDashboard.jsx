// ===============================
// File: frontend/src/components/faculty/FacultyDashboard.jsx
// Purpose: Faculty Dashboard for yesSir Project
// Main Features:
// 1) Tabs: Event Attendance + OD Requests
// 2) Event Attendance Tab:
//    - Create event + Start attendance (EventAttendance)
//    - View attendance records for created events (EventFormTable)
// 3) OD Requests Tab:
//    - Faculty can view all OD requests
//    - Filter by status (pending/approved/rejected)
//    - Search by name/QID/reason
//    - Approve/Reject pending requests
//    - View proof file in modal (image/pdf)
// ===============================

import React, { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import EventAttendance from "./EventAttendance";
import EventFormTable from "./EventFormTable";
import UserChipMenu from "../common/UserChipMenu";
import DashboardTabsRow from "../common/DashboardTabsRow";
import Breadcrumbs from "../common/BreadCrumbs";
import RSVPBox from "./RSVPBox";

export default function FacultyDashboard() {
  // ===============================
  // OD REQUESTS STATE
  // ===============================
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modalFile, setModalFile] = useState(null);

  // ===============================
  // TAB STATE
  // ===============================
  const [activeTab, setActiveTab] = useState("event");

  // ===============================
  // EVENT STATES
  // ===============================
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);

  // ===============================
  // FUNCTION: LOAD OD REQUESTS
  // ===============================
  const loadOD = async () => {
    try {
      const res = await API.get("/od/all");

      // ✅ latest first
      setData(
        res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );

      setLoading(false);
    } catch {
      alert("Error loading OD requests");
    }
  };

  // ===============================
  // FUNCTION: LOAD EVENTS LIST (Latest First)
  // ✅ UPDATED: includes submission count
  // ===============================
  const loadEvents = async () => {
    try {
      const res = await API.get("/events/list");

      const mapped = res.data.map((e) => ({
        id: e._id,
        name: e.name,
        count: 0,
      }));

      setEvents(mapped);

      // ✅ Fetch count for each event
      mapped.forEach(async (ev) => {
        try {
          const c = await API.get(`/events/submissions-count/${ev.id}`);
          setEvents((prev) =>
            prev.map((x) =>
              x.id === ev.id ? { ...x, count: c.data.count } : x
            )
          );
        } catch (err) {
          console.log("Count load failed", ev.id);
        }
      });
    } catch (err) {
      console.error("Failed to load events");
    }
  };

  // ===============================
  // INITIAL LOAD
  // ===============================
  useEffect(() => {
    loadOD();
    loadEvents();
  }, []);

  // ===============================
  // FUNCTION: UPDATE OD STATUS
  // ===============================
  const updateStatus = async (id, newStatus) => {
    await API.put(`/od/update/${id}`, { status: newStatus });
    loadOD();
  };

  // ===============================
  // FILTERED OD DATA (Memoized)
  // ===============================
  const filteredData = useMemo(() => {
    return data
      .filter((req) => (filter === "all" ? true : req.status === filter))
      .filter((req) => {
        const q = search.toLowerCase();
        return (
          req.studentId?.name?.toLowerCase().includes(q) ||
          req.reason?.toLowerCase().includes(q) ||
          req.studentId?.email?.toLowerCase().includes(q) ||
          req.admissionId?.toLowerCase().includes(q)
        );
      });
  }, [data, filter, search]);

  // ===============================
  // LOADING SCREEN
  // ===============================
  if (loading) return <h3 style={{ padding: 20 }}>Loading...</h3>;

  return (
    <div style={styles.page} className="faculty-page">
      {/* =========================================================
          STICKY HEADER
      ========================================================= */}
      <div style={styles.stickyHeaderWrap} className="faculty-sticky-header">
        <div style={styles.headerInner}>
          {/* ✅ LEFT: Breadcrumbs */}
          <div style={styles.headerLeft}>
            <Breadcrumbs
              items={[{ label: "Home", to: "/" }, { label: "Faculty Dashboard" }]}
            />
          </div>

          {/* ✅ CENTER TITLE */}
          <div style={styles.headerCenter}>
            <h1 style={styles.headerTitle}>Faculty Dashboard</h1>
          </div>

          {/* ✅ RIGHT: User Chip Dropdown */}
          <div style={styles.headerRight}>
            <UserChipMenu />
          </div>
        </div>
      </div>

      {/* ✅ Tabs Row BELOW Header */}
      <DashboardTabsRow
        active={activeTab}
        onChange={setActiveTab}
        tabs={[
          { label: "Event Attendance", value: "event" },
          { label: "OD Requests", value: "od" },
        ]}
      />

      {/* =========================================================
          PAGE CONTENT BELOW HEADER
      ========================================================= */}
      <div style={styles.contentWrap} className="faculty-content">
        {/* ===============================
            TAB 1: EVENT ATTENDANCE
        =============================== */}
        {activeTab === "event" && (
          <div style={styles.twoCardsGrid} className="faculty-two-cards-grid">
            {/* ✅ LEFT CARD: Create Event + RSVP in same box */}
            <div style={{ ...styles.equalCard, ...styles.createCard }}>
              <div style={styles.cardHeader}>
                <div style={styles.cardHeaderLeft}>
                  <h2 style={styles.cardTitle}>Create Event</h2>
                  <p style={styles.cardSubTitle}>
                    Generate QR instantly and start attendance
                  </p>
                </div>

                <span style={styles.tagBlue}>QR + Form</span>
              </div>

              <div style={styles.cardBody}>
                <EventAttendance
                  onEventStart={async (event) => {
                    // ✅ 1) Add new event on top
                    setEvents((prev) => {
                      const exists = prev.find((e) => e.id === event.id);
                      if (exists) return prev;
                      return [{ ...event, count: 0 }, ...prev];
                    });

                    // ✅ 2) Fetch count once and update
                    try {
                      const c = await API.get(
                        `/events/submissions-count/${event.id}`
                      );

                      setEvents((prev) =>
                        prev.map((x) =>
                          x.id === event.id
                            ? { ...x, count: c.data?.count || 0 }
                            : x
                        )
                      );
                    } catch (err) {
                      console.log("Count load failed", event.id);
                    }
                  }}
                />

                {/* ✅ RSVP inside same card */}
                <div style={styles.softDivider} />

                <div style={styles.rsvpBlock}>
                  <div style={styles.rsvpHeaderRow}>
                    <div>
                      <h3 style={styles.rsvpTitle}>RSVP Settings</h3>
                      <p style={styles.rsvpSubTitle}>
                        Optional — only used before event starts
                      </p>
                    </div>

                    <span style={styles.tag}>Optional</span>
                  </div>

                  <RSVPBox />
                </div>
              </div>
            </div>

            {/* ✅ RIGHT CARD: Event Attendance Records */}
            <div style={styles.equalCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardHeaderLeft}>
                  <h2 style={styles.cardTitle}>Event Attendance Records</h2>
                  <p style={styles.cardSubTitle}>
                    Tap event to view submissions table
                  </p>
                </div>
                <span style={styles.tagBlue}>History</span>
              </div>

              <div style={styles.cardBody}>
                {events.length === 0 ? (
                  <div style={styles.emptyBox}>
                    <div style={styles.emptyIcon}>📭</div>
                    <div style={styles.emptyTitle}>No events yet</div>
                    <div style={styles.emptyText}>
                      Create your first event to see records here.
                    </div>
                  </div>
                ) : (
                  events.map((e) => (
                    <div key={e.id} style={{ marginBottom: 14 }}>
                      <div
                        onClick={() =>
                          setActiveEvent((prev) =>
                            prev?.id === e.id ? null : e
                          )
                        }
                        style={{
                          ...styles.eventRow,
                          ...(activeEvent?.id === e.id
                            ? styles.eventRowActive
                            : {}),
                        }}
                      >
                        {/* left: icon + name */}
                        <div style={styles.eventRowLeft}>
                          <span style={styles.eventIcon}>🗓️</span>
                          <span style={styles.eventName}>{e.name}</span>
                        </div>

                        {/* right: count */}
                        <span style={styles.countBadge}>{e.count}</span>
                      </div>

                      {activeEvent?.id === e.id && (
                        <div style={styles.eventTableWrapper}>
                          <div style={styles.eventTableScroll}>
                            <EventFormTable eventId={e.id} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===============================
            TAB 2: OD REQUESTS
        =============================== */}
        {activeTab === "od" && (
          <div style={styles.fullWidthCard}>
            <div style={styles.odHeaderRow}>
              <h2 style={styles.odTitle}>OD Requests</h2>

              <div style={styles.odMeta}>
                Total: <span style={styles.odMetaBold}>{filteredData.length}</span>
              </div>
            </div>

            {/* Filter row */}
            <div style={styles.filterRow}>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={styles.select}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <input
                type="text"
                placeholder="Search by name / QID / reason"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* OD Table */}
            <div style={styles.odTableScrollBox}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Admission ID</th>
                    <th style={styles.th}>Section</th>
                    <th style={styles.th}>Reason</th>
                    <th style={styles.th}>From</th>
                    <th style={styles.th}>To</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: "center" }}>Proof</th>
                    <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={styles.emptyTextTable}>
                        No matching OD requests
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((req) => (
                      <tr key={req._id} style={styles.tableRow}>
                        <td style={styles.td}>{req.studentId?.name}</td>

                        <td style={styles.td}>
                          <span style={styles.qidChip}>
                            {req.admissionId || req.studentId?.admissionId || "—"}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.sectionChip}>
                            {req.section || req.studentId?.section || "—"}
                          </span>
                        </td>

                        <td style={styles.td}>{req.reason}</td>

                        <td style={styles.td}>
                          {new Date(req.fromDate).toLocaleDateString()}
                        </td>

                        <td style={styles.td}>
                          {new Date(req.toDate).toLocaleDateString()}
                        </td>

                        <td style={styles.td}>
                          <span style={styles.statusPill(req.status)}>
                            {req.status}
                          </span>
                        </td>

                        <td style={{ ...styles.td, textAlign: "center" }}>
                          {req.proofUrl ? (
                            <button
                              style={styles.viewBtn}
                              onClick={() =>
                                setModalFile(
                                  `http://localhost:5000${req.proofUrl}`
                                )
                              }
                            >
                              View
                            </button>
                          ) : (
                            <span style={styles.dimText}>No File</span>
                          )}
                        </td>

                        <td style={{ ...styles.td, textAlign: "center" }}>
                          {req.status === "pending" ? (
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                justifyContent: "center",
                              }}
                            >
                              <button
                                style={styles.approveBtn}
                                onClick={() => updateStatus(req._id, "approved")}
                              >
                                Approve
                              </button>

                              <button
                                style={styles.rejectBtn}
                                onClick={() => updateStatus(req._id, "rejected")}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={styles.dimText}>—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <p style={styles.tableNote}>
              Tip: Section shows only if student section is stored ✅
            </p>
          </div>
        )}
      </div>

      {/* ===============================
          MODAL: Proof Viewer
      =============================== */}
      {modalFile && (
        <div onClick={() => setModalFile(null)} style={styles.modalOverlay}>
          <div onClick={(e) => e.stopPropagation()} style={styles.modalBox}>
            <button
              onClick={() => setModalFile(null)}
              style={styles.modalCloseBtn}
            >
              ✕
            </button>

            {modalFile.toLowerCase().endsWith(".pdf") ? (
              <iframe src={modalFile} title="proof" style={styles.modalFrame} />
            ) : (
              <div style={styles.modalImageWrap}>
                <img src={modalFile} alt="Proof" style={styles.modalImage} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===============================
          RESPONSIVE UI
      =============================== */}
      <style>{`
        @media (max-width: 950px) {
          .faculty-content {
            padding: 18px 14px !important;
          }
        }

        @media (max-width: 900px) {
          .faculty-sticky-header {
            padding: 14px 14px 10px !important;
          }
        }

        @media (max-width: 820px) {
          .faculty-two-cards-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
  .faculty-page {
    overflow-x: hidden;
  }

  .faculty-sticky-header {
    padding: 12px !important;
  }

  .faculty-sticky-header > div {
    grid-template-columns: 1fr !important;
    text-align: center;
  }

  .faculty-sticky-header h1 {
    font-size: 22px !important;
  }

  .faculty-content {
    padding: 14px !important;
  }

  .faculty-two-cards-grid {
    grid-template-columns: 1fr !important;
  }

  .faculty-two-cards-grid > div {
    height: auto !important;
  }

  select,
  input {
    width: 100% !important;
  }

  table {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 20px !important;
  }

  h2 {
    font-size: 16px !important;
  }

  button {
    width: 100%;
  }
}

/* ===============================
   iPHONE & ALL MOBILE SCREENS
   Faculty Dashboard
=============================== */

/* iPhone SE / Mini (≤390px) */
@media (max-width: 390px) {
  .faculty-sticky-header h1 {
    font-size: 19px !important;
  }

  .faculty-content {
    padding: 12px !important;
  }

  h2 {
    font-size: 15px !important;
  }

  button {
    width: 100%;
  }
}

/* iPhone 12 / 13 / 14 / 15 (391–430px) */
@media (min-width: 391px) and (max-width: 430px) {
  .faculty-sticky-header h1 {
    font-size: 20px !important;
  }

  .faculty-content {
    padding: 14px !important;
  }

  h2 {
    font-size: 16px !important;
  }
}

/* iPhone Plus / Pro Max (431–480px) */
@media (min-width: 431px) and (max-width: 480px) {
  .faculty-sticky-header h1 {
    font-size: 21px !important;
  }

  .faculty-content {
    padding: 15px !important;
  }
}

/* Phones landscape + small tablets */
@media (max-width: 600px) {
  .faculty-two-cards-grid {
    grid-template-columns: 1fr !important;
  }

  .faculty-two-cards-grid > div {
    height: auto !important;
  }

  select,
  input {
    width: 100% !important;
  }

  table {
    font-size: 12px;
  }
}

/* Universal mobile safety */
@media (max-width: 768px) {
  .faculty-page {
    overflow-x: hidden;
  }

  .faculty-sticky-header > div {
    grid-template-columns: 1fr !important;
    text-align: center;
  }

  .faculty-sticky-header > div > div:last-child {
    justify-content: "center" !important;
    margin-top: 6px;
  }

  button {
    padding: 8px 10px !important;
    font-size: 12px !important;
  }
}


      `}</style>
    </div>
  );
}

/* ===============================
   INLINE STYLES SECTION
=============================== */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f6fb",
  },

  stickyHeaderWrap: {
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
    gridTemplateColumns: "220px 1fr 220px",
    alignItems: "center",
    gap: 14,
  },

  headerLeft: {
    overflow: "hidden",
  },

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

  contentWrap: {
    padding: "26px 30px",
  },

  twoCardsGrid: {
    display: "grid",
    gap: 18,
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    alignItems: "start",
  },

  equalCard: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    height: 590,
    display: "flex",
    flexDirection: "column",
  },

  createCard: {
    // ✅ slight premium look for left card
    background:
      "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,1))",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },

  cardHeaderLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },

  cardTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 900,
    color: "#0f172a",
  },

  cardSubTitle: {
    margin: 0,
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b",
  },

  cardBody: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    paddingRight: 6,
  },

  tag: {
    fontSize: 12,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#0f172a",
    border: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
    height: "fit-content",
  },

  tagBlue: {
    fontSize: 12,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    background: "#e0f2fe",
    color: "#0369a1",
    border: "1px solid #bae6fd",
    whiteSpace: "nowrap",
    height: "fit-content",
  },

  softDivider: {
    height: 1,
    background: "#e5e7eb",
    margin: "16px 0",
  },

  rsvpBlock: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
  },

  rsvpHeaderRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },

  rsvpTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 900,
    color: "#0f172a",
  },

  rsvpSubTitle: {
    margin: 0,
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
  },

  eventRow: {
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
    background: "#f1f5f9",
    fontWeight: 800,
    color: "#0f172a",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    border: "1px solid #e2e8f0",
  },

  eventRowLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
    flex: 1,
  },

  eventIcon: {
    marginRight: 10, marginLeft: 6,
  },

  eventName: {
    fontSize: 13,
    fontWeight: 900,
    color: "#0f172a",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  countBadge: {
    padding: "4px 14px",
    borderRadius: 999,
    background: "#e0f2fe",
    color: "#0369a1",
    border: "1px solid #bae6fd",
    fontWeight: 900,
    fontSize: 12,
    minWidth: 44,
    textAlign: "center",
  },

  eventRowActive: {
    background: "#e0e7ff",
    border: "1px solid #c7d2fe",
  },

  eventTableWrapper: {
    marginTop: 10,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "white",
    padding: 10,
  },

  eventTableScroll: {
    maxHeight: 320,
    overflowY: "auto",
    overflowX: "auto",
    whiteSpace: "nowrap",
  },

  emptyBox: {
    border: "1px dashed #cbd5e1",
    borderRadius: 14,
    padding: 16,
    textAlign: "center",
    background: "rgba(248,250,252,0.9)",
  },

  emptyIcon: {
    fontSize: 24,
    marginBottom: 8,
  },

  emptyTitle: {
    fontWeight: 900,
    color: "#0f172a",
    marginBottom: 4,
  },

  emptyText: {
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b",
  },

  fullWidthCard: {
    background: "white",
    borderRadius: 16,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    padding: 18,
  },

  odHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
    flexWrap: "wrap",
  },

  odTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 900,
    color: "#0f172a",
  },

  odMeta: {
    fontSize: 12,
    fontWeight: 800,
    color: "#64748b",
  },

  odMetaBold: {
    color: "#0f172a",
    fontWeight: 900,
  },

  filterRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 14,
  },

  select: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    fontWeight: 800,
    background: "#fff",
  },

  searchInput: {
    flex: 1,
    minWidth: 220,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    outline: "none",
  },

  odTableScrollBox: {
    maxHeight: "65vh",
    overflowY: "auto",
    borderRadius: 14,
    border: "1px solid #e5e7eb",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1050,
  },

  tableHeadRow: {
    background: "#f8fafc",
    position: "sticky",
    top: 0,
    zIndex: 2,
  },

  th: {
    padding: "12px 14px",
    textAlign: "left",
    fontWeight: 900,
    fontSize: 13,
    color: "#334155",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

  tableRow: {
    borderBottom: "1px solid #eef2f7",
  },

  td: {
    padding: "12px 14px",
    fontSize: 13,
    color: "#0f172a",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
  },

  emptyTextTable: {
    padding: 18,
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

  sectionChip: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#ecfeff",
    color: "#155e75",
    border: "1px solid #a5f3fc",
    fontWeight: 900,
    fontSize: 12,
    textTransform: "uppercase",
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

  approveBtn: {
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "7px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 900,
  },

  rejectBtn: {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "7px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 900,
  },

  viewBtn: {
    background: "white",
    color: "#2563eb",
    border: "1px solid #2563eb",
    padding: "7px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 900,
  },

  dimText: {
    color: "#94a3b8",
    fontWeight: 800,
    fontSize: 12,
  },

  tableNote: {
    marginTop: 10,
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
    zIndex: 999,
  },

  modalBox: {
    width: "min(900px, 95vw)",
    height: "min(600px, 85vh)",
    position: "relative",
    background: "white",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  },

  modalFrame: {
    width: "100%",
    height: "100%",
    border: "none",
  },

  modalCloseBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 38,
    height: 38,
    borderRadius: 10,
    border: "none",
    background: "rgba(0,0,0,0.65)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    zIndex: 10,
  },

  modalImageWrap: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#ffffff",
  },

  modalImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
  
};
