// ===============================
// File: frontend/src/services/api.js
// Purpose: Central Axios API Service for yesSir Project
// Features:
// 1) Creates a reusable Axios instance with backend baseURL
// 2) Automatically attaches JWT token in Authorization header for every request
//    - Format: "Bearer <token>"
// 3) Auto logout + redirect if token expires / becomes invalid (401 handling)
// 4) Used across frontend components (Admin, Faculty, Student, Coordinator)
// ===============================

import axios from "axios";

// ✅ Create axios instance for backend API calls
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
});

// ===============================
// AXIOS REQUEST INTERCEPTOR
// - Runs before every request is sent
// - Reads token from localStorage
// - If token exists -> adds Authorization header
// ===============================
API.interceptors.request.use((config) => {
  const t = localStorage.getItem("token"); // ✅ get JWT token from localStorage

  // ✅ attach token to request headers if available
  if (t) config.headers.Authorization = "Bearer " + t;

  return config; // ✅ return modified config
});

// ===============================
// AXIOS RESPONSE INTERCEPTOR
// - Runs after every response/error
// - If backend returns 401 (token expired/invalid)
//   -> auto logout + redirect to home
// ===============================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // ✅ Auto logout on unauthorized
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // ✅ redirect safely
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default API; // ✅ export API instance for app-wide usage
