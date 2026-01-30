// ===============================
// File: backend/routes/admin.js
// Purpose: Admin Routes for yesSir Project
// Features (Admin Only):
// 1) GET /admin/users          -> Fetch all users list (without passwords)
// 2) POST /admin/add-user      -> Create new user with QID (admissionId) based system
// 3) DELETE /admin/delete/:id  -> Delete a user by MongoDB id
// 4) PUT /admin/change-role/:id -> Update user's role
// Security:
// - Uses auth middleware (JWT required)
// - Uses adminOnly middleware (role must be admin)
// ===============================

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // ✅ Used to hash passwords
const auth = require("../middleware/auth"); // ✅ JWT auth middleware
const User = require("../models/User"); // ✅ User model

// ===============================
// ADMIN ONLY MIDDLEWARE
// - Allows access only if logged-in user role = "admin"
// - auth middleware must run before this so req.user is available
// ===============================
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

/* =========================
   ROUTE: GET ALL USERS
   METHOD: GET /admin/users
   Access: Admin only
   Output: Array of users (password excluded)
========================= */
router.get("/users", auth, adminOnly, async (req, res) => {
  try {
    // ✅ Fetch all users, remove password field, return plain JS objects
    const users = await User.find().select("-password").lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   ROUTE: ADD USER
   METHOD: POST /admin/add-user
   Access: Admin only
   Purpose:
   - Create user with admissionId(QID), name, optional email, password, role
   - Ensures admissionId unique
   - Ensures email unique only if provided
========================= */
router.post("/add-user", auth, adminOnly, async (req, res) => {
  try {
    // ✅ Extract fields from request body
    const { admissionId, name, email, password, role, section } = req.body;


    // ✅ Basic validation: required fields check
    if (!admissionId || !name || !password || !role) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // ✅ Check duplicate admissionId (QID must be unique)
    const existsQid = await User.findOne({ admissionId });
    if (existsQid) {
      return res.status(400).json({ message: "Admission ID already exists" });
    }

    // ✅ Email optional check (only if provided)
    if (email && email.trim()) {
      const existsEmail = await User.findOne({ email: email.trim() });
      if (existsEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // ✅ Hash password before saving to DB
    const hashed = await bcrypt.hash(password, 10);

    // ✅ Create user document in DB
    const user = await User.create({
      admissionId: admissionId.trim(),
      name: name.trim(),
      email: email?.trim() || "", // optional
      password: hashed,
      role,
      section: role === "student" ? (section || "").trim() : "",
    });

    // ✅ Send response with user info (excluding password)
    res.json({
      message: "User created",
      user: {
        id: user._id,
        admissionId: user.admissionId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("ADD USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   ROUTE: DELETE USER
   METHOD: DELETE /admin/delete/:id
   Access: Admin only
   Purpose:
   - Deletes a user document by ID
========================= */
router.delete("/delete/:id", auth, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id); // ✅ delete user
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   ROUTE: CHANGE ROLE
   METHOD: PUT /admin/change-role/:id
   Access: Admin only
   Purpose:
   - Updates role of user by ID
========================= */
router.put("/change-role/:id", auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.body; // ✅ new role
    await User.findByIdAndUpdate(req.params.id, { role }); // ✅ update role
    res.json({ message: "Role updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router; // ✅ export router for server usage
