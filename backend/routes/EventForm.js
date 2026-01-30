// ===============================
// File: backend/routes/EventForm.js
// Purpose: Event Attendance Form Routes (yesSir Project)
// Features:
// 1) Public form submission endpoint (students submit attendance)
// 2) Fetch list of submissions for a given event
// Models used:
// - Event (to validate event exists)
// - EventFormEntry (to store submissions)
// Notes:
// - This is a separate attendance form system from EventAttendance model
//   (your project currently also has /events/form-submit using EventAttendance)
// ===============================

const express = require("express");
const router = express.Router();

// ===============================
// MODELS
// ===============================
const Event = require("../models/Event");
const EventFormEntry = require("../models/EventFormEntry");

/* ======================================================
   ROUTE: SUBMIT EVENT ATTENDANCE FORM (PUBLIC)
   METHOD: POST /event-form/submit/:eventId
   Access: Public (No Auth)
   Purpose:
   - Student submits attendance for specific event
   - Validates required fields
   - Prevents duplicate submission (same admissionId for same event)
   - Saves submission in EventFormEntry collection
====================================================== */
router.post("/submit/:eventId", async (req, res) => {
  try {
    // ✅ Extract form data
    const { name, admissionId, section, email } = req.body;

    // ✅ Validate required fields
    if (!name || !admissionId || !section || !email) {
      return res
        .status(400)
        .json({ message: "All fields required" });
    }

    // ✅ Ensure event exists
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // ✅ Duplicate entry check (same event + same admissionId)
    const already = await EventFormEntry.findOne({
      eventId: event._id,
      admissionId,
    });

    if (already) {
      return res
        .status(400)
        .json({ message: "Attendance already submitted" });
    }

    // ✅ Save submission
    await EventFormEntry.create({
      eventId: event._id,
      name,
      admissionId,
      section,
      email,
    });

    res.json({ message: "Attendance submitted successfully" });
  } catch (err) {
    console.error("FORM SUBMIT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   ROUTE: GET EVENT FORM SUBMISSIONS (FACULTY)
   METHOD: GET /event-form/list/:eventId
   Access: Public right now (No Auth in this route)
   Purpose:
   - Returns all submitted entries for given eventId
   - Sorts latest submission first using submittedAt
====================================================== */
router.get("/list/:eventId", async (req, res) => {
  try {
    // ✅ Fetch all submissions for an event
    const list = await EventFormEntry.find({
      eventId: req.params.eventId,
    }).sort({ submittedAt: -1 });

    res.json(list);
  } catch (err) {
    console.error("FORM LIST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router; // ✅ export router
