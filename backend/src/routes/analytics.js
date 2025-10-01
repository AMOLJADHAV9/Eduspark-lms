const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { adminAuth } = require('../middleware/auth');

// Dashboard overview
router.get('/dashboard', adminAuth, analyticsController.getDashboardOverview);

// User analytics
router.get('/users/:userId', adminAuth, analyticsController.getUserAnalytics);
router.get('/users', adminAuth, analyticsController.getUserAnalytics);

// Course analytics
router.get('/courses/:courseId', adminAuth, analyticsController.getCourseAnalytics);
router.get('/courses', adminAuth, analyticsController.getCourseAnalytics);

// Revenue analytics
router.get('/revenue', adminAuth, analyticsController.getRevenueAnalytics);

// Engagement analytics
router.get('/engagement', adminAuth, analyticsController.getEngagementAnalytics);

// Insights and recommendations
router.get('/insights', adminAuth, analyticsController.getInsights);

// Report generation
router.post('/reports', adminAuth, analyticsController.generateReport);

// Update analytics data
router.put('/update', adminAuth, analyticsController.updateAnalytics);

module.exports = router; 