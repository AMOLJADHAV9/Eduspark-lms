const mongoose = require('mongoose');

const studentStorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  story: { type: String, required: true, trim: true },
  imagePath: { type: String, required: false },
  published: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('StudentStory', studentStorySchema);

