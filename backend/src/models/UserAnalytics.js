const mongoose = require('mongoose');

const userAnalyticsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    type: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' }
  },
  learning: {
    totalCoursesEnrolled: { type: Number, default: 0 },
    totalCoursesCompleted: { type: Number, default: 0 },
    totalLecturesWatched: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 }, // Minutes
    averageSessionDuration: { type: Number, default: 0 }, // Minutes
    completionRate: { type: Number, default: 0 }, // Percentage
    averageProgress: { type: Number, default: 0 }, // Percentage
    timeToComplete: { type: Number, default: 0 }, // Days
    lastActivity: { type: Date },
    learningStreak: { type: Number, default: 0 }, // Days
    longestStreak: { type: Number, default: 0 }
  },
  engagement: {
    totalSessions: { type: Number, default: 0 },
    totalPageViews: { type: Number, default: 0 },
    averagePagesPerSession: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 }, // Percentage
    sessionDuration: { type: Number, default: 0 }, // Minutes
    featureUsage: {
      liveClasses: { type: Number, default: 0 },
      quizzes: { type: Number, default: 0 },
      assignments: { type: Number, default: 0 },
      forums: { type: Number, default: 0 },
      certificates: { type: Number, default: 0 },
      achievements: { type: Number, default: 0 },
      personalizedDashboard: { type: Number, default: 0 }
    },
    interactions: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      downloads: { type: Number, default: 0 },
      bookmarks: { type: Number, default: 0 }
    }
  },
  performance: {
    averageQuizScore: { type: Number, default: 0 },
    totalQuizzesTaken: { type: Number, default: 0 },
    totalAssignmentsSubmitted: { type: Number, default: 0 },
    averageAssignmentScore: { type: Number, default: 0 },
    certificatesEarned: { type: Number, default: 0 },
    achievementsUnlocked: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    currentLevel: { type: Number, default: 1 },
    rank: { type: Number, default: 0 }
  },
  behavior: {
    preferredLearningTime: { type: String }, // 'morning', 'afternoon', 'evening', 'night'
    preferredDevice: { type: String }, // 'desktop', 'mobile', 'tablet'
    preferredBrowser: { type: String },
    averageSessionFrequency: { type: Number, default: 0 }, // Sessions per week
    peakActivityHour: { type: Number }, // 0-23
    mostActiveDay: { type: String }, // 'monday', 'tuesday', etc.
    learningStyle: {
      visual: { type: Number, default: 0 },
      auditory: { type: Number, default: 0 },
      kinesthetic: { type: Number, default: 0 },
      reading: { type: Number, default: 0 }
    },
    pacePreference: { type: String, enum: ['slow', 'normal', 'fast'], default: 'normal' },
    difficultyPreference: { type: String, enum: ['easy', 'moderate', 'challenging'], default: 'moderate' }
  },
  social: {
    forumPosts: { type: Number, default: 0 },
    forumReplies: { type: Number, default: 0 },
    forumLikes: { type: Number, default: 0 },
    liveClassParticipations: { type: Number, default: 0 },
    studyGroupMemberships: { type: Number, default: 0 },
    peerReviews: { type: Number, default: 0 },
    mentorInteractions: { type: Number, default: 0 },
    collaborativeProjects: { type: Number, default: 0 }
  },
  retention: {
    daysSinceRegistration: { type: Number, default: 0 },
    daysSinceLastActivity: { type: Number, default: 0 },
    churnRisk: { type: Number, default: 0 }, // 0-100 scale
    retentionScore: { type: Number, default: 0 }, // 0-100 scale
    loyaltyTier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
    lifetimeValue: { type: Number, default: 0 }, // Cents
    subscriptionStatus: { type: String, enum: ['free', 'trial', 'premium', 'enterprise'] }
  },
  goals: {
    setGoals: { type: Number, default: 0 },
    completedGoals: { type: Number, default: 0 },
    goalCompletionRate: { type: Number, default: 0 }, // Percentage
    averageGoalDuration: { type: Number, default: 0 }, // Days
    currentGoals: [{ type: String }],
    upcomingGoals: [{ type: String }]
  },
  insights: [{
    type: { type: String, enum: ['trend', 'anomaly', 'opportunity', 'warning'] },
    title: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    metric: { type: String },
    value: { type: Number },
    recommendation: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  predictions: {
    nextActivityDate: { type: Date },
    estimatedCompletionTime: { type: Number }, // Days
    churnProbability: { type: Number, default: 0 }, // 0-1 scale
    recommendedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    skillGaps: [{ type: String }],
    learningPath: [{ type: String }]
  },
  metadata: {
    lastUpdated: { type: Date, default: Date.now },
    dataQuality: { type: Number, default: 1 }, // 0-1 scale
    confidence: { type: Number, default: 1 }, // 0-1 scale
    notes: { type: String }
  }
}, { timestamps: true });

// Indexes for efficient queries
userAnalyticsSchema.index({ user: 1, 'period.startDate': -1 });
userAnalyticsSchema.index({ 'learning.lastActivity': -1 });
userAnalyticsSchema.index({ 'retention.churnRisk': -1 });
userAnalyticsSchema.index({ 'performance.totalPoints': -1 });

// Virtual for engagement score
userAnalyticsSchema.virtual('engagementScore').get(function() {
  const sessionScore = Math.min(100, this.engagement.totalSessions * 10);
  const timeScore = Math.min(100, this.learning.totalTimeSpent / 60); // Convert to hours
  const featureScore = Object.values(this.engagement.featureUsage).reduce((sum, val) => sum + val, 0) * 5;
  const socialScore = this.social.forumPosts * 2 + this.social.liveClassParticipations * 5;
  
  return Math.min(100, (sessionScore + timeScore + featureScore + socialScore) / 4);
});

// Virtual for learning efficiency
userAnalyticsSchema.virtual('learningEfficiency').get(function() {
  if (this.learning.totalTimeSpent === 0) return 0;
  return (this.learning.totalCoursesCompleted / this.learning.totalTimeSpent) * 100;
});

// Virtual for retention status
userAnalyticsSchema.virtual('retentionStatus').get(function() {
  const daysInactive = this.retention.daysSinceLastActivity;
  if (daysInactive <= 7) return 'active';
  if (daysInactive <= 30) return 'at_risk';
  if (daysInactive <= 90) return 'inactive';
  return 'churned';
});

// Method to calculate churn risk
userAnalyticsSchema.methods.calculateChurnRisk = function() {
  let risk = 0;
  
  // Activity-based risk
  if (this.retention.daysSinceLastActivity > 7) risk += 20;
  if (this.retention.daysSinceLastActivity > 14) risk += 30;
  if (this.retention.daysSinceLastActivity > 30) risk += 50;
  
  // Engagement-based risk
  if (this.engagement.totalSessions < 3) risk += 15;
  if (this.engagement.averagePagesPerSession < 2) risk += 10;
  if (this.learning.completionRate < 50) risk += 20;
  
  // Performance-based risk
  if (this.performance.averageQuizScore < 60) risk += 15;
  if (this.performance.totalQuizzesTaken === 0) risk += 10;
  
  // Social-based risk
  if (this.social.forumPosts === 0 && this.social.liveClassParticipations === 0) risk += 10;
  
  return Math.min(100, risk);
};

module.exports = mongoose.model('UserAnalytics', userAnalyticsSchema); 