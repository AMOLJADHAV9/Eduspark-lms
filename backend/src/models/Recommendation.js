const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['course', 'resource', 'practice', 'assessment', 'path', 'instructor'],
    required: true
  },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetType: { type: String, required: true }, // 'Course', 'Quiz', 'Assignment', etc.
  algorithm: { 
    type: String, 
    enum: ['collaborative', 'content_based', 'hybrid', 'popularity', 'recent', 'custom'],
    required: true
  },
  score: { type: Number, required: true }, // 0-1 confidence score
  reasons: [{
    factor: { type: String, required: true }, // 'similar_interests', 'skill_gap', 'popularity', etc.
    weight: { type: Number, default: 1 }, // 0-1 weight
    description: { type: String }
  }],
  userFeedback: {
    rating: { type: Number }, // 1-5 scale
    action: { type: String, enum: ['viewed', 'enrolled', 'completed', 'dismissed', 'rated'] },
    feedback: { type: String },
    timestamp: { type: Date, default: Date.now }
  },
  metadata: {
    category: { type: String },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    duration: { type: Number }, // Minutes
    popularity: { type: Number, default: 0 }, // 0-1 scale
    freshness: { type: Number, default: 0 }, // 0-1 scale (how new is the content)
    diversity: { type: Number, default: 0 } // 0-1 scale (how different from user's history)
  },
  context: {
    userInterests: [{ type: String }],
    userSkills: [{ type: String }],
    userGoals: [{ type: String }],
    learningHistory: [{
      type: { type: String },
      targetId: { type: mongoose.Schema.Types.ObjectId },
      interaction: { type: String }, // 'viewed', 'enrolled', 'completed'
      timestamp: { type: Date }
    }],
    sessionContext: {
      currentPage: { type: String },
      searchQuery: { type: String },
      timeOfDay: { type: String },
      deviceType: { type: String }
    }
  },
  status: { 
    type: String, 
    enum: ['active', 'dismissed', 'completed', 'expired'],
    default: 'active'
  },
  expiresAt: { type: Date },
  priority: { type: Number, default: 1 }, // 1-5 scale
  isPersonalized: { type: Boolean, default: true },
  accuracy: { type: Number, default: 0 }, // 0-1 scale (calculated based on user feedback)
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes for efficient queries
recommendationSchema.index({ user: 1, status: 1, createdAt: -1 });
recommendationSchema.index({ type: 1, targetId: 1 });
recommendationSchema.index({ score: -1 });
recommendationSchema.index({ 'userFeedback.action': 1 });

// Virtual for recommendation age
recommendationSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for recommendation effectiveness
recommendationSchema.virtual('effectiveness').get(function() {
  if (!this.userFeedback.rating) return 0;
  return this.userFeedback.rating / 5; // Normalize to 0-1 scale
});

module.exports = mongoose.model('Recommendation', recommendationSchema); 