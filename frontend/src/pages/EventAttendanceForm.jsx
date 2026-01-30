// ===============================
// File: frontend/src/pages/EventAttendanceForm.jsx
// Purpose: Public Event Attendance Form (Student Side) for yesSir Project
// How it works:
// 1) Student opens this page using QR link => /event-form/:eventId
// 2) Form collects student details (name, admissionId, course, section, email)
// 3) Course selection:
//    - Program dropdown (B.Tech/BBA/BCA/MBA)
//    - If B.Tech selected => Branch dropdown appears
//    - Course field stored as "Program / Branch" (for B.Tech) or "Program" only
// 4) Sends attendance submission to backend:
//    - POST /events/form-submit/:eventId
// 5) Shows success/error messages after submission
// Note:
// - API_URL is hardcoded LAN IP so phone devices on same network can access backend
// ===============================

// src/pages/EventAttendanceForm.js
import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
 // ✅ used to read :eventId from URL

export default function EventAttendanceForm() {
  /* ===============================
     ROUTE PARAMS
     - eventId comes from URL: /event-form/:eventId
  =============================== */
  const { eventId } = useParams();
const [searchParams] = useSearchParams();
const token = searchParams.get("token");


  /* ===============================
     BACKEND API URL (LAN ACCESSIBLE)
     - Hardcoded local IP of backend server
     - Used so mobile phone can submit attendance on same WiFi/LAN
  =============================== */
  const API_URL = process.env.REACT_APP_API_URL;


  /* ===============================
     FORM STATE
     - Stores all fields that will be sent to backend
     - course stores combined program/branch string
  =============================== */
  const [form, setForm] = useState({
    name: "",
    admissionId: "",
    course: "",   // ✅ Course (Program / Branch combined)
    section: "",  // ✅ Section (TEXT)
    email: "",
  });

  /* ===============================
     UI STATE for program/branch
     - program dropdown value
     - branch dropdown value
     - these help generate the "course" value in form state
  =============================== */
  const [program, setProgram] = useState("");
  const [branch, setBranch] = useState("");

  /* ===============================
     UI STATE for form submission feedback
     - loading: disables submit button while request in progress
     - success: success message after submission
     - error: error message if validation/api fails
  =============================== */
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* ===============================
     HANDLER: Basic input change
     - Updates form object field by field using input name attribute
  =============================== */
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ===============================
     HANDLER: Program change
     - Sets program state
     - Resets branch when program changes
     - For non B.Tech programs:
        course = program only
  =============================== */
  const handleProgramChange = (e) => {
    const value = e.target.value;
    setProgram(value);
    setBranch("");

    // ✅ For non B.Tech, course = program only
    setForm((prev) => ({
      ...prev,
      course: value,
    }));
  };

  /* ===============================
     HANDLER: Branch change (Only for B.Tech)
     - Sets branch state
     - Updates course field as: "Program / Branch"
  =============================== */
  const handleBranchChange = (e) => {
    const value = e.target.value;
    setBranch(value);

    // ✅ Combine program + branch into course field
    setForm((prev) => ({
      ...prev,
      course: `${program} / ${value}`,
    }));
  };

  /* ===============================
     FUNCTION: Submit Attendance Form
     API: POST /events/form-submit/:eventId
     - Validates all fields before sending
     - Sends JSON body using fetch()
     - Shows success/error messages
     - Resets form after successful submission
  =============================== */
  const submitForm = async () => {
    if (loading) return; // ✅ prevent multiple submissions

    // ✅ Basic validation: all fields required
    if (
      !form.name.trim() ||
      !form.admissionId.trim() ||
      !form.course.trim() ||
      !form.section.trim() ||
      !form.email.trim()
    ) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true); // ✅ start loader
      setError(""); // ✅ clear old error
      setSuccess(""); // ✅ clear old success

      // ✅ Submit attendance to backend with eventId in URL
      const res = await fetch(
        `${API_URL}/events/form-submit/${eventId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, token }),

        }
      );

      // ✅ Parse backend response JSON
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");

      // ✅ Show success message
      setSuccess("✅ Attendance submitted successfully");

      // ✅ Reset form fields after successful submission
      setForm({
        name: "",
        admissionId: "",
        course: "",
        section: "",
        email: "",
      });

      // ✅ Reset program/branch dropdowns too
      setProgram("");
      setBranch("");
    } catch (err) {
      // ✅ Show error message if submission fails
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false); // ✅ stop loader
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        {/* ===============================
            HEADER (Google Form style)
        =============================== */}
        <div style={header}>
          <h2 style={{ margin: 0 }}>Quantum University</h2>
          <p style={{ marginTop: 4, fontSize: 14 }}>
            Event Attendance Form
          </p>
        </div>

        {/* ✅ Error message display */}
        {error && <p style={err}>{error}</p>}

        {/* ✅ Success message display */}
        {success && <p style={ok}>{success}</p>}

        {/* ===============================
            FORM BODY (noValidate to avoid browser validation popups)
        =============================== */}
        <form noValidate>
          {/* Student Full Name */}
          <div style={field}>
            <label style={label}>Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              style={input}
            />
          </div>

          {/* Admission ID / QID */}
          <div style={field}>
            <label style={label}>Admission ID</label>
            <input
              name="admissionId"
              value={form.admissionId}
              onChange={handleChange}
              style={input}
            />
          </div>

          {/* Program dropdown */}
          <div style={field}>
            <label style={label}>Course</label>
            <select
              value={program}
              onChange={handleProgramChange}
              style={input}
            >
              <option value="">Select Course</option>
              <option value="B.Tech">B.Tech</option>
              <option value="BBA">BBA</option>
              <option value="BCA">BCA</option>
              <option value="MBA">MBA</option>
            </select>
          </div>

          {/* ===============================
              Branch dropdown (Only for B.Tech)
              - Conditionally rendered based on program state
          =============================== */}
          {program === "B.Tech" && (
            <div style={field}>
              <label style={label}>Branch</label>
              <select
                value={branch}
                onChange={handleBranchChange}
                style={input}
              >
                <option value="">Select Branch</option>
                <option value="CSE">CSE</option>
                <option value="AIML">AIML</option>
              </select>
            </div>
          )}

          {/* Section input */}
          <div style={field}>
            <label style={label}>Section</label>
            <input
              name="section"
              placeholder="Eg: A, B, C"
              value={form.section}
              onChange={handleChange}
              style={input}
            />
          </div>

          {/* University Email input */}
          <div style={field}>
            <label style={label}>University Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              style={input}
            />
          </div>

          {/* Submit button triggers submitForm() */}
          <button
            type="button"
            onClick={submitForm}
            style={btn}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Attendance"}
          </button>
        </form>

        {/* Footer note */}
        <p style={footer}>
          Never submit passwords through this form.
        </p>
      </div>
    </div>
  );
}

/* ===============================
   STYLES: Google Form Inspired UI
   - Light gray background
   - White card container
   - Purple header bar
=============================== */

const page = {
  minHeight: "100vh",
  background: "#f1f3f4",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
};

const card = {
  width: "100%",
  maxWidth: 440,
  background: "#fff",
  borderRadius: 10,
  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
};

const header = {
  background: "#673ab7",
  color: "#fff",
  padding: 18,
};

const field = {
  padding: "14px 18px",
};

const label = {
  display: "block",
  fontSize: 13,
  marginBottom: 6,
  color: "#444",
};

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 4,
  border: "1px solid #dadce0",
  fontSize: 15,
};

const btn = {
  width: "calc(100% - 36px)",
  margin: "10px 18px 18px",
  padding: 12,
  background: "#673ab7",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  fontWeight: 600,
};

const err = { color: "#d93025", padding: "10px 18px" };
const ok = { color: "#188038", padding: "10px 18px" };

const footer = {
  fontSize: 12,
  color: "#666",
  padding: "10px 18px 18px",
};
