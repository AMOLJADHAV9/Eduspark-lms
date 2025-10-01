const Notification = require('../models/Notification');
const LiveClass = require('../models/LiveClass');
const Enrollment = require('../models/Enrollment');

// Create notification for live class
exports.createLiveClassNotification = async (liveClassId, title, message) => {
  try {
    // Get all enrolled students for the course
    const liveClass = await LiveClass.findById(liveClassId).populate('course');
    if (!liveClass) {
      throw new Error('Live class not found');
    }

    // Get all enrollments for this course
    const enrollments = await Enrollment.find({ course: liveClass.course._id });
    const studentIds = enrollments.map(enrollment => enrollment.student);

    // Create notifications for all enrolled students
    const notifications = studentIds.map(studentId => ({
      user: studentId,
      title,
      message,
      type: 'live_class',
      relatedId: liveClassId,
      relatedModel: 'LiveClass',
      priority: 'high',
      metadata: {
        actionUrl: `/live-classes/${liveClassId}`,
        badge: 'LIVE'
      }
    }));

    await Notification.insertMany(notifications);
    console.log(`Created ${notifications.length} notifications for live class: ${liveClassId}`);
    
    return notifications.length;
  } catch (error) {
    console.error('Error creating live class notifications:', error);
    throw error;
  }
};

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;

    let query = { user: req.user.id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('relatedId', 'title name');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      user: req.user.id, 
      isRead: false 
    });

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark notification as clicked
exports.markAsClicked = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: req.user.id },
      { isClicked: true, isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as clicked', notification });
  } catch (error) {
    console.error('Error marking notification as clicked:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get notification count
exports.getNotificationCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ 
      user: req.user.id, 
      isRead: false 
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error getting notification count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
