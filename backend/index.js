require("dotenv").config(); // ✅ Load environment variables from .env

const express = require("express"); // ✅ Express framework
const cors = require("cors"); // ✅ Allow cross-origin requests (frontend -> backend)
const connectDB = require("./database"); // ✅ MongoDB connection function

const app = express(); // ✅ Create express app instance

/* ===============================
   GLOBAL MIDDLEWARES
=============================== */

// ✅ Enable CORS (so frontend can call backend APIs)
app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = [
        process.env.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.0.0:3000", // ❌ useless but ok
      ].filter(Boolean);

      // ✅ allow Postman / server-to-server (no origin)
      if (!origin) return cb(null, true);

      // ✅ allow any LAN IP:3000 (phone access)
      if (origin.startsWith("http://192.168.")) return cb(null, true);
      if (origin.startsWith("http://10.")) return cb(null, true);
      if (origin.startsWith("http://172.")) return cb(null, true);

      if (allowed.includes(origin)) return cb(null, true);

      return cb(new Error("CORS blocked: " + origin));
    },
    credentials: true,
  })
);





// ✅ Parse incoming JSON requests
app.use(express.json());

// ✅ Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files from uploads folder
// Example: http://localhost:5000/uploads/<filename>
app.use("/uploads", express.static("uploads"));

/* ===============================
   DATABASE CONNECTION
=============================== */

// ✅ Connect to MongoDB
connectDB();

/* ===============================
   ROUTES (API ENDPOINTS)
   Base prefix: /api/...
=============================== */

// ✅ Auth routes: register/login
app.use("/api/auth", require("./routes/auth"));

// ✅ OD routes: apply OD, list all, bulk event OD, update status
app.use("/api/od", require("./routes/od"));

// ✅ Event routes: create/start/list/submissions/form-submit
app.use("/api/events", require("./routes/event"));

// ✅ Event form routes (separate system)
//app.use("/api/event-form", require("./routes/eventForm"));

// ✅ Admin routes: manage users (CRUD + role)
app.use("/api/admin", require("./routes/admin"));

/* ===============================
   HEALTH CHECK ROUTE
=============================== */

// ✅ Quick check endpoint for backend status
app.get("/", (_, res) => res.send("Backend Running..."));

/* ===============================
   SERVER START
=============================== */

// ✅ Server port (default 5000)
const PORT = process.env.PORT || 5000;

// ✅ Start listening
app.listen(PORT, () => console.log("SERVER RUNNING:", PORT));
