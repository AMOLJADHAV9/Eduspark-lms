const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  certificateNumber: { type: String, required: true, unique: true },
  issuedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, required: true },
  grade: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'], required: true },
  percentage: { type: Number, required: true },
  totalScore: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  instructorName: { type: String, required: true },
  courseTitle: { type: String, required: true },
  studentName: { type: String, required: true },
  certificateTemplate: { type: String, default: 'default' },
  customMessage: { type: String },
  isVerified: { type: Boolean, default: true },
  verificationCode: { type: String, required: true, unique: true },
  achievements: [{
    type: { type: String, enum: ['quiz', 'assignment', 'participation'] },
    title: String,
    score: Number,
    maxScore: Number,
    completedAt: Date
  }],
  metadata: {
    totalLectures: { type: Number, default: 0 },
    completedLectures: { type: Number, default: 0 },
    totalQuizzes: { type: Number, default: 0 },
    completedQuizzes: { type: Number, default: 0 },
    totalAssignments: { type: Number, default: 0 },
    completedAssignments: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 }, // in minutes
    lastActivity: { type: Date }
  }
}, { timestamps: true });

// Generate certificate number
certificateSchema.pre('save', async function(next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Certificate').countDocuments({
      certificateNumber: new RegExp(`^CERT-${year}-`)
    });
    this.certificateNumber = `CERT-${year}-${String(count + 1).padStart(6, '0')}`;
    
    // Generate verification code
    this.verificationCode = `VERIFY-${this.certificateNumber}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema); 