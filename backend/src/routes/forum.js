const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const topicController = require('../controllers/topicController');
const { auth, adminAuth } = require('../middleware/auth');

// Forum routes
router.post('/courses/:courseId/forums', auth, forumController.createForum);
router.get('/courses/:courseId/forums', forumController.getForums);
router.get('/forums/:forumId', forumController.getForumById);
router.put('/forums/:forumId', adminAuth, forumController.updateForum);
router.delete('/forums/:forumId', adminAuth, forumController.deleteForum);

// Forum moderation routes
router.post('/forums/:forumId/moderators', auth, forumController.addModerator);
router.delete('/forums/:forumId/moderators/:userId', auth, forumController.removeModerator);

// Forum statistics
router.get('/courses/:courseId/forums/stats', forumController.getForumStats);

// User forums
router.get('/users/forums', auth, forumController.getUserForums);
router.get('/users/:userId/forums', forumController.getUserForums);

// Forum search
router.get('/forums/search', forumController.searchForums);

// Topic routes
router.post('/forums/:forumId/topics', auth, topicController.createTopic);
router.get('/forums/:forumId/topics', topicController.getTopics);
router.get('/topics/:topicId', topicController.getTopicById);
router.put('/topics/:topicId', auth, topicController.updateTopic);
router.delete('/topics/:topicId', auth, topicController.deleteTopic);

// Topic engagement routes
router.post('/topics/:topicId/vote', auth, topicController.voteTopic);
router.post('/topics/:topicId/solve', auth, topicController.markAsSolved);
router.post('/topics/:topicId/subscribe', auth, topicController.toggleSubscription);

// User topics
router.get('/users/topics', auth, topicController.getUserTopics);
router.get('/users/:userId/topics', topicController.getUserTopics);

// Topic search
router.get('/topics/search', topicController.searchTopics);

module.exports = router; 