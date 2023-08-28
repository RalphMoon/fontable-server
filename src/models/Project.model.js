const mongoose = require("mongoose");

const pathSchema = new mongoose.Schema({
  unicode: { type: Number, required: true, unique: true, immutable: true },
  pathString: {
    type: String,
    required: true,
    unique: true,
    immutable: true,
  },
});

const projectSchema = new mongoose.Schema(
  {
    name: { type: String },
    unicodePaths: { type: [pathSchema] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
