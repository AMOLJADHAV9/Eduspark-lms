const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  icon: { type: String, required: true }, // Icon name or URL
  type: { 
    type: String, 
    enum: ['course_completion', 'streak', 'participation', 'excellence', 'social', 'milestone', 'special'],
    required: true
  },
  category: { 
    type: String, 
    enum: ['learning', 'engagement', 'community', 'excellence', 'special'],
    required: true
  },
  rarity: { 
    type: String, 
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  points: { type: Number, default: 0 },
  criteria: {
    type: { type: String, required: true }, // 'courses_completed', 'streak_days', 'posts_made', etc.
    value: { type: Number, required: true }, // Target value to achieve
    timeframe: { type: Number }, // Days to achieve within (optional)
    conditions: [{ type: String }] // Additional conditions
  },
  rewards: {
    points: { type: Number, default: 0 },
    badges: [{ type: String }],
    specialAccess: [{ type: String }],
    customReward: { type: String }
  },
  isActive: { type: Boolean, default: true },
  isHidden: { type: Boolean, default: false }, // Hidden achievements
  unlockDate: { type: Date }, // For time-limited achievements
  expiryDate: { type: Date }, // For temporary achievements
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }],
  metadata: {
    totalEarned: { type: Number, default: 0 },
    lastEarned: { type: Date },
    difficulty: { type: Number, default: 1 }, // 1-10 scale
    estimatedTime: { type: Number }, // Estimated hours to complete
    tags: [{ type: String }]
  }
}, { timestamps: true });

// Indexes for efficient queries
achievementSchema.index({ type: 1, category: 1, isActive: 1 });
achievementSchema.index({ rarity: 1 });
achievementSchema.index({ 'criteria.type': 1 });

module.exports = mongoose.model('Achievement', achievementSchema); 