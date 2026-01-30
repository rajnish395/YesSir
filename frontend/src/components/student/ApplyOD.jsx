// ===============================
// File: frontend/src/components/student/ApplyOD.jsx
// Purpose: Student OD Apply Form for yesSir Project
// Features:
// 1) Student can apply OD by entering reason + date range
// 2) QID/Admission ID auto-filled from logged-in user (localStorage)
// 3) Proof file upload support (image/pdf)
// 4) Sends request using FormData (multipart/form-data)
// 5) On success -> redirect to /student dashboard
// ===============================

import React, { useState } from "react";
import API from "../../services/api"; // ✅ Axios instance for backend calls

export default function ApplyOD() {
  // ===============================
  // AUTH USER (LocalStorage)
  // - Reads logged-in user data from localStorage
  // - Used for auto-filling Admission ID (QID)
  // ===============================
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // ===============================
  // FORM STATE
  // reason: OD reason text
  // fromDate/toDate: OD date range
  // proof: optional uploaded file (image/pdf)
  // ===============================
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [proof, setProof] = useState(null);

  // ===============================
  // FUNCTION: Submit OD Application
  // API: POST /od/apply
  // - Uses FormData to send text fields + optional file upload
  // - Adds admissionId automatically from logged-in user (QID auto-fill)
  // - On success redirects to /student
  // ===============================
  const submit = async (e) => {
    e.preventDefault(); // ✅ stop page reload on submit

    try {
      // ✅ Create FormData for multipart request (file + text)
      const formData = new FormData();

      // ✅ Append OD request fields
      formData.append("reason", reason);
      formData.append("fromDate", fromDate);
      formData.append("toDate", toDate);

      // ✅ Append admissionId/QID (auto-filled from user)
      formData.append("admissionId", user?.admissionId || "");

      // ✅ Append proof file only if selected
      if (proof) formData.append("proof", proof);

      // ✅ Submit OD request to backend
      await API.post("/od/apply", formData);

      // ✅ Redirect back to student dashboard after success
      window.location.href = "/student";
    } catch (err) {
      // ✅ Handle error response
      alert("Error submitting OD");
    }
  };

  return (
    <div style={{ padding: "20px" }} className="page">
      {/* ===============================
          UI: Centered Card Layout
          - Fixed max width
          - Shadow and border radius for clean UI
      =============================== */}
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          background: "white",
          padding: "25px 30px",
          borderRadius: "12px",
          boxShadow: "0px 6px 20px rgba(0,0,0,0.12)",
        }}
      >
        {/* Page title */}
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Apply OD
        </h2>

        {/* ===============================
            FORM: OD Apply
            - Controlled inputs + file upload
        =============================== */}
        <form onSubmit={submit}>
          {/* ===============================
              INPUT: QID / Admission ID (Auto + ReadOnly)
              - Pulled from localStorage user
              - ReadOnly so student cannot modify
          =============================== */}
          <input
            placeholder="QID / Admission ID"
            value={user?.admissionId || ""}
            readOnly
            style={{
              ...inputStyle,
              background: "#f3f4f6",
              cursor: "not-allowed",
              fontWeight: 600,
            }}
          />

          {/* INPUT: Reason */}
          <input
            placeholder="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)} // ✅ update reason state
            style={inputStyle}
          />

          {/* INPUT: From Date */}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)} // ✅ update fromDate state
            style={inputStyle}
          />

          {/* INPUT: To Date */}
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)} // ✅ update toDate state
            style={inputStyle}
          />

          {/* ===============================
              INPUT: Proof Upload
              - Optional file upload
              - Supports image and pdf
          =============================== */}
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setProof(e.target.files[0])} // ✅ store selected file in state
            style={{ marginBottom: "15px" }}
          />

          {/* Submit button */}
          <button style={btnStyle} type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

/* ===============================
   INLINE STYLES (UI only)
   - Used for clean input + button design
=============================== */

// Common input styling
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

// Submit button styling
const btnStyle = {
  width: "100%",
  padding: "12px",
  background: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
};
