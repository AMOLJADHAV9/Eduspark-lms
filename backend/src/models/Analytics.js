const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['user_progress', 'course_performance', 'revenue', 'engagement', 'system', 'custom'],
    required: true
  },
  scope: {
    entity: { type: String, required: true }, // 'user', 'course', 'system', 'global'
    entityId: { type: mongoose.Schema.Types.ObjectId }, // Reference to specific entity
    timeRange: { type: String, enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'], default: 'daily' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  metrics: {
    // User Progress Metrics
    totalUsers: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    newUsers: { type: Number, default: 0 },
    returningUsers: { type: Number, default: 0 },
    churnedUsers: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 }, // Minutes
    averageSessionsPerUser: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }, // Percentage
    averageProgress: { type: Number, default: 0 }, // Percentage
    timeToComplete: { type: Number, default: 0 }, // Days

    // Course Performance Metrics
    totalCourses: { type: Number, default: 0 },
    activeCourses: { type: Number, default: 0 },
    totalEnrollments: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    averageCompletionTime: { type: Number, default: 0 }, // Days
    dropoutRate: { type: Number, default: 0 }, // Percentage
    engagementScore: { type: Number, default: 0 }, // 0-100 scale

    // Revenue Metrics
    totalRevenue: { type: Number, default: 0 }, // Cents
    monthlyRecurringRevenue: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }, // Percentage
    refundRate: { type: Number, default: 0 }, // Percentage
    customerLifetimeValue: { type: Number, default: 0 },
    revenuePerUser: { type: Number, default: 0 },

    // Engagement Metrics
    totalSessions: { type: Number, default: 0 },
    totalPageViews: { type: Number, default: 0 },
    averagePagesPerSession: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 }, // Percentage
    retentionRate: { type: Number, default: 0 }, // Percentage
    featureUsage: {
      liveClasses: { type: Number, default: 0 },
      quizzes: { type: Number, default: 0 },
      assignments: { type: Number, default: 0 },
      forums: { type: Number, default: 0 },
      certificates: { type: Number, default: 0 },
      achievements: { type: Number, default: 0 }
    },

    // System Metrics
    serverUptime: { type: Number, default: 0 }, // Percentage
    averageResponseTime: { type: Number, default: 0 }, // Milliseconds
    errorRate: { type: Number, default: 0 }, // Percentage
    bandwidthUsage: { type: Number, default: 0 }, // GB
    storageUsage: { type: Number, default: 0 }, // GB
    concurrentUsers: { type: Number, default: 0 }
  },
  breakdown: {
    // Time-based breakdown
    hourly: [{
      hour: { type: Number },
      value: { type: Number },
      count: { type: Number }
    }],
    daily: [{
      date: { type: Date },
      value: { type: Number },
      count: { type: Number }
    }],
    weekly: [{
      week: { type: String },
      value: { type: Number },
      count: { type: Number }
    }],
    monthly: [{
      month: { type: String },
      value: { type: Number },
      count: { type: Number }
    }],

    // Category breakdown
    byCategory: [{
      category: { type: String },
      value: { type: Number },
      count: { type: Number },
      percentage: { type: Number }
    }],
    byUserType: [{
      userType: { type: String },
      value: { type: Number },
      count: { type: Number },
      percentage: { type: Number }
    }],
    byDevice: [{
      device: { type: String },
      value: { type: Number },
      count: { type: Number },
      percentage: { type: Number }
    }],
    byLocation: [{
      country: { type: String },
      value: { type: Number },
      count: { type: Number },
      percentage: { type: Number }
    }]
  },
  insights: [{
    type: { type: String, enum: ['trend', 'anomaly', 'opportunity', 'warning'] },
    title: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    metric: { type: String },
    value: { type: Number },
    threshold: { type: Number },
    recommendation: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  alerts: [{
    type: { type: String, enum: ['threshold', 'trend', 'anomaly'] },
    metric: { type: String, required: true },
    condition: { type: String, enum: ['above', 'below', 'equals'] },
    threshold: { type: Number, required: true },
    message: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastTriggered: { type: Date },
    triggerCount: { type: Number, default: 0 }
  }],
  metadata: {
    dataSource: { type: String, default: 'system' },
    collectionMethod: { type: String, default: 'automatic' },
    lastUpdated: { type: Date, default: Date.now },
    updateFrequency: { type: String, default: 'daily' },
    accuracy: { type: Number, default: 1 }, // 0-1 scale
    confidence: { type: Number, default: 1 }, // 0-1 scale
    notes: { type: String }
  }
}, { timestamps: true });

// Indexes for efficient queries
analyticsSchema.index({ type: 1, 'scope.entity': 1, 'scope.startDate': -1 });
analyticsSchema.index({ 'scope.entityId': 1, 'scope.timeRange': 1 });
analyticsSchema.index({ 'metadata.lastUpdated': -1 });

// Virtual for data freshness
analyticsSchema.virtual('dataAge').get(function() {
  return Math.floor((Date.now() - this.metadata.lastUpdated) / (1000 * 60 * 60 * 24));
});

// Virtual for trend direction
analyticsSchema.virtual('trendDirection').get(function() {
  if (!this.breakdown.daily || this.breakdown.daily.length < 2) return 'stable';
  const recent = this.breakdown.daily.slice(-2);
  const change = recent[1].value - recent[0].value;
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'stable';
});

module.exports = mongoose.model('Analytics', analyticsSchema); 