// ===============================
// File: backend/routes/event.js
// Purpose: Event Attendance Routes for yesSir Project
// Features:
// 1) Faculty/Coordinator can create events
// 2) Faculty/Coordinator can start event + generate QR session token
// 3) Public attendance form submission (no auth) for students
// 4) Faculty/Coordinator can view submissions list for an event
// 5) Faculty/Coordinator can list all events (latest first)
// Security:
// - auth middleware required for create/start/submissions/list
// - Public form submission does NOT require auth (QR access)
// ===============================

const express = require("express");
const router = express.Router();
const crypto = require("crypto"); // ✅ Used to generate random token for QR session
const auth = require("../middleware/auth"); // ✅ JWT auth middleware

// ===============================
// MODELS
// ===============================
const Event = require("../models/Event");
const EventAttendance = require("../models/EventAttendance");
const QRSession = require("../models/QRSession");

/* ======================================================
   ROUTE: CREATE EVENT
   METHOD: POST /events/create
   Access: Faculty / Coordinator
   Purpose:
   - Creates a new event document
   - Organizer set from req.user.id (JWT payload)
====================================================== */
router.post("/create", auth, async (req, res) => {
  try {
    // ✅ Role check: only faculty/coordinator can create event
    if (!["faculty", "coordinator"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // ✅ Basic validation: event name required
    if (!req.body.name) {
      return res.status(400).json({ message: "Event name required" });
    }

    // ✅ Create event in DB
    const event = await Event.create({
      name: req.body.name,
      venue: req.body.venue || "",
      organizer: req.user.id,
      active: false,
    });

    // ✅ Send created event object to frontend
    res.json(event);
  } catch (err) {
    console.error("CREATE EVENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   ROUTE: START EVENT + GENERATE QR
   METHOD: POST /events/start/:eventId
   Access: Faculty / Coordinator
   Purpose:
   - Activates event (sets active=true and startTime)
   - Deletes old QR sessions
   - Creates new QR session with 15 minute expiry
   - Returns QR data (eventId + token + expiresAt)
====================================================== */
router.post("/start/:eventId", auth, async (req, res) => {
  try {
    // ✅ Role check
    if (!["faculty", "coordinator"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // ✅ Find event by ID
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // ✅ Activate event only once (prevents resetting startTime repeatedly)
    if (!event.active) {
      event.active = true;
      event.startTime = new Date();
      await event.save();
    }

    // ✅ Remove old QR sessions for this event (prevents multiple active QR)
    await QRSession.deleteMany({ eventId: event._id });

    // ✅ Create new QR session token (random)
    const token = crypto.randomBytes(16).toString("hex");

    // ✅ QR expiry time (15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // ✅ Save QR session in DB
    await QRSession.create({
      eventId: event._id,
      rotationSalt: token,
      expiresAt,
    });

    // ✅ Response contains QR details for frontend QR generation
    res.json({
      message: "Event started",
      qr: {
        eventId: event._id,
        token,
        expiresAt,
      },
    });
  } catch (err) {
    console.error("START EVENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   ROUTE: PUBLIC FORM SUBMISSION
   METHOD: POST /events/form-submit/:eventId
   Access: Public (NO AUTH)
   Purpose:
   - Students submit attendance using QR link
   - Validates all fields
   - Prevents duplicate submission by admissionId for same event
   - Stores entry in EventAttendance collection
====================================================== */
router.post("/form-submit/:eventId", async (req, res) => {
  try {
    const { name, admissionId, course, section, email, token } = req.body;

    // ✅ token required now
    if (!token) {
      return res.status(400).json({ message: "QR token missing" });
    }

    if (!name || !admissionId || !course || !section || !email) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // ✅ block submission if event is not active
    if (!event.active) {
      return res.status(403).json({
        message: "Event is closed. Attendance is no longer allowed.",
      });
    }

    // ✅ Verify QR session token exists + not expired + active
    const session = await QRSession.findOne({
      eventId: event._id,
      rotationSalt: token,
      isActive: true,
      expiresAt: { $gt: new Date() }, // ✅ not expired
    });

    if (!session) {
      return res.status(401).json({
        message: "QR expired or invalid. Please scan again.",
      });
    }

    // ✅ prevent duplicate attendance for same student
    const already = await EventAttendance.findOne({
      eventId: event._id,
      admissionId,
      source: "FORM",
    });

    if (already) {
      return res.json({
        message: "Attendance already submitted",
      });
    }

    await EventAttendance.create({
      eventId: event._id,
      name,
      admissionId,
      course,
      section,
      email,
      source: "FORM",
      verified: true,
    });

    res.json({
      message: "Attendance submitted successfully",
    });
  } catch (err) {
    console.error("FORM SUBMIT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   ROUTE: VIEW FORM SUBMISSIONS
   METHOD: GET /events/submissions/:eventId
   Access: Faculty / Coordinator
   Purpose:
   - Returns all attendance submissions (FORM source)
   - Sorted by latest first
====================================================== */
router.get("/submissions/:eventId", auth, async (req, res) => {
  try {
    // ✅ Role check
    if (!["faculty", "coordinator"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // ✅ Find attendance records for the event
    const list = await EventAttendance.find({
      eventId: req.params.eventId,
      source: "FORM",
    })
      .sort({ createdAt: -1 }) // ✅ latest submissions first
      .lean();

    res.json(list);
  } catch (err) {
    console.error("SUBMISSION LIST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   ✅ NEW ROUTE: SUBMISSIONS COUNT
   METHOD: GET /events/submissions-count/:eventId
   Access: Faculty / Coordinator
   Purpose:
   - Returns total number of submissions for event
====================================================== */
router.get("/submissions-count/:eventId", auth, async (req, res) => {
  try {
    // ✅ Role check
    if (!["faculty", "coordinator"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const count = await EventAttendance.countDocuments({
      eventId: req.params.eventId,
      source: "FORM",
    });

    res.json({ count });
  } catch (err) {
    console.error("COUNT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   ROUTE: LIST EVENTS
   METHOD: GET /events/list
   Access: Faculty / Coordinator
   Purpose:
   - Returns events list for dashboards
   - Used when refreshing event history
====================================================== */
router.get("/list", auth, async (req, res) => {
  try {
    if (!["faculty", "coordinator"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const events = await Event.find()
      .select("name active createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const filtered = [];

    for (const e of events) {
      const count = await EventAttendance.countDocuments({
        eventId: e._id,
        source: "FORM",
      });

      // ✅ attendance khatam => event row bhi hide
      if (count > 0) {
        filtered.push({
          ...e,
          count,
        });
      }
    }

    res.json(filtered);
  } catch (err) {
    console.error("EVENT LIST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ======================================================
   END EVENT (Faculty / Coordinator)
   ✅ closes attendance + disables QR session
====================================================== */
router.post("/end/:eventId", auth, async (req, res) => {
  try {
    if (!["faculty", "coordinator"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // ✅ mark event inactive + set endTime
    event.active = false;
    event.endTime = new Date();
    await event.save();

    // ✅ disable all QR sessions for this event
    await QRSession.updateMany(
      { eventId: event._id },
      { $set: { isActive: false } }
    );

    res.json({ message: "Event ended successfully", eventId: event._id });
  } catch (err) {
    console.error("END EVENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router; // ✅ export router
