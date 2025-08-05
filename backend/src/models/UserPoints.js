const mongoose = require('mongoose');

const userPointsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalPoints: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  experienceToNextLevel: { type: Number, default: 100 },
  statistics: {
    coursesCompleted: { type: Number, default: 0 },
    lecturesWatched: { type: Number, default: 0 },
    quizzesTaken: { type: Number, default: 0 },
    assignmentsSubmitted: { type: Number, default: 0 },
    achievementsEarned: { type: Number, default: 0 },
    forumPosts: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 }, // Minutes
    daysActive: { type: Number, default: 0 },
    lastActiveDate: { type: Date }
  },
  streaks: {
    current: {
      type: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
      count: { type: Number, default: 0 },
      startDate: { type: Date },
      lastActivity: { type: Date }
    },
    longest: {
      type: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
      count: { type: Number, default: 0 },
      startDate: { type: Date },
      endDate: { type: Date }
    },
    history: [{
      type: { type: String, enum: ['daily', 'weekly', 'monthly'] },
      count: { type: Number },
      startDate: { type: Date },
      endDate: { type: Date },
      broken: { type: Boolean, default: false }
    }]
  },
  badges: [{
    name: { type: String, required: true },
    icon: { type: String, required: true },
    category: { type: String },
    earnedAt: { type: Date, default: Date.now },
    rarity: { type: String, enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'] }
  }],
  transactions: [{
    type: { type: String, enum: ['earned', 'spent', 'bonus', 'penalty', 'refund'], required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    source: { type: String }, // 'course_completion', 'achievement', 'streak', etc.
    sourceId: { type: mongoose.Schema.Types.ObjectId }, // Reference to source
    timestamp: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed }
  }],
  milestones: [{
    type: { type: String, required: true },
    value: { type: Number, required: true },
    achievedAt: { type: Date, default: Date.now },
    reward: {
      points: { type: Number, default: 0 },
      badges: [{ type: String }],
      specialAccess: [{ type: String }]
    }
  }],
  settings: {
    notifications: {
      levelUp: { type: Boolean, default: true },
      achievementEarned: { type: Boolean, default: true },
      streakBroken: { type: Boolean, default: true },
      milestoneReached: { type: Boolean, default: true }
    },
    privacy: {
      showPoints: { type: Boolean, default: true },
      showStreaks: { type: Boolean, default: true },
      showAchievements: { type: Boolean, default: true },
      showLeaderboard: { type: Boolean, default: true }
    }
  }
}, { timestamps: true });

// Indexes for efficient queries
userPointsSchema.index({ user: 1 });
userPointsSchema.index({ totalPoints: -1 });
userPointsSchema.index({ level: -1, totalPoints: -1 });
userPointsSchema.index({ 'statistics.lastActiveDate': -1 });

// Virtual for level progress percentage
userPointsSchema.virtual('levelProgress').get(function() {
  const currentLevelExp = this.level * 100; // Assuming 100 exp per level
  const nextLevelExp = (this.level + 1) * 100;
  const progressInLevel = this.experience - currentLevelExp;
  const expNeededForLevel = nextLevelExp - currentLevelExp;
  return Math.min(100, Math.round((progressInLevel / expNeededForLevel) * 100));
});

// Update experience to next level when level changes
userPointsSchema.pre('save', function(next) {
  this.experienceToNextLevel = (this.level + 1) * 100 - this.experience;
  next();
});

module.exports = mongoose.model('UserPoints', userPointsSchema); 