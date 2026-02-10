// ===============================
// File: backend/models/EventFormEntry.js
// Purpose: Mongoose Model for Event Form Submissions (yesSir Project)
// Features:
// 1) Stores event attendance form entries submitted by students
// 2) Each entry is linked to an event using eventId reference
// 3) Stores student details (name, admissionId, section, email)
// 4) Stores submittedAt timestamp (default: Date.now)
// ===============================

const mongoose = require("mongoose"); // ✅ MongoDB ODM (Mongoose)

/* ===============================
   EVENT FORM ENTRY SCHEMA
   - One document = one student submission for a particular event
=============================== */
const EventFormEntrySchema = new mongoose.Schema({
  // ✅ Link to Event document
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event", // ✅ relationship to Event model
    required: true,
  },

  // ✅ Student full name
  name: {
    type: String,
    required: true,
    trim: true,
  },

  // ✅ Student Admission ID / QID
  admissionId: {
    type: String,
    required: true,
    trim: true,
  },

  // ✅ Student section (A/B/C)
  section: {
    type: String,
    required: true,
    trim: true,
  },

  // ✅ Student email
  email: {
    type: String,
    required: true,
    trim: true,
  },

  // ✅ Submission timestamp
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Export EventFormEntry model
module.exports = mongoose.model(
  "EventFormEntry",
  EventFormEntrySchema
);
