const Topic = require('../models/Topic');
const Post = require('../models/Post');
const Forum = require('../models/Forum');
const Course = require('../models/Course');
const ForumVote = require('../models/ForumVote');

// Create a new topic
exports.createTopic = async (req, res) => {
  try {
    const { forumId } = req.params;
    const topicData = req.body;

    // Check if forum exists and is active
    const forum = await Forum.findById(forumId);
    if (!forum || !forum.isActive) {
      return res.status(404).json({ message: 'Forum not found or inactive' });
    }

    // Check if forum is locked
    if (forum.isLocked) {
      return res.status(403).json({ message: 'This forum is locked' });
    }

    // Check if user is enrolled in the course
    const course = await Course.findById(forum.course);
    const isEnrolled = course.enrollments.some(enrollment => 
      enrollment.user.toString() === req.user.id
    );
    if (!isEnrolled && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You must be enrolled in this course to create topics' });
    }

    // Check if anonymous posts are allowed
    if (topicData.isAnonymous && !forum.allowAnonymous) {
      return res.status(400).json({ message: 'Anonymous posts are not allowed in this forum' });
    }

    const topic = await Topic.create({
      ...topicData,
      forum: forumId,
      course: forum.course,
      author: req.user.id
    });

    await topic.populate('author', 'name');
    await topic.populate('forum', 'title');
    await topic.populate('course', 'title');

    res.status(201).json(topic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get topics for a forum
exports.getTopics = async (req, res) => {
  try {
    const { forumId } = req.params;
    const { 
      type, 
      status = 'active', 
      sort = 'lastActivity', 
      page = 1, 
      limit = 20,
      search,
      tags 
    } = req.query;

    const filter = { forum: forumId, status };
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }

    const sortOptions = {
      lastActivity: { 'metadata.lastReplyAt': -1, createdAt: -1 },
      createdAt: { createdAt: -1 },
      title: { title: 1 },
      views: { 'metadata.viewCount': -1 },
      replies: { 'metadata.replyCount': -1 },
      votes: { 'metadata.upvotes': -1 }
    };

    const skip = (page - 1) * limit;

    const topics = await Topic.find(filter)
      .populate('author', 'name')
      .populate('forum', 'title')
      .populate('course', 'title')
      .populate('metadata.lastReplyBy', 'name')
      .sort(sortOptions[sort] || sortOptions.lastActivity)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Topic.countDocuments(filter);

    res.json({
      topics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get topic by ID
exports.getTopicById = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findById(topicId)
      .populate('author', 'name')
      .populate('forum', 'title')
      .populate('course', 'title')
      .populate('metadata.lastReplyBy', 'name')
      .populate('solvedBy', 'name')
      .populate('mentions', 'name')
      .populate('subscribers', 'name');

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Increment view count
    await Topic.findByIdAndUpdate(topicId, { $inc: { 'metadata.viewCount': 1 } });

    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update topic
exports.updateTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const updateData = req.body;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Check if user is author, moderator, or admin
    const forum = await Forum.findById(topic.forum);
    const isAuthor = topic.author.toString() === req.user.id;
    const isModerator = forum.moderators.some(mod => mod.toString() === req.user.id);
    
    if (!isAuthor && !isModerator && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add to edit history
    if (updateData.content && updateData.content !== topic.content) {
      updateData.editHistory = [
        ...topic.editHistory,
        {
          content: topic.content,
          editedBy: req.user.id,
          editedAt: new Date(),
          reason: updateData.editReason || 'Updated'
        }
      ];
      updateData.editedBy = req.user.id;
      updateData.editedAt = new Date();
    }

    const updatedTopic = await Topic.findByIdAndUpdate(
      topicId,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name')
     .populate('forum', 'title')
     .populate('course', 'title');

    res.json(updatedTopic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete topic
exports.deleteTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Check if user is author, moderator, or admin
    const forum = await Forum.findById(topic.forum);
    const isAuthor = topic.author.toString() === req.user.id;
    const isModerator = forum.moderators.some(mod => mod.toString() === req.user.id);
    
    if (!isAuthor && !isModerator && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Soft delete - mark as deleted instead of removing
    await Topic.findByIdAndUpdate(topicId, { status: 'deleted' });

    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vote on topic
exports.voteTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Check if user has already voted
    const existingVote = await ForumVote.findOne({
      user: req.user.id,
      targetType: 'topic',
      targetId: topicId
    });

    if (existingVote) {
      // Update existing vote
      if (existingVote.voteType === voteType) {
        // Remove vote
        await ForumVote.findByIdAndDelete(existingVote._id);
        const voteField = voteType === 'upvote' ? 'upvotes' : 'downvotes';
        await Topic.findByIdAndUpdate(topicId, { $inc: { [`metadata.${voteField}`]: -1 } });
      } else {
        // Change vote
        await ForumVote.findByIdAndUpdate(existingVote._id, { voteType });
        const oldField = existingVote.voteType === 'upvote' ? 'upvotes' : 'downvotes';
        const newField = voteType === 'upvote' ? 'upvotes' : 'downvotes';
        await Topic.findByIdAndUpdate(topicId, {
          $inc: { 
            [`metadata.${oldField}`]: -1,
            [`metadata.${newField}`]: 1
          }
        });
      }
    } else {
      // Create new vote
      await ForumVote.create({
        user: req.user.id,
        targetType: 'topic',
        targetId: topicId,
        voteType,
        course: topic.course,
        forum: topic.forum
      });
      const voteField = voteType === 'upvote' ? 'upvotes' : 'downvotes';
      await Topic.findByIdAndUpdate(topicId, { $inc: { [`metadata.${voteField}`]: 1 } });
    }

    const updatedTopic = await Topic.findById(topicId);
    res.json(updatedTopic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mark topic as solved (for Q&A)
exports.markAsSolved = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { postId } = req.body;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Check if user is author or admin
    const isAuthor = topic.author.toString() === req.user.id;
    if (!isAuthor && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update topic
    await Topic.findByIdAndUpdate(topicId, {
      'metadata.isSolved': true,
      'metadata.solvedBy': req.user.id,
      'metadata.solvedAt': new Date()
    });

    // Update post as best answer
    if (postId) {
      await Post.findByIdAndUpdate(postId, {
        'metadata.isBestAnswer': true,
        'metadata.markedAsSolution': true,
        'metadata.solutionMarkedBy': req.user.id,
        'metadata.solutionMarkedAt': new Date()
      });
    }

    const updatedTopic = await Topic.findById(topicId)
      .populate('author', 'name')
      .populate('solvedBy', 'name');

    res.json(updatedTopic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Subscribe/unsubscribe to topic
exports.toggleSubscription = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const isSubscribed = topic.subscribers.includes(req.user.id);
    
    if (isSubscribed) {
      // Unsubscribe
      topic.subscribers = topic.subscribers.filter(sub => sub.toString() !== req.user.id);
    } else {
      // Subscribe
      topic.subscribers.push(req.user.id);
    }

    await topic.save();
    await topic.populate('subscribers', 'name');

    res.json({
      isSubscribed: !isSubscribed,
      subscribers: topic.subscribers
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user's topics
exports.getUserTopics = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;

    const topics = await Topic.find({
      author: targetUserId,
      status: { $ne: 'deleted' }
    })
    .populate('author', 'name')
    .populate('forum', 'title')
    .populate('course', 'title')
    .sort({ createdAt: -1 });

    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search topics
exports.searchTopics = async (req, res) => {
  try {
    const { q, courseId, forumId, type } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const filter = {
      status: { $ne: 'deleted' },
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    if (courseId) filter.course = courseId;
    if (forumId) filter.forum = forumId;
    if (type) filter.type = type;

    const topics = await Topic.find(filter)
      .populate('author', 'name')
      .populate('forum', 'title')
      .populate('course', 'title')
      .sort({ 'metadata.lastReplyAt': -1, createdAt: -1 })
      .limit(20);

    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 