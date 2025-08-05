// backend/models/File.js
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  path: { type: String, required: true },
  mimetype: { type: String },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder" },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("File", fileSchema);
