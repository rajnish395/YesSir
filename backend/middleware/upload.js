// ===============================
// File: backend/middleware/upload.js
// Purpose: File Upload Middleware (Multer) for yesSir Project
// Features:
// 1) Uses multer diskStorage to store uploaded files on server
// 2) Saves files inside "uploads/" folder
// 3) Generates unique filename using timestamp + original filename
// 4) Exported middleware used in routes (ex: OD proof upload)
// ===============================

const multer = require("multer"); // ✅ Multer for handling multipart/form-data (file uploads)

/* ===============================
   MULTER STORAGE CONFIG
   - destination: where files will be stored
   - filename: custom filename generator for uniqueness
=============================== */
const storage = multer.diskStorage({
  // ✅ Upload folder path
  destination: (req, file, cb) => cb(null, "uploads/"),

  // ✅ Filename format: <timestamp>-<originalname>
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

/* ===============================
   UPLOAD MIDDLEWARE INSTANCE
   - Uses the defined storage config
=============================== */
const upload = multer({ storage });

module.exports = upload; // ✅ Export upload middleware for use in routes
