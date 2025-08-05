const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  forum: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isAnonymous: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['active', 'hidden', 'deleted', 'moderated'],
    default: 'active'
  },
  type: { 
    type: String, 
    enum: ['reply', 'answer', 'comment', 'solution'],
    default: 'reply'
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  metadata: {
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    isBestAnswer: { type: Boolean, default: false }, // For Q&A
    markedAsSolution: { type: Boolean, default: false },
    solutionMarkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    solutionMarkedAt: { type: Date }
  },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  quotedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  parentPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // For nested replies
  editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  editedAt: { type: Date },
  editHistory: [{
    content: String,
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date, default: Date.now },
    reason: String
  }],
  flags: [{
    reason: { type: String, required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    notes: String
  }]
}, { timestamps: true });

// Indexes for efficient queries
postSchema.index({ topic: 1, createdAt: 1 });
postSchema.index({ forum: 1, status: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ parentPost: 1 });
postSchema.index({ 'metadata.isBestAnswer': 1 });

// Virtual for total votes
postSchema.virtual('totalVotes').get(function() {
  return this.metadata.upvotes - this.metadata.downvotes;
});

// Update topic metadata when post is created
postSchema.post('save', async function(doc) {
  if (doc.isNew) {
    const Topic = mongoose.model('Topic');
    await Topic.findByIdAndUpdate(doc.topic, {
      $inc: { 'metadata.replyCount': 1 },
      $set: { 
        'metadata.lastReplyAt': new Date(),
        'metadata.lastReplyBy': doc.author
      }
    });

    // Update forum metadata
    const Forum = mongoose.model('Forum');
    await Forum.findByIdAndUpdate(doc.forum, {
      $inc: { 'metadata.totalPosts': 1 },
      $set: { 'metadata.lastActivity': new Date() }
    });
  }
});

// Update topic metadata when post is deleted
postSchema.post('remove', async function(doc) {
  const Topic = mongoose.model('Topic');
  await Topic.findByIdAndUpdate(doc.topic, {
    $inc: { 'metadata.replyCount': -1 }
  });

  const Forum = mongoose.model('Forum');
  await Forum.findByIdAndUpdate(doc.forum, {
    $inc: { 'metadata.totalPosts': -1 }
  });
});

module.exports = mongoose.model('Post', postSchema); 