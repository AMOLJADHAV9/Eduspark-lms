const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  achievement: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement', required: true },
  earnedAt: { type: Date, default: Date.now },
  progress: {
    current: { type: Number, default: 0 },
    target: { type: Number, required: true },
    percentage: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  status: { 
    type: String, 
    enum: ['in_progress', 'completed', 'claimed', 'expired'],
    default: 'in_progress'
  },
  metadata: {
    timeSpent: { type: Number, default: 0 }, // Minutes spent
    attempts: { type: Number, default: 0 },
    firstAttempt: { type: Date },
    lastAttempt: { type: Date },
    streakDays: { type: Number, default: 0 },
    relatedActivities: [{
      type: { type: String },
      value: { type: Number },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  rewards: {
    pointsAwarded: { type: Number, default: 0 },
    badgesUnlocked: [{ type: String }],
    specialAccessGranted: [{ type: String }],
    customRewardClaimed: { type: Boolean, default: false }
  },
  isHidden: { type: Boolean, default: false }, // User can hide achievements
  notes: { type: String }, // User's personal notes
  shared: { type: Boolean, default: false } // Whether user shared this achievement
}, { timestamps: true });

// Compound index to ensure one achievement per user
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });
userAchievementSchema.index({ user: 1, status: 1, earnedAt: -1 });
userAchievementSchema.index({ achievement: 1, earnedAt: -1 });

// Virtual for progress percentage
userAchievementSchema.virtual('progressPercentage').get(function() {
  if (this.progress.target === 0) return 0;
  return Math.min(100, Math.round((this.progress.current / this.progress.target) * 100));
});

// Update progress percentage when current value changes
userAchievementSchema.pre('save', function(next) {
  if (this.progress.target > 0) {
    this.progress.percentage = Math.min(100, Math.round((this.progress.current / this.progress.target) * 100));
  }
  this.progress.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('UserAchievement', userAchievementSchema); 