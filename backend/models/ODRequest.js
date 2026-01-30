// ===============================
// File: backend/models/ODRequest.js
// Purpose: Mongoose Model for OD Requests (yesSir Project)
// Features:
// 1) Stores OD request submitted by student
// 2) Links request to student using studentId (User reference)
// 3) Stores OD details: admissionId, section, reason, date range
// 4) Stores proof file URL (optional)
// 5) Tracks status: pending/approved/rejected
// 6) eventTag (IMPORTANT):
//    - null => normal OD request (manual)
//    - string => Event-based OD (generated via event/excel logic)
// ===============================

const mongoose = require("mongoose"); // ✅ MongoDB ODM (Mongoose)

/* ===============================
   OD REQUEST SCHEMA
   - One document = one OD request
=============================== */
const ODRequestSchema = new mongoose.Schema(
  {
    /* ===============================
       STUDENT LINK
       - References the User who applied OD
    =============================== */
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ relation to User model
      required: true,
    },

    /* ===============================
       OPTIONAL STUDENT DETAILS SNAPSHOT
       - admissionId + section can be stored separately also
       - helps when studentId relation isn't populated
    =============================== */
    admissionId: {
      type: String,
    },

    section: {
      type: String,
    },

    /* ===============================
       OD REQUEST DATA
       - reason + date range
    =============================== */
    reason: String,
    fromDate: Date,
    toDate: Date,

    /* ===============================
       PROOF UPLOAD
       - Stores uploaded file URL/path (image/pdf)
    =============================== */
    proofUrl: String,

    /* ===============================
       STATUS TRACKING
       - pending: waiting for faculty/coordinator decision
       - approved: accepted OD
       - rejected: declined OD
    =============================== */
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    /* ===============================
       MOST IMPORTANT FIELD: eventTag
       - Used to differentiate Event-based OD vs Manual OD
       - null => normal OD request (student form)
       - string => event-based OD (ex: Excel upload or event attendance)
    =============================== */
    eventTag: {
      type: String,
      default: null,
    },
    expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 4), // ✅ 4 days
    expires: 0, // ✅ TTL based on expiresAt
    },
    },
  {
    // ✅ Adds createdAt and updatedAt timestamps automatically
    timestamps: true,
  }
);

// ✅ Export ODRequest model
module.exports = mongoose.model("ODRequest", ODRequestSchema);
