const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['points', 'achievements', 'streaks', 'courses_completed', 'participation', 'custom'],
    required: true
  },
  category: { 
    type: String, 
    enum: ['global', 'course', 'weekly', 'monthly', 'seasonal', 'event'],
    default: 'global'
  },
  scope: {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    startDate: { type: Date },
    endDate: { type: Date },
    filters: [{ type: String }]
  },
  criteria: {
    metric: { type: String, required: true }, // 'total_points', 'achievements_count', etc.
    aggregation: { type: String, default: 'sum' }, // 'sum', 'avg', 'max', 'count'
    timeRange: { type: Number }, // Days to consider
    minimumValue: { type: Number, default: 0 }
  },
  rewards: {
    top1: { points: Number, badges: [String], specialAccess: [String] },
    top3: { points: Number, badges: [String], specialAccess: [String] },
    top10: { points: Number, badges: [String], specialAccess: [String] },
    top50: { points: Number, badges: [String], specialAccess: [String] },
    participation: { points: Number, badges: [String], specialAccess: [String] }
  },
  isActive: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: true },
  autoUpdate: { type: Boolean, default: true },
  updateFrequency: { type: String, enum: ['hourly', 'daily', 'weekly', 'monthly'], default: 'daily' },
  lastUpdated: { type: Date },
  metadata: {
    totalParticipants: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    lowestScore: { type: Number, default: 0 },
    resetCount: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Indexes for efficient queries
leaderboardSchema.index({ type: 1, category: 1, isActive: 1 });
leaderboardSchema.index({ 'scope.course': 1 });
leaderboardSchema.index({ lastUpdated: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema); 