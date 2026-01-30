// ===============================
// File: frontend/src/admin/AdminDashboard.jsx
// Purpose: Admin Panel for yesSir Project
// Features:
// 1) Fetch all users (students/faculty/coordinator)
// 2) Create new user using QID (Admission ID)
// 3) Search/filter users
// 4) Delete users
// 5) Stats cards (total/students/faculty/coordinators)
// Note: Role toggle feature is present but currently commented out
// ===============================

import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api"; // ✅ API instance (axios) used for backend requests
import UserChipMenu from "../components/common/UserChipMenu";
//import HeaderBackButton from "../components/common/HeaderBackButton";
import Breadcrumbs from "../components/common/BreadCrumbs";


export default function AdminDashboard() {
  /* =======================
     STATE: All users list
     - Stores fetched users from backend
  ======================= */
  const [users, setUsers] = useState([]);

  /* =======================
     STATE: Create user form (QID included)
     - admissionId is QID (unique identifier for user)
     - role default is faculty
  ======================= */
  const [form, setForm] = useState({
  admissionId: "",
  name: "",
  email: "",
  password: "",
  role: "faculty",
  section: "", // ✅ student section
});


  /* =======================
     UI STATES
     - loadingUsers: loading while fetching users list
     - adding: loading while creating a new user
     - search: input state for search bar
  ======================= */
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");

  /* =======================
     FUNCTION: Load all users
     API: GET /admin/users
     - Fetches users list from backend and stores in state
  ======================= */
  const loadUsers = async () => {
    try {
      setLoadingUsers(true); // ✅ start loader
      const res = await API.get("/admin/users"); // ✅ fetch all users
      setUsers(res.data || []); // ✅ update state with backend response
    } catch (err) {
      // ✅ error handling message from backend if present
      alert(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoadingUsers(false); // ✅ stop loader
    }
  };

  /* =======================
     ON MOUNT: load users once
     - Runs only one time when component mounts
  ======================= */
  useEffect(() => {
    loadUsers();
  }, []);

  /* =======================
     FUNCTION: Create user
     API: POST /admin/add-user
     - Creates a new user in database
     - After success: reset form + refresh users list
  ======================= */
  const addUser = async (e) => {
    e.preventDefault(); // ✅ prevent page reload form submit
    if (adding) return; // ✅ prevent double submit while request in progress

    // ✅ Basic validations (frontend level checks)
    if (!form.admissionId.trim()) return alert("Admission ID (QID) is required");
    if (!form.name.trim()) return alert("Name is required");
    if (!form.password.trim()) return alert("Password is required");

    try {
      setAdding(true); // ✅ start create loader

      // ✅ Backend request to create user
      await API.post("/admin/add-user", {
  admissionId: form.admissionId.trim(),
  name: form.name.trim(),
  email: form.email.trim(),
  password: form.password,
  role: form.role,
  section: form.role === "student" ? form.section.trim() : "",
});


      // ✅ Reset form after successful creation
      setForm({
  admissionId: "",
  name: "",
  email: "",
  password: "",
  role: "faculty",
  section: "",
});


      // ✅ Refresh users list so new user appears
      loadUsers();
    } catch (err) {
      // ✅ error handling message from backend if present
      alert(err.response?.data?.message || "Error adding user");
    } finally {
      setAdding(false); // ✅ stop create loader
    }
  };

  /* =======================
     FUNCTION: Delete user
     API: DELETE /admin/delete/:id
     - Deletes user from backend by MongoDB _id
     - Confirm popup before delete
  ======================= */
  const deleteUser = async (id) => {
    if (!window.confirm("Delete user?")) return; // ✅ confirmation box
    try {
      await API.delete(`/admin/delete/${id}`); // ✅ delete request
      loadUsers(); // ✅ refresh list
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  /* =======================
     FUNCTION: Change role (Currently disabled)
     API: PUT /admin/change-role/:id
     - This was used to update role for user
     - Currently commented out (feature paused)
  ======================= */
  /* const changeRole = async (id, role) => {
    try {
      await API.put(`/admin/change-role/${id}`, { role });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Role update failed");
    }
  };*/

  /* =======================
     HELPER: Role toggle cycle (Currently disabled)
     - student -> faculty -> coordinator -> student
  ======================= */
  /* const getNextRole = (current) => {
    if (current === "student") return "faculty";
    if (current === "faculty") return "coordinator";
    if (current === "coordinator") return "student";
    return "faculty";
  };*/

  /* =======================
     FILTER USERS: Search
     - Search works on name/email/role/admissionId
     - useMemo used for performance optimization
  ======================= */
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users; // ✅ if no search, show all users

    const q = search.toLowerCase();
    return users.filter((u) => {
      return (
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.role || "").toLowerCase().includes(q) ||
        (u.admissionId || "").toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  /* =======================
     STATS: Top cards
     - Counts total users + role-based counts
     - Derived from "users" array
  ======================= */
  const stats = useMemo(() => {
    const total = users.length;
    const students = users.filter((u) => u.role === "student").length;
    const faculty = users.filter((u) => u.role === "faculty").length;
    const coordinators = users.filter((u) => u.role === "coordinator").length;
    return { total, students, faculty, coordinators };
  }, [users]);

  return (
    <div style={styles.page} className="page">
      {/* =======================
         TOP STICKY HEADER
         - Contains title + search bar
         - Sticky for better UX while scrolling
      ======================= */}
      <div style={styles.stickyHeader}>
  <div style={styles.headerInner}>
    {/* ✅ LEFT: Back Button */}
    <div style={styles.headerLeft}>
      <Breadcrumbs
  items={[
    { label: "Home", to: "/" },
    { label: "Admin Dashboard" },
  ]}
/>

    </div>

    {/* ✅ CENTER TITLE */}
    <div style={styles.headerCenter}>
      <h1 style={styles.headerTitle}>Admin Dashboard</h1>
    </div>

    {/* ✅ RIGHT: Search + User Chip */}
    <div style={styles.headerRight}>
      <input
        style={styles.searchInput}
        placeholder="Search by QID / name / email / role..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <UserChipMenu />
    </div>
  </div>
</div>



      {/* =======================
         STATS CARDS
         - Quick overview of total users and role distribution
      ======================= */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Users</div>
          <div style={styles.statValue}>{stats.total}</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Students</div>
          <div style={styles.statValue}>{stats.students}</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Faculty</div>
          <div style={styles.statValue}>{stats.faculty}</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Coordinators</div>
          <div style={styles.statValue}>{stats.coordinators}</div>
        </div>
      </div>

      {/* =======================
         MAIN GRID (2 CARDS)
         - Left: Create user form
         - Right: Users table
         - Both equal height for consistent layout
      ======================= */}
      <div style={styles.grid}>
        {/* =======================
           CARD 1: CREATE USER FORM
           - Admin can create students/faculty/coordinators
        ======================= */}
        <div style={{ ...styles.card, ...styles.equalHeightCard }}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Create User</h3>
            <span style={styles.tag}>QID Based</span>
          </div>

          <form onSubmit={addUser} style={styles.form}>
            {/* Admission ID (QID) input */}
            <div style={styles.field}>
              <label style={styles.label}>Admission ID (QID)</label>
              <input
                style={styles.input}
                placeholder="24030337 / FAC1001 / COORD1001"
                value={form.admissionId}
                onChange={(e) =>
                  setForm({ ...form, admissionId: e.target.value })
                }
              />
            </div>

            {/* Name input */}
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                placeholder="Enter name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Email input (optional) */}
            <div style={styles.field}>
              <label style={styles.label}>Email (optional)</label>
              <input
                style={styles.input}
                placeholder="example@domain.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* Password input */}
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                placeholder="Enter password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

             {/* ✅ Section (Student Only) */}
{form.role === "student" && (
  <div style={styles.field}>
    <label style={styles.label}>Section</label>
    <input
      style={styles.input}
      placeholder="Eg: A / B / C"
      value={form.section}
      onChange={(e) => setForm({ ...form, section: e.target.value })}
    />
  </div>
)}


            {/* Role selection dropdown */}
            <div style={styles.field}>
              <label style={styles.label}>Role</label>
              <select
                style={styles.input}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="coordinator">Coordinator</option>
              </select>
            </div>

            {/* Submit button */}
            <button style={styles.primaryBtn} disabled={adding}>
              {adding ? "Creating..." : "Create User"}
            </button>

            {/* Helper note for admin */}
            <p style={styles.helperText}>
              ✅ QID required • Email optional • Roles are controlled by Admin
            </p>
          </form>
        </div>

        {/* =======================
           CARD 2: USERS TABLE
           - Shows list of all users
           - Allows delete actions
           - Contains refresh button
        ======================= */}
        <div style={{ ...styles.card, ...styles.equalHeightCard }}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>All Users</h3>
            <button style={styles.refreshBtn} onClick={loadUsers}>
              {loadingUsers ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Scrollable area for table (vertical only) */}
          <div style={styles.tableScrollArea}>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.theadRow}>
                    <th style={styles.th}>QID</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {/* If no users after filtering */}
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={styles.emptyRow}>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    // Render filtered users
                    filteredUsers.map((u) => (
                      <tr key={u._id} style={styles.tr}>
                        {/* QID / Admission ID */}
                        <td style={styles.td}>
                          <span style={styles.qidChip}>
                            {u.admissionId || "—"}
                          </span>
                        </td>

                        {/* Name */}
                        <td style={styles.td}>{u.name}</td>

                        {/* Email (wrap if long) */}
                        <td style={{ ...styles.td, ...styles.tdWrap }}>
                          {u.email ? u.email : <span style={styles.dim}>—</span>}
                        </td>

                        {/* Role pill */}
                        <td style={styles.td}>
                          <span style={styles.rolePill(u.role)}>{u.role}</span>
                        </td>

                        {/* Actions */}
                        <td style={styles.td}>
                          <div style={styles.actionRow}>
                            {/* Delete user button */}
                            <button
                              style={styles.deleteBtn}
                              onClick={() => deleteUser(u._id)}
                            >
                              Delete
                            </button>

                            {/* Role toggle feature (currently disabled) */}
                            {/* {u.role !== "admin" && (
                              <button
                                style={styles.toggleBtn}
                                onClick={() =>
                                  changeRole(u._id, getNextRole(u.role))
                                }
                              >
                                Toggle Role
                              </button>*/}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info note about role toggle cycle */}
          <p style={styles.note}>
            Tip: Toggle Role cycles{" "}
            <b>student → faculty → coordinator → student</b>
          </p>
        </div>
      </div>

      <style>{`
/* ===============================
   GLOBAL SAFETY
================================*/
html, body {
  overflow-x: hidden;
}

.page {
  overflow-x: hidden;
}

/* ===============================
   HEADER RESPONSIVE FIX
================================*/
@media (max-width: 1024px) {
  .page [style*="grid-template-columns: 120px 1fr 520px"] {
    grid-template-columns: 1fr auto !important;
    row-gap: 12px;
  }
}

@media (max-width: 768px) {
  .page [style*="grid-template-columns"] {
    display: flex !important;
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    gap: 12px;
  }

  .page h1 {
    font-size: 22px !important;
  }

  .page input[placeholder*="Search"] {
    max-width: 100% !important;
  }
}

/* ===============================
   STATS CARDS FIX
================================*/
@media (max-width: 768px) {
  .page [style*="minmax(170px"] {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 480px) {
  .page [style*="minmax(170px"] {
    grid-template-columns: 1fr !important;
  }
}

/* ===============================
   CARD HEIGHT FIX
================================*/
@media (max-width: 768px) {
  .page [style*="height: 50px"] {
    height: auto !important;
    min-height: unset !important;
  }
}
  
`}</style>

    </div>
  );
}


/* ===============================
   INLINE STYLES
   - This file uses inline JS styles (no separate CSS file)
   - Organized section-wise for dashboard layout & UI
=============================== */

const styles = {
  // Page background + padding
  page: {
    minHeight: "100vh",
    padding: "30px 22px",
    background: "#f3f6fb",
  },

  /* Sticky header wrapper */
  stickyHeader: {
    position: "sticky", // ✅ keeps header fixed when scrolling
    top: 0,
    zIndex: 50,
    background: "#f3f6fb",
    paddingBottom: 12,
    marginBottom: 14,
  },

  /* Sticky header main card */
  headerInner: {
    background: "linear-gradient(135deg, #1976d2, #125ea6)",
    borderRadius: 18,
    padding: "14px 16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    display: "grid",
    gridTemplateColumns: "120px 1fr 520px", // ✅ left slot + title + search
    alignItems: "center",
    gap: 14,
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  headerCenter: {
    textAlign: "center",
  },

  headerRight: {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 12,
},


  headerTitle: {
    margin: 0,
    fontSize: 30,
    fontWeight: 899,
    color: "white",
    paddingBottom: 4,
    paddingTop: 2,
  },

  // Search input styling
  searchInput: {
  width: "100%",
  maxWidth: 320,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  background: "white",
  outline: "none",
  fontSize: 14,
},


  /* Stats cards grid */
  statsGrid: {
    display: "grid",
    gap: 14,
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    marginBottom: 18,
  },

  statCard: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  },

  statLabel: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: 700,
  },

  statValue: {
    marginTop: 6,
    fontSize: 26,
    fontWeight: 900,
    color: "#0f172a",
  },

  /* Main 2-card layout */
  grid: {
    display: "grid",
    gap: 18,
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    alignItems: "start",
  },

  // Generic card styling
  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },

  // Ensures form card and table card equal height
  equalHeightCard: {
    height: 560,
    display: "flex",
    flexDirection: "column",
  },

  // Card header row styling
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

  // Small tag pill (QID Based label)
  tag: {
    fontSize: 12,
    fontWeight: 800,
    padding: "6px 10px",
    borderRadius: 999,
    background: "#e0f2fe",
    color: "#0369a1",
    border: "1px solid #bae6fd",
  },

  /* Create user form layout */
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
    fontWeight: 800,
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

  // Main primary button
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

  // Refresh button for user table card
  refreshBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    background: "white",
    cursor: "pointer",
    fontWeight: 800,
    color: "#0f172a",
  },

  /* User table window scroll area */
  tableScrollArea: {
    flex: 1,
    overflow: "hidden",
  },

  // Table wrapper allows only vertical scroll
  tableWrap: {
    width: "100%",
    height: "100%",
    overflowY: "auto", // ✅ only vertical scroll
    overflowX: "auto", // ✅ no horizontal scroll
    borderRadius: 14,
    border: "1px solid #e5e7eb",
  },

  // Table layout fix inside card
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed", // ✅ force fit inside card
  },

  // Sticky table header row
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

  // Allow wrapping for long email
  tdWrap: {
    wordBreak: "break-word",
    whiteSpace: "normal",
  },

  emptyRow: {
    padding: 16,
    textAlign: "center",
    color: "#64748b",
    fontWeight: 700,
  },

  // QID chip styling
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

  // Role pill color changes based on role type
  rolePill: (role) => ({
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    textTransform: "capitalize",
    border: "1px solid #e5e7eb",
    background:
      role === "student"
        ? "#ecfeff"
        : role === "faculty"
        ? "#fef3c7"
        : "#dcfce7",
    color:
      role === "student"
        ? "#155e75"
        : role === "faculty"
        ? "#92400e"
        : "#166534",
  }),

  actionRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  // Delete user button (danger)
  deleteBtn: {
    padding: "5px 8px",
    borderRadius: 10,
    border: "1px solid #fecaca",
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 900,
    cursor: "pointer",
  },

  /* Role toggle button (feature paused) */
  /* toggleBtn: {
    padding: "8px 2px",
    borderRadius: 10,
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 900,
    cursor: "pointer",
  },*/

  // Dim placeholder text style
  dim: {
    color: "#94a3b8",
    fontWeight: 700,
  },

  // Bottom note under table
  note: {
    marginTop: 10,
    fontSize: 12,
    color: "#64748b",
  },
};
