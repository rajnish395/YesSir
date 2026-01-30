// ===============================
// File: backend/models/EventAttendace.js
// Purpose: Mongoose Model for Event Attendance Submissions (yesSir Project)
// Features:
// 1) Stores attendance entries for a specific event (eventId reference)
// 2) Stores student form data (name, admissionId, course, section, email)
// 3) Supports tracking submission source: FORM or QR
// 4) Stores verified flag (default true)
// 5) Uses TTL expiry on createdAt to auto-delete records after 3 days
// ===============================

const mongoose = require("mongoose"); // ✅ MongoDB ODM (Mongoose)

/* ===============================
   EVENT ATTENDANCE SCHEMA
   - One document = one attendance submission entry
=============================== */
const EventAttendanceSchema = new mongoose.Schema(
  {
    /* ===============================
       EVENT LINKING
       - Each attendance belongs to one event
    =============================== */
    eventId: {
      type: mongoose.Schema.Types.ObjectId, // ✅ reference to Event document
      ref: "Event",
      required: true,
      index: true, // ✅ faster querying by eventId
    },

    // ===============================
    // FORM DATA (Student Details)
    // ===============================

    // ✅ Student full name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ Admission ID / QID (indexed for faster search)
    admissionId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // ✅ Course (example: "B.Tech / CSE", "MBA", etc.)
    course: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ Section (example: A/B/C)
    section: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ Student email (stored lowercase)
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    /* ===============================
       META: Submission Source
       - FORM: manual form submission
       - QR: if QR scanning flow exists
    =============================== */
    source: {
      type: String,
      enum: ["FORM", "QR"],
      default: "FORM",
    },

    /* ===============================
       VERIFIED FLAG
       - Can be used for validation checks
       - Default true in your implementation
    =============================== */
    verified: {
      type: Boolean,
      default: true,
    },

    /* ===============================
       TTL FIELD (AUTO DELETE AFTER 3 DAYS)
       - createdAt is used as TTL index
       - expires value is in seconds
       - MongoDB will auto-delete document after TTL duration
    =============================== */
    createdAt: {
      type: Date,
      default: Date.now,

      // ⏰ 3 DAYS TTL (60 sec * 60 min * 24 hr * 3 days)
      expires: 60 * 60 * 24 * 3,
    },
  },
  {
    // ✅ disables __v
    versionKey: false, // clean documents
  }
);

// ✅ Export model
module.exports = mongoose.model(
  "EventAttendance",
  EventAttendanceSchema
);
