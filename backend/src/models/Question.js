const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'truefalse', 'short'], required: true },
  options: [{ type: String }], // For MCQ
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }, // String or Boolean
  explanation: { type: String },
});

module.exports = mongoose.model('Question', questionSchema);