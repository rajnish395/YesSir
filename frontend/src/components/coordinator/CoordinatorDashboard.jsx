// ===============================
// File: frontend/src/components/coordinator/CoordinatorDashboard.jsx
// Purpose: Coordinator Dashboard for yesSir Project
// Features:
// 1) Load all events list from backend
// 2) Coordinator can create/start event attendance (EventAttendance)
// 3) Shows event attendance records history
// 4) Clicking an event expands submissions table (EventFormTable)
// 5) Sticky header + responsive UI
// 6) ✅ Shows submission count on right of event name
// 7) ✅ RSVP Settings inside SAME LEFT CARD (below EventAttendance) - EXACTLY like FacultyDashboard
// ===============================

import React, { useCallback, useEffect, useState } from "react";
import API from "../../services/api";
import EventAttendance from "../faculty/EventAttendance";
import EventFormTable from "../faculty/EventFormTable";
import UserChipMenu from "../common/UserChipMenu";
import Breadcrumbs from "../common/BreadCrumbs";
import RSVPBox from "../faculty/RSVPBox";

export default function CoordinatorDashboard() {
  // ===============================
  // STATE
  // ===============================
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);

  // ✅ counts store
  const [eventCounts, setEventCounts] = useState({});

  // ===============================
  // LOAD COUNTS
  // ===============================
  const loadCounts = async (eventList) => {
    try {
      const results = await Promise.all(
        eventList.map(async (ev) => {
          const res = await API.get(`/events/submissions-count/${ev.id}`);
          return [ev.id, res.data?.count || 0];
        })
      );

      setEventCounts(Object.fromEntries(results));
    } catch (err) {
      console.error("Failed to load event counts");
    }
  };

  // ===============================
  // LOAD EVENTS
  // ===============================
  const loadEvents = useCallback(async () => {
  try {
    const res = await API.get("/events/list");

    const mapped = res.data.map((e) => ({
      id: e._id,
      name: e.name,
    }));

    setEvents(mapped);
    loadCounts(mapped);
  } catch (err) {
    console.error("Failed to load events");
  }
}, []);


  // ===============================
  // INITIAL LOAD
  // ===============================
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <div style={styles.page} className="coordinator-page">
      {/* =========================
          STICKY HEADER
      ========================= */}
      <div style={styles.stickyHeader} className="coordinator-sticky-header">
        <div style={styles.headerInner}>
          {/* ✅ LEFT: Breadcrumbs */}
          <div style={styles.headerLeft}>
            <Breadcrumbs
              items={[
                { label: "Home", to: "/" },
                { label: "Coordinator Dashboard" },
              ]}
            />
          </div>

          {/* ✅ CENTER TITLE */}
          <div style={styles.headerCenter}>
            <h1 style={styles.headerTitle}>Coordinator Dashboard</h1>
          </div>

          {/* ✅ RIGHT: User Chip Dropdown */}
          <div style={styles.headerRight}>
            <UserChipMenu />
          </div>
        </div>
      </div>

      {/* =========================
          CONTENT AREA
      ========================= */}
      <div style={styles.contentWrap} className="coordinator-content">
        <div style={styles.twoCardsGrid} className="coordinator-grid">
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

                    const updated = [event, ...prev];

                    // ✅ also update count list after adding event
                    loadCounts(updated);
                    return updated;
                  });

                  // ✅ 2) fetch count once for newly created event
                  try {
                    const c = await API.get(
                      `/events/submissions-count/${event.id}`
                    );

                    setEventCounts((prev) => ({
                      ...prev,
                      [event.id]: c.data?.count || 0,
                    }));
                  } catch (err) {
                    console.log("Count load failed", event.id);
                  }
                }}
              />

              {/* ✅ RSVP inside same card (below create event) */}
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
                        setActiveEvent((prev) => (prev?.id === e.id ? null : e))
                      }
                      style={{
                        ...styles.eventRow,
                        ...(activeEvent?.id === e.id ? styles.eventRowActive : {}),
                      }}
                    >
                      <div style={styles.eventRowLeft}>
                        <span style={styles.eventIcon}>🗓️</span>
                        <span style={styles.eventName}>{e.name}</span>
                      </div>

                      <span style={styles.countBadge}>
                        {eventCounts[e.id] ?? 0}
                      </span>
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
      </div>

      {/* =========================
          RESPONSIVE
      ========================= */}
      <style>{`
        @media (max-width: 950px) {
          .coordinator-content {
            padding: 18px 14px !important;
          }
        }

        @media (max-width: 900px) {
          .coordinator-sticky-header {
            padding: 14px 14px 10px !important;
          }
        }

        @media (max-width: 820px) {
          .coordinator-grid {
            grid-template-columns: 1fr !important;
          }
        }
          /* ===============================
   COORDINATOR – MOBILE POLISH
   CSS ONLY
=============================== */

@media (max-width: 768px) {
  /* prevent horizontal scroll */
  .coordinator-page {
    overflow-x: hidden;
  }

  /* header layout → stacked */
  .coordinator-sticky-header > div {
    grid-template-columns: 1fr !important;
    text-align: center;
  }

  .coordinator-sticky-header h1 {
    font-size: 22px !important;
  }

  /* user chip center */
  .coordinator-sticky-header > div > div:last-child {
    justify-content: center !important;
    margin-top: 6px;
  }

  /* content padding */
  .coordinator-content {
    padding: 14px !important;
  }

  /* cards/grid */
  .coordinator-grid {
    grid-template-columns: 1fr !important;
  }

  .coordinator-grid > div {
    height: auto !important;
  }

  /* filters / inputs */
  select,
  input {
    width: 100% !important;
  }

  /* tables safe scroll */
  table {
    font-size: 12px;
  }

  .coordinator-table-scroll {
    overflow-x: auto;
  }

  /* buttons tap friendly */
  button {
    padding: 8px 10px !important;
    font-size: 12px !important;
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

  .coordinator-content {
    padding: 12px !important;
  }
}
/* ===============================
   iPHONE & ALL MOBILE SCREENS
   Coordinator Dashboard
=============================== */

/* iPhone SE / Mini (375px) */
@media (max-width: 390px) {
  .coordinator-sticky-header h1 {
    font-size: 19px !important;
  }

  .coordinator-content {
    padding: 12px !important;
  }

  h2 {
    font-size: 15px !important;
  }

  button {
    width: 100%;
  }
}

/* iPhone 12 / 13 / 14 / 15 (390–430px) */
@media (min-width: 391px) and (max-width: 430px) {
  .coordinator-sticky-header h1 {
    font-size: 20px !important;
  }

  .coordinator-content {
    padding: 14px !important;
  }

  h2 {
    font-size: 16px !important;
  }
}

/* iPhone Plus / Pro Max (430–480px) */
@media (min-width: 431px) and (max-width: 480px) {
  .coordinator-sticky-header h1 {
    font-size: 21px !important;
  }

  .coordinator-content {
    padding: 15px !important;
  }
}

/* iPhone landscape + small tablets */
@media (max-width: 600px) {
  .coordinator-grid {
    grid-template-columns: 1fr !important;
  }

  .coordinator-grid > div {
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
  .coordinator-page {
    overflow-x: hidden;
  }

  .coordinator-sticky-header > div {
    grid-template-columns: 1fr !important;
    text-align: center;
  }

  .coordinator-sticky-header > div > div:last-child {
    justify-content: center !important;
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
   INLINE STYLES (same feel as Faculty)
=============================== */
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
    gridTemplateColumns: "220px 1fr 220px",
    alignItems: "center",
    gap: 14,
  },

  headerLeft: { overflow: "hidden" },

  headerCenter: { textAlign: "center" },

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
    marginRight: 10,
    marginLeft: 6,
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
};
