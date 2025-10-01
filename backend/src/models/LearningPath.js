const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  goal: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['career', 'skill', 'certification', 'personal', 'custom'],
    required: true
  },
  status: { 
    type: String, 
    enum: ['active', 'paused', 'completed', 'abandoned'],
    default: 'active'
  },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  estimatedDuration: { type: Number }, // Hours
  currentProgress: { type: Number, default: 0 }, // 0-100 percentage
  milestones: [{
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['course', 'assessment', 'project', 'certification'] },
    targetId: { type: mongoose.Schema.Types.ObjectId }, // Reference to course, quiz, etc.
    order: { type: Number, required: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    requiredScore: { type: Number, default: 70 }, // Percentage
    actualScore: { type: Number },
    estimatedHours: { type: Number },
    actualHours: { type: Number }
  }],
  prerequisites: [{
    type: { type: String, enum: ['course', 'skill', 'assessment'] },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    description: { type: String },
    isCompleted: { type: Boolean, default: false }
  }],
  adaptiveSettings: {
    autoAdjust: { type: Boolean, default: true },
    difficultyScaling: { type: Boolean, default: true },
    paceAdjustment: { type: Boolean, default: true },
    contentAdaptation: { type: Boolean, default: true },
    assessmentFrequency: { type: Number, default: 3 } // Assessments per milestone
  },
  schedule: {
    startDate: { type: Date, default: Date.now },
    targetEndDate: { type: Date },
    actualEndDate: { type: Date },
    weeklyHours: { type: Number, default: 10 },
    preferredDays: [{ type: String }], // ['monday', 'tuesday', etc.]
    preferredTimeSlots: [{ type: String }] // ['morning', 'afternoon', 'evening']
  },
  analytics: {
    timeSpent: { type: Number, default: 0 }, // Minutes
    sessionsCompleted: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 },
    lastActivity: { type: Date },
    streakDays: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    effectivenessScore: { type: Number, default: 0 } // 0-100 scale
  },
  recommendations: [{
    type: { type: String, enum: ['course', 'resource', 'practice', 'assessment'] },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    reason: { type: String },
    priority: { type: Number, default: 1 }, // 1-5 scale
    isCompleted: { type: Boolean, default: false },
    suggestedAt: { type: Date, default: Date.now }
  }],
  metadata: {
    createdBy: { type: String, enum: ['user', 'ai', 'instructor'], default: 'user' },
    lastModified: { type: Date, default: Date.now },
    version: { type: Number, default: 1 },
    tags: [{ type: String }],
    notes: { type: String }
  }
}, { timestamps: true });

// Indexes for efficient queries
learningPathSchema.index({ user: 1, status: 1 });
learningPathSchema.index({ type: 1, difficulty: 1 });
learningPathSchema.index({ 'analytics.lastActivity': -1 });

// Virtual for completion status
learningPathSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Virtual for progress percentage
learningPathSchema.virtual('progressPercentage').get(function() {
  if (this.milestones.length === 0) return 0;
  const completedMilestones = this.milestones.filter(m => m.isCompleted).length;
  return Math.round((completedMilestones / this.milestones.length) * 100);
});

module.exports = mongoose.model('LearningPath', learningPathSchema); 