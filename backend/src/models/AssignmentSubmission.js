const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  submittedAt: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  isLate: { type: Boolean, default: false },
  latePenalty: { type: Number, default: 0 },
  score: { type: Number },
  maxScore: { type: Number, required: true },
  percentage: { type: Number },
  status: { 
    type: String, 
    enum: ['submitted', 'graded', 'late', 'overdue'], 
    default: 'submitted' 
  },
  feedback: { type: String },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number
  }],
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gradedAt: { type: Date },
  rubricScores: [{
    criterion: String,
    points: Number,
    maxPoints: Number,
    feedback: String
  }],
  comments: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema); 