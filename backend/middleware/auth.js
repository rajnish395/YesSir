// ===============================
// File: backend/middleware/auth.js
// Purpose: JWT Authentication Middleware for yesSir Project
// Features:
// 1) Reads Authorization header from request
// 2) Extracts JWT token (supports "Bearer <token>" format)
// 3) Verifies token using JWT_SECRET (env) or fallback "secret123"
// 4) Stores decoded user info into req.user
// 5) Blocks request if token missing/invalid
// ===============================

const jwt = require('jsonwebtoken'); // ✅ JWT library for token verification

module.exports = (req, res, next) => {
  /* ===============================
     STEP 1: Read Authorization header
     - Usually looks like: "Bearer <token>"
  =============================== */
  const header = req.headers['authorization'];

  // ✅ If no Authorization header found -> unauthorized
  if (!header) return res.status(401).json({ message: 'No token provided' });

  /* ===============================
     STEP 2: Extract token
     - If header = "Bearer abc.xyz.123" -> split and take token
     - Else if header directly contains token -> use it
  =============================== */
  const token = header.split(' ')[1] || header;

  try {
    /* ===============================
       STEP 3: Verify token
       - Uses JWT_SECRET from .env
       - Fallback secret used if env not present (not recommended for production)
    =============================== */
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

    // ✅ Attach decoded payload (user info) to request for next handlers
    req.user = decoded;

    // ✅ Allow request to proceed to next middleware/controller
    next();
  } catch (err) {
    /* ===============================
       STEP 4: Invalid token handling
       - Token expired / malformed / wrong secret => 401
    =============================== */
    return res.status(401).json({ message: 'Invalid token' });
  }
};
