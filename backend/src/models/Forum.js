const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  category: { 
    type: String, 
    enum: ['general', 'q&a', 'discussion', 'announcements', 'resources', 'help'],
    default: 'general'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  isPinned: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  allowAnonymous: { type: Boolean, default: false },
  requireModeration: { type: Boolean, default: false },
  tags: [{ type: String, trim: true }],
  metadata: {
    totalTopics: { type: Number, default: 0 },
    totalPosts: { type: Number, default: 0 },
    lastActivity: { type: Date },
    viewCount: { type: Number, default: 0 }
  },
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rules: [{ type: String }],
  settings: {
    allowAttachments: { type: Boolean, default: true },
    maxAttachmentSize: { type: Number, default: 5 }, // MB
    allowedFileTypes: [{ type: String }],
    autoCloseAfterDays: { type: Number }, // Auto-close inactive topics
    maxTopicsPerUser: { type: Number, default: 10 }
  }
}, { timestamps: true });

// Index for efficient queries
forumSchema.index({ course: 1, category: 1, isActive: 1 });
forumSchema.index({ createdBy: 1 });
forumSchema.index({ 'metadata.lastActivity': -1 });

module.exports = mongoose.model('Forum', forumSchema); 