const mongoose = require("mongoose");

const QRSessionSchema = new mongoose.Schema(
  {
    // ✅ link with Event
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    // ✅ random token stored in DB
    rotationSalt: {
      type: String,
      required: true,
    },

    // ✅ token expiry time
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    // ✅ session active flag
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("QRSession", QRSessionSchema);
