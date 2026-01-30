// ===============================
// File: backend/routes/coordinator.js
// Purpose: Coordinator Routes for yesSir Project
// Features:
// 1) Provides protected Coordinator Dashboard access endpoint
// Security:
// - Uses auth middleware (JWT required)
// - Checks req.user.role must be "coordinator"
// ===============================

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // ✅ JWT auth middleware

/* ======================================================
   ROUTE: COORDINATOR DASHBOARD
   METHOD: GET /coordinator/dashboard
   Access: Coordinator only
   Purpose:
   - Confirms coordinator has access
   - Returns basic coordinator info from JWT payload
====================================================== */
router.get("/dashboard", auth, async (req, res) => {
  try {
    // ✅ Role-based protection (must be coordinator)
    if (req.user.role !== "coordinator") {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ Success response if role is coordinator
    res.json({
      message: "Coordinator dashboard access granted",
      coordinator: {
        id: req.user.id,
        role: req.user.role,
      },
    });
  } catch (err) {
    console.error("COORDINATOR DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router; // ✅ export router
