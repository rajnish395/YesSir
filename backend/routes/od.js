// ===============================
// File: backend/routes/od.js
// Purpose: OD (On Duty) Routes for yesSir Project
// Features:
// 1) Student applies OD with optional proof upload (image/pdf)
// 2) Faculty/Coordinator can view all OD requests
// 3) Coordinator can bulk-create Event ODs via Excel upload
// 4) Faculty/Coordinator can update OD status (approve/reject/pending)
// Tech Used:
// - auth middleware (JWT protection)
// - multer for file uploads
// - xlsx for Excel parsing
// Models:
// - ODRequest
// - User
// ===============================

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // ✅ JWT auth middleware
const multer = require("multer"); // ✅ for handling multipart/form-data uploads
const xlsx = require("xlsx"); // ✅ for reading Excel sheets

// ===============================
// MODELS
// ===============================
const ODRequest = require("../models/ODRequest");
const User = require("../models/User");

// ------------------ MULTER UPLOAD ------------------
// ✅ Storage config for saving uploaded files to /uploads folder
const storage = multer.diskStorage({
  // ✅ destination folder for uploaded files
  destination: (req, file, cb) => cb(null, "uploads/"),

  // ✅ unique filename to prevent collisions
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

// ✅ Create multer upload instance with storage config
const upload = multer({ storage });

// ------------------ STUDENT APPLY OD ------------------
// ROUTE: POST /od/apply
// Access: Authenticated user (student)
// Purpose:
// - Student submits OD request with reason + dates + optional proof file
// - AdmissionId and section auto-filled from DB using req.user.id
router.post("/apply", auth, upload.single("proof"), async (req, res) => {
  try {
    const { reason, fromDate, toDate } = req.body;

    // ✅ Fetch student details from DB using token user id
    const student = await User.findById(req.user.id).select("admissionId section");

    // ✅ If student not found in DB
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // ✅ Basic validation
    if (!reason || !fromDate || !toDate) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // ✅ Date validation: fromDate must be <= toDate
const f = new Date(fromDate);
const t = new Date(toDate);

if (isNaN(f.getTime()) || isNaN(t.getTime())) {
  return res.status(400).json({ message: "Invalid date format" });
}

if (f > t) {
  return res.status(400).json({ message: "From Date cannot be after To Date" });
}

    // ✅ Create OD request
    const od = await ODRequest.create({
      studentId: req.user.id, // ✅ link OD to student
      admissionId: student.admissionId,  // ✅ AUTO QID from DB
      section: student.section || "",    // ✅ AUTO section from DB (if exists)
      reason,
      fromDate,
      toDate,
      // ✅ Save proof file path if uploaded
      proofUrl: req.file ? "/uploads/" + req.file.filename : "",
    });

    // ✅ Success response
    res.json({ msg: "OD applied", od });
  } catch (err) {
    console.error("APPLY ERROR:", err);
    res.status(500).send("Server error");
  }
});

// ------------------ GET ALL ODs (Faculty/Coordinator) ------------------
// ROUTE: GET /od/all
// Access: Authenticated users (faculty/coordinator/student/admin)
// Purpose:
// - Returns all OD requests with populated student info
// ------------------ GET ALL ODs (Faculty/Coordinator/Admin ONLY) ------------------
router.get("/all", auth, async (req, res) => {
  try {
    // ✅ allow only faculty/coordinator/admin
    if (!["faculty", "coordinator", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const ods = await ODRequest.find().populate(
      "studentId",
      "name email role admissionId"
    );

    res.json(ods);
  } catch (err) {
    console.error("ALL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ GET MY ODs (Student ONLY) ------------------
router.get("/my", auth, async (req, res) => {
  try {
    // ✅ allow only student
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const myOds = await ODRequest.find({ studentId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(myOds);
  } catch (err) {
    console.error("MY OD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ===============================
//   BULK EVENT OD APPLY (Excel Upload)
// ===============================
// ROUTE: POST /od/bulk-event
// Access: Coordinator only
// Purpose:
// - Coordinator uploads Excel file with admissionIds
// - Creates OD requests for each valid student for a specific event
// - Prevents duplicates using eventTag field
router.post(
  "/bulk-event",
  auth,
  upload.single("excel"),
  async (req, res) => {
    try {
      // ✅ Only coordinator can bulk apply event OD
      if (req.user.role !== "coordinator") {
        return res.status(403).json({ message: "Not allowed" });
      }

      // ✅ Excel file validation
      if (!req.file) {
        return res.status(400).json({ message: "Excel file missing" });
      }

      // ✅ Event name is mandatory (used as eventTag)
      const eventName = req.body.eventName;
      if (!eventName) {
        return res.status(400).json({ message: "Event name is required" });
      }

      // ✅ Read Excel workbook from uploaded file path
      const workbook = xlsx.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet);

      let createdCount = 0;
      let skippedCount = 0;

      // ✅ Iterate over each excel row
      for (let row of rows) {
        // ✅ admissionId can be in different column names (flexible)
        const admissionId =
          row.admissionId || row.AdmissionId || row.ADMISSIONID;

        // ✅ Skip if admissionId missing in row
        if (!admissionId) {
          skippedCount++;
          continue;
        }

        // ✅ Find student by admissionId
        const student = await User.findOne({
          admissionId: admissionId.toString().trim(),
        });

        // ✅ Skip if student not found
        if (!student) {
          skippedCount++;
          continue;
        }

        // ✅ Prevent duplicate event OD for same student and eventTag
        const existing = await ODRequest.findOne({
          studentId: student._id,
          eventTag: eventName,
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        // ✅ Create OD request tagged with eventName
        await ODRequest.create({
          studentId: student._id,
          admissionId: student.admissionId || "",
          section: student.section || "",
          reason: `Event: ${eventName}`,
          fromDate: new Date(),
          toDate: new Date(),
          status: "pending",
          eventTag: eventName, // ✅ marks this as Event-based OD
          proofUrl: "",
        });

        createdCount++;
      }

      // ✅ Return summary of created vs skipped rows
      res.json({
        message: "Event OD Applied",
        createdCount,
        skippedCount,
      });
    } catch (err) {
      console.error("BULK EVENT ERROR:", err);
      res.status(500).send("Server error");
    }
  }
);

// ------------------ UPDATE OD STATUS ------------------
// ROUTE: PUT /od/update/:id
// Access: Authenticated users (faculty/coordinator/admin ideally)
// Purpose:
// - Updates OD request status (approved/rejected/pending)
// ------------------ UPDATE OD STATUS (Faculty/Coordinator/Admin ONLY) ------------------
router.put("/update/:id", auth, async (req, res) => {
  try {
    // ✅ allow only faculty/coordinator/admin
    if (!["faculty", "coordinator", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const { status } = req.body;

    // ✅ allow only valid status values
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const od = await ODRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!od) return res.status(404).send("OD not found");

    res.json(od);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).send("Server error");
  }
});


module.exports = router; // ✅ export router
