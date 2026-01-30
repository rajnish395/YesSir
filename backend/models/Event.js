// ===============================
// File: backend/models/Event.js
// Purpose: Mongoose Model for Event Module (yesSir Project)
// Features:
// 1) Stores event details (name, venue, timings)
// 2) Tracks organizer (User reference)
// 3) Supports linkedSubjects array (optional)
// 4) active flag indicates current running event attendance state
// 5) timestamps enabled for createdAt / updatedAt
// ===============================

const mongoose = require("mongoose"); // ✅ MongoDB ODM (Mongoose)

/* ===============================
   EVENT SCHEMA
   - Defines structure of Event documents in MongoDB
=============================== */
const EventSchema = new mongoose.Schema(
  {
    // ✅ Event name (required)
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ Event venue/location (optional)
    venue: {
      type: String,
      trim: true,
    },

    // ✅ Event start time (set when event is started)
    startTime: {
      type: Date,
    },

    // ✅ Event end time (optional, can be set when event ends)
    endTime: {
      type: Date,
    },

    // ✅ Organizer reference (faculty/coordinator who created the event)
    organizer: {
      type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId reference
      ref: "User", // ✅ relation to User model
      required: true,
      index: true, // ✅ indexed for faster lookup
    },

    // ✅ Optional: subjects/topics linked with this event
    linkedSubjects: {
      type: [String],
      default: [],
    },

    // ✅ OPTIONAL BUT IMPORTANT
    // active: true => attendance currently ongoing
    // active: false => not running
    active: {
      type: Boolean,
      default: false,
      index: true, // ✅ index for fast filtering (active events)
    },
  },
  {
    // ✅ Automatically adds createdAt and updatedAt
    timestamps: true, // 🔥 createdAt / updatedAt

    // ✅ Removes __v version key from documents
    versionKey: false,
  }
);

// ✅ Export Event model
module.exports = mongoose.model("Event", EventSchema);
