const mongoose = require('mongoose');

const courseAnalyticsSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    type: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' }
  },
  enrollment: {
    totalEnrollments: { type: Number, default: 0 },
    activeEnrollments: { type: Number, default: 0 },
    completedEnrollments: { type: Number, default: 0 },
    droppedEnrollments: { type: Number, default: 0 },
    newEnrollments: { type: Number, default: 0 },
    reEnrollments: { type: Number, default: 0 },
    enrollmentGrowth: { type: Number, default: 0 }, // Percentage
    averageTimeToEnroll: { type: Number, default: 0 }, // Days from course creation
    enrollmentBySource: {
      organic: { type: Number, default: 0 },
      paid: { type: Number, default: 0 },
      referral: { type: Number, default: 0 },
      email: { type: Number, default: 0 },
      social: { type: Number, default: 0 }
    }
  },
  engagement: {
    totalSessions: { type: Number, default: 0 },
    totalPageViews: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 }, // Minutes
    averagePagesPerSession: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 }, // Percentage
    returnRate: { type: Number, default: 0 }, // Percentage
    featureUsage: {
      lectures: { type: Number, default: 0 },
      quizzes: { type: Number, default: 0 },
      assignments: { type: Number, default: 0 },
      forums: { type: Number, default: 0 },
      liveClasses: { type: Number, default: 0 },
      certificates: { type: Number, default: 0 }
    },
    interactions: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      downloads: { type: Number, default: 0 },
      bookmarks: { type: Number, default: 0 }
    }
  },
  completion: {
    completionRate: { type: Number, default: 0 }, // Percentage
    averageCompletionTime: { type: Number, default: 0 }, // Days
    dropoutRate: { type: Number, default: 0 }, // Percentage
    averageProgress: { type: Number, default: 0 }, // Percentage
    completionByWeek: [{
      week: { type: Number },
      completions: { type: Number },
      dropouts: { type: Number }
    }],
    completionByModule: [{
      module: { type: String },
      completions: { type: Number },
      dropouts: { type: Number },
      averageTime: { type: Number } // Minutes
    }]
  },
  performance: {
    averageQuizScore: { type: Number, default: 0 },
    averageAssignmentScore: { type: Number, default: 0 },
    totalQuizzesTaken: { type: Number, default: 0 },
    totalAssignmentsSubmitted: { type: Number, default: 0 },
    certificatesEarned: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    ratingDistribution: {
      fiveStar: { type: Number, default: 0 },
      fourStar: { type: Number, default: 0 },
      threeStar: { type: Number, default: 0 },
      twoStar: { type: Number, default: 0 },
      oneStar: { type: Number, default: 0 }
    }
  },
  revenue: {
    totalRevenue: { type: Number, default: 0 }, // Cents
    revenuePerEnrollment: { type: Number, default: 0 }, // Cents
    averageOrderValue: { type: Number, default: 0 }, // Cents
    conversionRate: { type: Number, default: 0 }, // Percentage
    refundRate: { type: Number, default: 0 }, // Percentage
    revenueByPeriod: [{
      period: { type: String },
      revenue: { type: Number },
      enrollments: { type: Number }
    }]
  },
  demographics: {
    ageDistribution: [{
      range: { type: String }, // '18-24', '25-34', etc.
      count: { type: Number },
      percentage: { type: Number }
    }],
    genderDistribution: [{
      gender: { type: String },
      count: { type: Number },
      percentage: { type: Number }
    }],
    locationDistribution: [{
      country: { type: String },
      count: { type: Number },
      percentage: { type: Number }
    }],
    deviceDistribution: [{
      device: { type: String },
      count: { type: Number },
      percentage: { type: Number }
    }]
  },
  content: {
    totalLectures: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 }, // Minutes
    averageLectureDuration: { type: Number, default: 0 }, // Minutes
    mostViewedLectures: [{
      lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
      views: { type: Number },
      averageWatchTime: { type: Number } // Minutes
    }],
    leastViewedLectures: [{
      lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
      views: { type: Number },
      averageWatchTime: { type: Number } // Minutes
    }],
    contentQuality: {
      videoQuality: { type: Number, default: 0 }, // 0-100 scale
      audioQuality: { type: Number, default: 0 }, // 0-100 scale
      contentRelevance: { type: Number, default: 0 }, // 0-100 scale
      difficultyLevel: { type: Number, default: 0 } // 0-100 scale
    }
  },
  instructor: {
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    instructorRating: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 }, // Hours
    forumParticipation: { type: Number, default: 0 },
    liveClassHostings: { type: Number, default: 0 },
    studentSatisfaction: { type: Number, default: 0 } // 0-100 scale
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
    estimatedEnrollments: { type: Number },
    estimatedRevenue: { type: Number },
    estimatedCompletionRate: { type: Number },
    churnRisk: { type: Number, default: 0 }, // 0-100 scale
    popularityTrend: { type: String, enum: ['increasing', 'stable', 'decreasing'] },
    nextPeakPeriod: { type: Date }
  },
  metadata: {
    lastUpdated: { type: Date, default: Date.now },
    dataQuality: { type: Number, default: 1 }, // 0-1 scale
    confidence: { type: Number, default: 1 }, // 0-1 scale
    notes: { type: String }
  }
}, { timestamps: true });

// Indexes for efficient queries
courseAnalyticsSchema.index({ course: 1, 'period.startDate': -1 });
courseAnalyticsSchema.index({ 'enrollment.totalEnrollments': -1 });
courseAnalyticsSchema.index({ 'performance.averageRating': -1 });
courseAnalyticsSchema.index({ 'revenue.totalRevenue': -1 });

// Virtual for engagement score
courseAnalyticsSchema.virtual('engagementScore').get(function() {
  const sessionScore = Math.min(100, this.engagement.totalSessions / this.enrollment.totalEnrollments * 10);
  const timeScore = Math.min(100, this.engagement.averageSessionDuration / 60); // Convert to hours
  const featureScore = Object.values(this.engagement.featureUsage).reduce((sum, val) => sum + val, 0) * 2;
  const completionScore = this.completion.completionRate;
  
  return Math.min(100, (sessionScore + timeScore + featureScore + completionScore) / 4);
});

// Virtual for course health score
courseAnalyticsSchema.virtual('healthScore').get(function() {
  const enrollmentScore = Math.min(100, this.enrollment.totalEnrollments / 100);
  const completionScore = this.completion.completionRate;
  const ratingScore = this.performance.averageRating * 20; // Convert 5-star to percentage
  const revenueScore = Math.min(100, this.revenue.totalRevenue / 10000); // Normalize to $100
  
  return Math.min(100, (enrollmentScore + completionScore + ratingScore + revenueScore) / 4);
});

// Virtual for ROI
courseAnalyticsSchema.virtual('roi').get(function() {
  if (this.revenue.totalRevenue === 0) return 0;
  // This would need course creation cost data
  return (this.revenue.totalRevenue / 100) / 100; // Simplified ROI calculation
});

// Method to calculate course performance
courseAnalyticsSchema.methods.calculatePerformance = function() {
  const performance = {
    excellent: this.healthScore >= 80,
    good: this.healthScore >= 60 && this.healthScore < 80,
    average: this.healthScore >= 40 && this.healthScore < 60,
    poor: this.healthScore < 40
  };
  
  return Object.keys(performance).find(key => performance[key]);
};

module.exports = mongoose.model('CourseAnalytics', courseAnalyticsSchema); 