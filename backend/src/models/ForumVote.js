const mongoose = require('mongoose');

const forumVoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['topic', 'post'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  voteType: { type: String, enum: ['upvote', 'downvote'], required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  forum: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum', required: true }
}, { timestamps: true });

// Compound index to ensure one vote per user per target
forumVoteSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
forumVoteSchema.index({ targetType: 1, targetId: 1 });
forumVoteSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ForumVote', forumVoteSchema); 