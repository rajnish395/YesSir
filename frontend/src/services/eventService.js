// ===============================
// File: frontend/src/services/eventService.js
// Purpose: Event Attendance API Service for yesSir Project
// Features:
// 1) Contains reusable helper functions for Event module
// 2) Uses existing API instance (axios + token interceptor)
// 3) Keeps event-related endpoints in one place
// ===============================

import API from "./api"; // ✅ Axios instance with baseURL + Authorization token interceptor

/*
  ===============================
  Event Attendance Related APIs
  - This file wraps event module endpoints
  - Existing API.js (central axios instance) is used here (safe + consistent)
  ===============================
*/

// ✅ Create a new event (faculty/coordinator)
// API: POST /events/create
export const createEvent = (data) =>
  API.post("/events/create", data);

// ✅ Start attendance for an existing event (generates QR)
// API: POST /events/start/:eventId
export const startEvent = (eventId) =>
  API.post(`/events/start/${eventId}`);

// ✅ Scan event QR endpoint (if implemented in backend)
// API: POST /events/scan/:eventId
export const scanEventQR = (eventId) =>
  API.post(`/events/scan/${eventId}`);

// ✅ Get verified students list for an event (if implemented in backend)
// API: GET /events/verified/:eventId
export const getVerifiedStudents = (eventId) =>
  API.get(`/events/verified/${eventId}`);
