const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['live_class', 'course_update', 'assignment', 'quiz', 'general'],
    default: 'general'
  },
  relatedId: { 
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: { 
    type: String, 
    enum: ['LiveClass', 'Course', 'Assignment', 'Quiz']
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  isClicked: { 
    type: Boolean, 
    default: false 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: { 
    type: Date 
  },
  metadata: {
    actionUrl: { type: String },
    imageUrl: { type: String },
    badge: { type: String }
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);
