const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// Get user notifications
router.get('/', auth, notificationController.getUserNotifications);

// Get notification count
router.get('/count', auth, notificationController.getNotificationCount);

// Mark notification as read
router.put('/:notificationId/read', auth, notificationController.markAsRead);

// Mark notification as clicked
router.put('/:notificationId/click', auth, notificationController.markAsClicked);

// Mark all notifications as read
router.put('/mark-all-read', auth, notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', auth, notificationController.deleteNotification);

module.exports = router;
