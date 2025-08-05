const express = require('express');
const router = express.Router();
const personalizationController = require('../controllers/personalizationController');
const { auth } = require('../middleware/auth');

// User preferences routes
router.get('/preferences', auth, personalizationController.getUserPreferences);
router.get('/users/:userId/preferences', personalizationController.getUserPreferences);
router.put('/preferences', auth, personalizationController.updateUserPreferences);
router.put('/users/:userId/preferences', auth, personalizationController.updateUserPreferences);

// Course recommendations routes
router.get('/recommendations/courses', auth, personalizationController.getCourseRecommendations);

// Learning paths routes
router.get('/learning-paths', auth, personalizationController.getLearningPaths);
router.get('/users/:userId/learning-paths', personalizationController.getLearningPaths);
router.post('/learning-paths', auth, personalizationController.createLearningPath);
router.put('/learning-paths/:pathId', auth, personalizationController.updateLearningPath);
router.post('/learning-paths/generate', auth, personalizationController.generateLearningPath);

// Adaptive content routes
router.get('/adaptive-content', auth, personalizationController.getAdaptiveContent);
router.put('/adaptive-content/:contentId', auth, personalizationController.updateAdaptiveContent);

// Personalized dashboard routes
router.get('/dashboard', auth, personalizationController.getPersonalizedDashboard);

// Recommendation feedback routes
router.put('/recommendations/:recommendationId/feedback', auth, personalizationController.updateRecommendationFeedback);

module.exports = router; 