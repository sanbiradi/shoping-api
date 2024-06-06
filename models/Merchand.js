const mongoose = require("mongoose");

const merchandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    companyName: { type: String, required: true },
    picture: { type: String },
    deleted: { type: Boolean },
    role: { type: String },
    isEmailVerified: { type: Boolean },
    AdminUsers: { type: [String] },
    Products:{type:[String]}
  },
  { timestamps: true }
);

const Merchand = mongoose.model("Merchand", merchandSchema);
module.exports = Merchand;
