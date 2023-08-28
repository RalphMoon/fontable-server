const mongoose = require("mongoose");
const projectSchema = require("./Project.model").schema;

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true, immutable: true },
    name: { type: String, required: true, unique: true, immutable: true },
    email: { type: String, required: true, unique: true, immutable: true },
    projects: { type: [projectSchema] },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

module.exports = mongoose.model("User", userSchema);
