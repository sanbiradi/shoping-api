const mongoose = require("mongoose");

const EmailInboxSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true, // Ensure email is stored in lowercase to avoid case sensitivity issues
      trim: true, // Trim whitespace from email input
    },
    emailsList: [
      {
        token: { type: String, required: true },
        subject: { type: String, required: true }, // 'subject' can be optional, so it doesn't necessarily need 'required: true'
      },
    ],
  },
  { timestamps: true }
);

// Use singular naming convention for schema and model
const EmailInbox = mongoose.model("EmailInbox", EmailInboxSchema);

module.exports = EmailInbox;
