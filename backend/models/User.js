// ===============================
// File: backend/models/User.js
// Purpose: Mongoose User Model for yesSir Project
// Features:
// 1) Stores user identity + login credentials
// 2) admissionId is used as QID (unique identifier)
// 3) Email is optional (default empty string) but unique if provided
// 4) Role-based system supported:
//    - student
//    - faculty
//    - coordinator
//    - admin
// 5) Used for authentication + authorization across dashboards
// ===============================

const mongoose = require("mongoose"); // ✅ MongoDB ODM (Mongoose)

/* ===============================
   USER SCHEMA
   - One document = one user account
=============================== */
const UserSchema = new mongoose.Schema({
  // ✅ Full name of the user
  name: { type: String, required: true },

  /* ===============================
     QID / Admission ID
     - Required and unique in system
     - Works for student/faculty/coordinator/admin IDs
  =============================== */
  admissionId: {
    type: String,
    required: true,
    unique: true, // ✅ QID unique
    trim: true,
  },

  /* ===============================
     Email (Optional)
     - Unique if present
     - Default empty string
  =============================== */
  email: { type: String, unique: true, default: "" }, // ✅ email optional

  // ✅ Password (stored hashed in controller ideally)
  password: { type: String, required: true },

  /* ===============================
     Role-based Access Control
     - Determines dashboard and permissions
  =============================== */
  role: {
    type: String,
    enum: ["student", "faculty", "coordinator", "admin"], // ✅ admin add (optional but useful)
    default: "student",
  },

  // ✅ Optional: Department of user (can be used in future)
  department: { type: String, default: "" },

  section: { type: String, default: "" },

});

// ✅ Export User model
module.exports = mongoose.model("User", UserSchema);
