const Analytics = require('../models/Analytics');
const UserAnalytics = require('../models/UserAnalytics');
const CourseAnalytics = require('../models/CourseAnalytics');
const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');

// Get dashboard overview
exports.getDashboardOverview = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    else if (period === '1y') startDate.setFullYear(startDate.getFullYear() - 1);

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    const activeUsers = await User.countDocuments({ 
      lastLoginAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
    });

    // Get course statistics
    const totalCourses = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({ isPublished: true });
    const totalEnrollments = await require('../models/Enrollment').countDocuments();

    // Get revenue statistics
    const revenueStats = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalPayments: { $sum: 1 },
          averageOrderValue: { $avg: '$amount' }
        }
      }
    ]);

    // Get subscription statistics
    const subscriptionStats = await Subscription.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get engagement metrics
    const engagementMetrics = await UserAnalytics.aggregate([
      { $match: { 'period.startDate': { $gte: startDate } } },
      {
        $group: {
          _id: null,
          averageSessionDuration: { $avg: '$engagement.averageSessionDuration' },
          averageCompletionRate: { $avg: '$learning.completionRate' },
          totalSessions: { $sum: '$engagement.totalSessions' }
        }
      }
    ]);

    const dashboardData = {
      overview: {
        totalUsers,
        newUsers,
        activeUsers,
        totalCourses,
        activeCourses,
        totalEnrollments,
        revenue: revenueStats[0] || { totalRevenue: 0, totalPayments: 0, averageOrderValue: 0 },
        subscriptions: subscriptionStats,
        engagement: engagementMetrics[0] || { averageSessionDuration: 0, averageCompletionRate: 0, totalSessions: 0 }
      },
      period,
      lastUpdated: new Date()
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '30d' } = req.query;

    const startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);

    let userAnalytics = await UserAnalytics.findOne({
      user: userId,
      'period.startDate': { $gte: startDate }
    }).populate('user', 'name email');

    if (!userAnalytics) {
      // Create default analytics if none exist
      userAnalytics = await UserAnalytics.create({
        user: userId,
        period: {
          startDate,
          endDate: new Date(),
          type: 'daily'
        }
      });
    }

    // Calculate additional metrics
    userAnalytics.retention.churnRisk = userAnalytics.calculateChurnRisk();
    userAnalytics.engagementScore = userAnalytics.engagementScore;
    userAnalytics.learningEfficiency = userAnalytics.learningEfficiency;
    userAnalytics.retentionStatus = userAnalytics.retentionStatus;

    res.json(userAnalytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get course analytics
exports.getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { period = '30d' } = req.query;

    const startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);

    let courseAnalytics = await CourseAnalytics.findOne({
      course: courseId,
      'period.startDate': { $gte: startDate }
    }).populate('course', 'title description');

    if (!courseAnalytics) {
      // Create default analytics if none exist
      courseAnalytics = await CourseAnalytics.create({
        course: courseId,
        period: {
          startDate,
          endDate: new Date(),
          type: 'daily'
        }
      });
    }

    // Calculate additional metrics
    courseAnalytics.engagementScore = courseAnalytics.engagementScore;
    courseAnalytics.healthScore = courseAnalytics.healthScore;
    courseAnalytics.roi = courseAnalytics.roi;
    courseAnalytics.performance = courseAnalytics.calculatePerformance();

    res.json(courseAnalytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get revenue analytics
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    else if (period === '1y') startDate.setFullYear(startDate.getFullYear() - 1);

    // Revenue by day
    const dailyRevenue = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue by payment method
    const revenueByMethod = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Subscription revenue
    const subscriptionRevenue = await Subscription.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $lookup: {
          from: 'paymentplans',
          localField: 'plan',
          foreignField: '_id',
          as: 'planData'
        }
      },
      {
        $group: {
          _id: '$plan',
          revenue: { $sum: '$payment.amount' },
          count: { $sum: 1 },
          planName: { $first: '$planData.name' }
        }
      }
    ]);

    // Monthly recurring revenue
    const mrr = await Subscription.aggregate([
      { $match: { status: 'active', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalMRR: { $sum: '$payment.amount' }
        }
      }
    ]);

    const revenueData = {
      dailyRevenue,
      revenueByMethod,
      subscriptionRevenue,
      mrr: mrr[0]?.totalMRR || 0,
      period,
      summary: {
        totalRevenue: dailyRevenue.reduce((sum, day) => sum + day.revenue, 0),
        totalTransactions: dailyRevenue.reduce((sum, day) => sum + day.count, 0),
        averageOrderValue: dailyRevenue.reduce((sum, day) => sum + day.revenue, 0) / 
                         dailyRevenue.reduce((sum, day) => sum + day.count, 0) || 0
      }
    };

    res.json(revenueData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get engagement analytics
exports.getEngagementAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);

    // User engagement metrics
    const userEngagement = await UserAnalytics.aggregate([
      { $match: { 'period.startDate': { $gte: startDate } } },
      {
        $group: {
          _id: null,
          averageSessionDuration: { $avg: '$engagement.averageSessionDuration' },
          averagePagesPerSession: { $avg: '$engagement.averagePagesPerSession' },
          totalSessions: { $sum: '$engagement.totalSessions' },
          totalPageViews: { $sum: '$engagement.totalPageViews' },
          averageCompletionRate: { $avg: '$learning.completionRate' }
        }
      }
    ]);

    // Feature usage
    const featureUsage = await UserAnalytics.aggregate([
      { $match: { 'period.startDate': { $gte: startDate } } },
      {
        $group: {
          _id: null,
          liveClasses: { $sum: '$engagement.featureUsage.liveClasses' },
          quizzes: { $sum: '$engagement.featureUsage.quizzes' },
          assignments: { $sum: '$engagement.featureUsage.assignments' },
          forums: { $sum: '$engagement.featureUsage.forums' },
          certificates: { $sum: '$engagement.featureUsage.certificates' },
          achievements: { $sum: '$engagement.featureUsage.achievements' }
        }
      }
    ]);

    // Social engagement
    const socialEngagement = await UserAnalytics.aggregate([
      { $match: { 'period.startDate': { $gte: startDate } } },
      {
        $group: {
          _id: null,
          forumPosts: { $sum: '$social.forumPosts' },
          forumReplies: { $sum: '$social.forumReplies' },
          liveClassParticipations: { $sum: '$social.liveClassParticipations' },
          peerReviews: { $sum: '$social.peerReviews' }
        }
      }
    ]);

    const engagementData = {
      userEngagement: userEngagement[0] || {
        averageSessionDuration: 0,
        averagePagesPerSession: 0,
        totalSessions: 0,
        totalPageViews: 0,
        averageCompletionRate: 0
      },
      featureUsage: featureUsage[0] || {
        liveClasses: 0,
        quizzes: 0,
        assignments: 0,
        forums: 0,
        certificates: 0,
        achievements: 0
      },
      socialEngagement: socialEngagement[0] || {
        forumPosts: 0,
        forumReplies: 0,
        liveClassParticipations: 0,
        peerReviews: 0
      },
      period
    };

    res.json(engagementData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get insights and recommendations
exports.getInsights = async (req, res) => {
  try {
    const { type, severity } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (severity) filter.severity = severity;

    // Get insights from all analytics models
    const userInsights = await UserAnalytics.aggregate([
      { $unwind: '$insights' },
      { $match: filter },
      { $limit: 10 }
    ]);

    const courseInsights = await CourseAnalytics.aggregate([
      { $unwind: '$insights' },
      { $match: filter },
      { $limit: 10 }
    ]);

    const globalInsights = await Analytics.aggregate([
      { $unwind: '$insights' },
      { $match: filter },
      { $limit: 10 }
    ]);

    // Combine and sort insights by severity
    const allInsights = [...userInsights, ...courseInsights, ...globalInsights]
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.insights.severity] - severityOrder[a.insights.severity];
      })
      .slice(0, 20);

    res.json({
      insights: allInsights,
      summary: {
        total: allInsights.length,
        byType: allInsights.reduce((acc, insight) => {
          acc[insight.insights.type] = (acc[insight.insights.type] || 0) + 1;
          return acc;
        }, {}),
        bySeverity: allInsights.reduce((acc, insight) => {
          acc[insight.insights.severity] = (acc[insight.insights.severity] || 0) + 1;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate analytics report
exports.generateReport = async (req, res) => {
  try {
    const { type, entityId, period = '30d', format = 'json' } = req.body;

    const startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);

    let reportData = {};

    switch (type) {
      case 'user':
        const userAnalytics = await UserAnalytics.findOne({
          user: entityId,
          'period.startDate': { $gte: startDate }
        }).populate('user', 'name email');
        reportData = userAnalytics;
        break;

      case 'course':
        const courseAnalytics = await CourseAnalytics.findOne({
          course: entityId,
          'period.startDate': { $gte: startDate }
        }).populate('course', 'title description');
        reportData = courseAnalytics;
        break;

      case 'revenue':
        const revenueData = await Payment.aggregate([
          { $match: { status: 'completed', createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$amount' },
              totalTransactions: { $sum: 1 },
              averageOrderValue: { $avg: '$amount' }
            }
          }
        ]);
        reportData = revenueData[0] || {};
        break;

      case 'engagement':
        const engagementData = await UserAnalytics.aggregate([
          { $match: { 'period.startDate': { $gte: startDate } } },
          {
            $group: {
              _id: null,
              averageSessionDuration: { $avg: '$engagement.averageSessionDuration' },
              totalSessions: { $sum: '$engagement.totalSessions' },
              averageCompletionRate: { $avg: '$learning.completionRate' }
            }
          }
        ]);
        reportData = engagementData[0] || {};
        break;

      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    const report = {
      type,
      entityId,
      period,
      generatedAt: new Date(),
      data: reportData,
      metadata: {
        generatedBy: req.user.id,
        format,
        version: '1.0'
      }
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update analytics data
exports.updateAnalytics = async (req, res) => {
  try {
    const { type, entityId, data } = req.body;

    let analytics;
    switch (type) {
      case 'user':
        analytics = await UserAnalytics.findOneAndUpdate(
          { user: entityId },
          { ...data, 'metadata.lastUpdated': new Date() },
          { new: true, upsert: true }
        );
        break;

      case 'course':
        analytics = await CourseAnalytics.findOneAndUpdate(
          { course: entityId },
          { ...data, 'metadata.lastUpdated': new Date() },
          { new: true, upsert: true }
        );
        break;

      case 'global':
        analytics = await Analytics.findOneAndUpdate(
          { type: data.type, 'scope.entity': 'global' },
          { ...data, 'metadata.lastUpdated': new Date() },
          { new: true, upsert: true }
        );
        break;

      default:
        return res.status(400).json({ message: 'Invalid analytics type' });
    }

    res.json(analytics);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 