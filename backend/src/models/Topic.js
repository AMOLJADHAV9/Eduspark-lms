const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  forum: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isAnonymous: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['active', 'locked', 'closed', 'pinned', 'moderated', 'deleted'],
    default: 'active'
  },
  type: { 
    type: String, 
    enum: ['discussion', 'question', 'announcement', 'resource', 'poll'],
    default: 'discussion'
  },
  tags: [{ type: String, trim: true }],
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  metadata: {
    viewCount: { type: Number, default: 0 },
    replyCount: { type: Number, default: 0 },
    lastReplyAt: { type: Date },
    lastReplyBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isSolved: { type: Boolean, default: false }, // For Q&A topics
    solvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    solvedAt: { type: Date },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 }
  },
  poll: {
    question: String,
    options: [{
      text: String,
      votes: { type: Number, default: 0 },
      voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
    isMultipleChoice: { type: Boolean, default: false },
    endDate: Date,
    isActive: { type: Boolean, default: true }
  },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  editedAt: { type: Date },
  editHistory: [{
    content: String,
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date, default: Date.now },
    reason: String
  }]
}, { timestamps: true });

// Indexes for efficient queries
topicSchema.index({ forum: 1, status: 1, createdAt: -1 });
topicSchema.index({ course: 1, type: 1, createdAt: -1 });
topicSchema.index({ author: 1, createdAt: -1 });
topicSchema.index({ 'metadata.lastReplyAt': -1 });
topicSchema.index({ tags: 1 });

// Virtual for total votes
topicSchema.virtual('totalVotes').get(function() {
  return this.metadata.upvotes - this.metadata.downvotes;
});

// Update forum metadata when topic is created
topicSchema.post('save', async function(doc) {
  if (doc.isNew) {
    const Forum = mongoose.model('Forum');
    await Forum.findByIdAndUpdate(doc.forum, {
      $inc: { 'metadata.totalTopics': 1 },
      $set: { 'metadata.lastActivity': new Date() }
    });
  }
});

module.exports = mongoose.model('Topic', topicSchema); 