// ===============================
// File: backend/routes/auth.js
// Purpose: Authentication Routes for yesSir Project
// Routes:
// 1) POST /auth/register -> Register new user (QID required, email optional)
// 2) POST /auth/login    -> Login existing user (email + password)
// Features:
// - Uses bcryptjs to hash/compare passwords
// - Uses JWT token for authentication (expires in 7 days)
// - Stores user role in JWT payload for role-based access
// ===============================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // ✅ password hashing/comparison
const jwt = require('jsonwebtoken'); // ✅ JWT token creation
const User = require("../models/User.js"); // ✅ User model

/* ===============================
   ROUTE: REGISTER
   METHOD: POST /auth/register
   Purpose:
   - Create new user account
   - QID (admissionId) is required
   - Email is optional
   - Prevent duplicate QID and duplicate email (only if provided)
   - Returns JWT token + user details
=============================== */
router.post("/register", async (req, res) => {
  try {
    // ✅ Extract request fields
    const { name, email, password, role, department, admissionId } = req.body;

    // ✅ QID required (email optional)
    if (!name || !password || !admissionId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // ✅ Check duplicate QID (admissionId must be unique)
    let existingQID = await User.findOne({ admissionId });
    if (existingQID) {
      return res.status(400).json({ message: "QID already exists" });
    }

    // ✅ Check duplicate email ONLY if provided
    if (email && email.trim()) {
      let existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // ✅ Hash password before saving to DB
    const hashed = await bcrypt.hash(password, 10);

    // ✅ Create new user document
    const user = new User({
      name,
      admissionId: admissionId.toString().trim(), // ✅ save QID properly
      email: email ? email.trim() : "", // ✅ email is optional
      password: hashed,
      role: role || "student", // ✅ default role student
      department: department || "",
    });

    // ✅ Save to MongoDB
    await user.save();

    // ✅ Generate JWT token (store id + role in payload)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    // ✅ Send token + user details to frontend
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        admissionId: user.admissionId, // ✅ important
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).send("Server error");
  }
});

/* ===============================
   ROUTE: LOGIN
   METHOD: POST /auth/login
   Purpose:
   - Login using email + password
   - Verifies user exists
   - Compares hashed password using bcrypt
   - Returns JWT token + user details
=============================== */
router.post("/login", async (req, res) => {
  try {
    // ✅ Extract email + password
    const { email, password } = req.body;

    // ✅ Basic validation
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    // ✅ Find user by email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    // ✅ Compare password with stored hash
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    // ✅ Generate JWT token with id + role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    // ✅ Send response to frontend
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        admissionId: user.admissionId, // ✅ included so frontend can show QID everywhere
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router; // ✅ export router
