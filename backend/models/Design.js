const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
  design_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, default: '' }, // blouse, saree fall, etc.
  images: { type: [String], default: [] }, // 1–3 base64 data URLs (different views)
}, { timestamps: true });

module.exports = mongoose.model('Design', designSchema);
