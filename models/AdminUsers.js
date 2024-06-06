const mongoose = require("mongoose");

const AdminUsersSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    picture: { type: String },
    deleted: { type: Boolean },
    role: { type: String},
    isEmailVerified:{type:Boolean}
  },
  { timestamps: true }
);

const AdminUsers = mongoose.model("AdminUsers", AdminUsersSchema);
module.exports = AdminUsers;
