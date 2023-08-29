const mongoose = require("mongoose");

const pathSchema = new mongoose.Schema({
  unicode: { type: Number, required: true, immutable: true },
  pathString: { type: String },
});

const projectSchema = new mongoose.Schema(
  {
    name: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    unicodePaths: {
      type: [pathSchema],
      default: Array.from({ length: 94 }, (_, index) => ({
        unicode: index + 33,
        pathString: "",
      })),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
