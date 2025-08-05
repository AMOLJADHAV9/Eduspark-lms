const mongoose = require('mongoose');

const adaptiveContentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
  contentType: { 
    type: String, 
    enum: ['video', 'text', 'interactive', 'audio', 'quiz', 'assignment'],
    required: true
  },
  originalContent: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: Number }, // Minutes
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] }
  },
  adaptations: [{
    type: { type: String, enum: ['difficulty', 'pace', 'format', 'length', 'interactivity'] },
    reason: { type: String, required: true },
    originalValue: { type: mongoose.Schema.Types.Mixed },
    adaptedValue: { type: mongoose.Schema.Types.Mixed },
    confidence: { type: Number, default: 0.5 }, // 0-1 scale
    appliedAt: { type: Date, default: Date.now }
  }],
  userPreferences: {
    learningStyle: {
      visual: { type: Number, default: 0 },
      auditory: { type: Number, default: 0 },
      kinesthetic: { type: Number, default: 0 },
      reading: { type: Number, default: 0 }
    },
    pacePreference: { type: String, enum: ['slow', 'normal', 'fast'], default: 'normal' },
    difficultyPreference: { type: String, enum: ['easy', 'moderate', 'challenging'], default: 'moderate' },
    preferredFormats: [{ type: String }],
    accessibilityNeeds: [{ type: String }]
  },
  deliverySettings: {
    autoPlay: { type: Boolean, default: true },
    showSubtitles: { type: Boolean, default: false },
    playbackSpeed: { type: Number, default: 1.0 },
    volume: { type: Number, default: 0.7 },
    quality: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    interactiveElements: { type: Boolean, default: true },
    pauseForNotes: { type: Boolean, default: false }
  },
  progress: {
    startedAt: { type: Date, default: Date.now },
    lastAccessed: { type: Date, default: Date.now },
    timeSpent: { type: Number, default: 0 }, // Minutes
    completionPercentage: { type: Number, default: 0 }, // 0-100
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    attempts: { type: Number, default: 0 },
    score: { type: Number }, // For quizzes/assignments
    feedback: { type: String }
  },
  analytics: {
    engagementScore: { type: Number, default: 0 }, // 0-100 scale
    comprehensionScore: { type: Number, default: 0 }, // 0-100 scale
    retentionScore: { type: Number, default: 0 }, // 0-100 scale
    difficultyRating: { type: Number }, // 1-5 scale
    paceRating: { type: Number }, // 1-5 scale
    formatRating: { type: Number }, // 1-5 scale
    sessionData: [{
      timestamp: { type: Date },
      action: { type: String }, // 'play', 'pause', 'seek', 'complete'
      duration: { type: Number }, // Seconds
      position: { type: Number } // Percentage
    }],
    interactionPatterns: [{
      type: { type: String }, // 'rewind', 'fast_forward', 'pause', 'note'
      frequency: { type: Number },
      context: { type: String }
    }]
  },
  recommendations: [{
    type: { type: String, enum: ['review', 'skip', 'supplement', 'practice'] },
    reason: { type: String },
    priority: { type: Number, default: 1 }, // 1-5 scale
    suggestedContent: { type: mongoose.Schema.Types.ObjectId },
    isApplied: { type: Boolean, default: false }
  }],
  metadata: {
    algorithm: { type: String, default: 'adaptive' },
    version: { type: Number, default: 1 },
    lastUpdated: { type: Date, default: Date.now },
    tags: [{ type: String }],
    notes: { type: String }
  }
}, { timestamps: true });

// Indexes for efficient queries
adaptiveContentSchema.index({ user: 1, course: 1, 'progress.lastAccessed': -1 });
adaptiveContentSchema.index({ contentType: 1, 'progress.isCompleted': 1 });
adaptiveContentSchema.index({ 'analytics.engagementScore': -1 });

// Virtual for content effectiveness
adaptiveContentSchema.virtual('effectiveness').get(function() {
  const engagement = this.analytics.engagementScore || 0;
  const comprehension = this.analytics.comprehensionScore || 0;
  const retention = this.analytics.retentionScore || 0;
  return Math.round((engagement + comprehension + retention) / 3);
});

// Virtual for adaptation accuracy
adaptiveContentSchema.virtual('adaptationAccuracy').get(function() {
  if (this.adaptations.length === 0) return 0;
  const totalConfidence = this.adaptations.reduce((sum, adaptation) => sum + adaptation.confidence, 0);
  return Math.round((totalConfidence / this.adaptations.length) * 100);
});

module.exports = mongoose.model('AdaptiveContent', adaptiveContentSchema); 