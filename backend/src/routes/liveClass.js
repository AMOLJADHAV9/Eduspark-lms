const express = require('express');
const router = express.Router();
const liveClassController = require('../controllers/liveClassController');
const { auth, adminAuth } = require('../middleware/auth');

// Teacher-specific routes (must come before /:id routes)
router.get('/teacher', auth, liveClassController.getTeacherLiveClasses);
router.post('/teacher', auth, liveClassController.createTeacherLiveClass);
router.put('/teacher/:id', auth, liveClassController.updateTeacherLiveClass);
router.delete('/teacher/:id', auth, liveClassController.deleteTeacherLiveClass);

// Public routes (for viewing)
router.get('/', liveClassController.getLiveClasses);
router.get('/:id', liveClassController.getLiveClassById);

// Protected routes
router.post('/', auth, liveClassController.createLiveClass);
router.put('/:id', auth, liveClassController.updateLiveClass);
router.delete('/:id', auth, liveClassController.deleteLiveClass);

// Live class actions
router.post('/:id/join', auth, liveClassController.joinLiveClass);
router.post('/:id/start', auth, liveClassController.startLiveClass);
router.post('/:id/end', auth, liveClassController.endLiveClass);

// Real-time features
router.post('/:id/chat', auth, liveClassController.addChatMessage);
router.put('/:id/whiteboard', auth, liveClassController.updateWhiteboard);

// Analytics
router.get('/:id/analytics', auth, liveClassController.getLiveClassAnalytics);

module.exports = router; 