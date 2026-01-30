import React, { useState } from "react";
import QRCode from "react-qr-code";
import API from "../../services/api";

export default function EventAttendance({ onEventStart }) {
  const [eventName, setEventName] = useState("");
  const [eventId, setEventId] = useState(null);
  const [eventStarted, setEventStarted] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const PUBLIC_URL = process.env.REACT_APP_PUBLIC_URL || window.location.origin;

  const createEvent = async () => {
    if (!eventName.trim()) {
      alert("Event name required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/events/create", {
        name: eventName,
        venue: "Seminar Hall",
      });

      const newEventId = res.data._id;
      setEventId(newEventId);

      // ✅ Auto start attendance immediately after create
      const startRes = await API.post(`/events/start/${newEventId}`);

      if (!startRes.data?.qr) {
        throw new Error("QR not received from server");
      }

      setQrData(startRes.data.qr);
      setEventStarted(true);

      // ✅ notify parent
      if (onEventStart) {
        onEventStart({
          id: newEventId,
          name: eventName,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Event creation failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const svg = document.querySelector("#event-qr svg");
    if (!svg) return;

    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `event-${eventId}-qr.svg`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const endEvent = async () => {
    try {
      await API.post(`/events/end/${eventId}`);
      alert("Event ended. Attendance closed.");

      // ✅ reset
      setEventName("");
      setEventId(null);
      setEventStarted(false);
      setQrData(null);
      setError("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to end event");
    }
  };

  return (
    <div style={card}>
      <p style={{ color: "#555", textAlign: "center" }}>
        QR based event attendance
      </p>

      {error && <p style={{ color: "red", marginBottom: 10 }}>{error}</p>}

      {!eventId && (
        <>
          <input
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            style={input}
          />

          <button style={primaryBtn} onClick={createEvent} disabled={loading}>
            {loading ? "Creating..." : "Create Event"}
          </button>
        </>
      )}

      {eventStarted && qrData && (
        <div style={{ marginTop: 30, textAlign: "center" }}>
          <p style={{ fontWeight: 600 }}>
            Students scan this QR to fill attendance form
          </p>

          <div
            id="event-qr"
            style={{
              background: "white",
              padding: 20,
              display: "inline-block",
            }}
          >
            <QRCode
              size={260}
              value={`${PUBLIC_URL}/event-form/${eventId}?token=${qrData?.token}`}
            />
          </div>

          <p style={{ fontSize: 13, color: "#666", marginTop: 8 }}>
            Opens form on student phone browser
          </p>

          <button
            onClick={downloadQR}
            style={{
              marginTop: 12,
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid #1976d2",
              background: "white",
              color: "#1976d2",
              cursor: "pointer",
            }}
          >
            Download QR
          </button>

          <button
            onClick={endEvent}
            style={{
              marginTop: 10,
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid #dc2626",
              background: "white",
              color: "#dc2626",
              cursor: "pointer",
              marginLeft: 10,
            }}
          >
            End Event
          </button>
        </div>
      )}
    </div>
  );
}

const card = {
  background: "white",
  padding: 30,
  borderRadius: 14,
  maxWidth: 600,
  margin: "0 auto",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
  marginTop: 50,
};

const input = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const primaryBtn = {
  padding: "12px 20px",
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: 6,
  fontWeight: 600,
  cursor: "pointer",
};
