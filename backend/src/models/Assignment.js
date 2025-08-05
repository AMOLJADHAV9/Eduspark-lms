const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
  dueDate: { type: Date, required: true },
  maxScore: { type: Number, required: true, default: 100 },
  instructions: { type: String },
  attachments: [{ 
    filename: String,
    originalName: String,
    path: String,
    size: Number
  }],
  isPublished: { type: Boolean, default: false },
  allowLateSubmission: { type: Boolean, default: false },
  latePenalty: { type: Number, default: 0 }, // percentage deduction
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rubric: [{
    criterion: String,
    maxPoints: Number,
    description: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema); 