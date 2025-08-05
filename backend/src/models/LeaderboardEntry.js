const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
  leaderboard: { type: mongoose.Schema.Types.ObjectId, ref: 'Leaderboard', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true, default: 0 },
  rank: { type: Number },
  previousRank: { type: Number },
  rankChange: { type: Number, default: 0 }, // Positive = improved, negative = declined
  metadata: {
    breakdown: {
      points: { type: Number, default: 0 },
      achievements: { type: Number, default: 0 },
      streaks: { type: Number, default: 0 },
      coursesCompleted: { type: Number, default: 0 },
      participation: { type: Number, default: 0 },
      custom: { type: Number, default: 0 }
    },
    lastActivity: { type: Date, default: Date.now },
    timeSpent: { type: Number, default: 0 }, // Minutes
    achievementsEarned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }],
    milestones: [{
      type: { type: String },
      value: { type: Number },
      achievedAt: { type: Date, default: Date.now }
    }]
  },
  rewards: {
    pointsAwarded: { type: Number, default: 0 },
    badgesUnlocked: [{ type: String }],
    specialAccessGranted: [{ type: String }],
    claimed: { type: Boolean, default: false },
    claimedAt: { type: Date }
  },
  isActive: { type: Boolean, default: true },
  isHidden: { type: Boolean, default: false }, // User can hide their entry
  notes: { type: String } // Admin notes
}, { timestamps: true });

// Compound index to ensure one entry per user per leaderboard
leaderboardEntrySchema.index({ leaderboard: 1, user: 1 }, { unique: true });
leaderboardEntrySchema.index({ leaderboard: 1, score: -1, rank: 1 });
leaderboardEntrySchema.index({ user: 1, score: -1 });
leaderboardEntrySchema.index({ 'metadata.lastActivity': -1 });

// Virtual for rank change direction
leaderboardEntrySchema.virtual('rankDirection').get(function() {
  if (!this.previousRank) return 'new';
  if (this.rank < this.previousRank) return 'up';
  if (this.rank > this.previousRank) return 'down';
  return 'same';
});

// Update rank change when rank changes
leaderboardEntrySchema.pre('save', function(next) {
  if (this.previousRank && this.rank) {
    this.rankChange = this.previousRank - this.rank;
  }
  next();
});

module.exports = mongoose.model('LeaderboardEntry', leaderboardEntrySchema); 