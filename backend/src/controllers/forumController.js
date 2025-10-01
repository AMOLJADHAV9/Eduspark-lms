const Forum = require('../models/Forum');
const Topic = require('../models/Topic');
const Post = require('../models/Post');
const Course = require('../models/Course');

// Create a new forum
exports.createForum = async (req, res) => {
  try {
    const { courseId } = req.params;
    const forumData = req.body;

    // Check if user is enrolled in the course or is admin
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled or is admin
    const isEnrolled = course.enrollments.some(enrollment => 
      enrollment.user.toString() === req.user.id
    );
    if (!isEnrolled && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You must be enrolled in this course to create forums' });
    }

    const forum = await Forum.create({
      ...forumData,
      course: courseId,
      createdBy: req.user.id
    });

    await forum.populate('createdBy', 'name');
    await forum.populate('course', 'title');

    res.status(201).json(forum);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get forums for a course
exports.getForums = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { category, search, sort = 'lastActivity' } = req.query;

    const filter = { course: courseId, isActive: true };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOptions = {
      lastActivity: { 'metadata.lastActivity': -1 },
      createdAt: { createdAt: -1 },
      title: { title: 1 },
      topics: { 'metadata.totalTopics': -1 }
    };

    const forums = await Forum.find(filter)
      .populate('createdBy', 'name')
      .populate('course', 'title')
      .populate('moderators', 'name')
      .sort(sortOptions[sort] || sortOptions.lastActivity);

    res.json(forums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get forum by ID
exports.getForumById = async (req, res) => {
  try {
    const { forumId } = req.params;

    const forum = await Forum.findById(forumId)
      .populate('createdBy', 'name')
      .populate('course', 'title')
      .populate('moderators', 'name');

    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    // Increment view count
    await Forum.findByIdAndUpdate(forumId, { $inc: { 'metadata.viewCount': 1 } });

    res.json(forum);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update forum
exports.updateForum = async (req, res) => {
  try {
    const { forumId } = req.params;
    const updateData = req.body;

    const forum = await Forum.findById(forumId);
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    // Check if user is creator, moderator, or admin
    const isCreator = forum.createdBy.toString() === req.user.id;
    const isModerator = forum.moderators.some(mod => mod.toString() === req.user.id);
    
    if (!isCreator && !isModerator && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedForum = await Forum.findByIdAndUpdate(
      forumId,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name')
     .populate('course', 'title')
     .populate('moderators', 'name');

    res.json(updatedForum);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete forum
exports.deleteForum = async (req, res) => {
  try {
    const { forumId } = req.params;

    const forum = await Forum.findById(forumId);
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    // Check if user is creator or admin
    const isCreator = forum.createdBy.toString() === req.user.id;
    if (!isCreator && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Soft delete - mark as inactive instead of removing
    await Forum.findByIdAndUpdate(forumId, { isActive: false });

    res.json({ message: 'Forum deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add moderator to forum
exports.addModerator = async (req, res) => {
  try {
    const { forumId } = req.params;
    const { userId } = req.body;

    const forum = await Forum.findById(forumId);
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    // Check if user is creator or admin
    const isCreator = forum.createdBy.toString() === req.user.id;
    if (!isCreator && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (forum.moderators.includes(userId)) {
      return res.status(400).json({ message: 'User is already a moderator' });
    }

    forum.moderators.push(userId);
    await forum.save();

    await forum.populate('moderators', 'name');
    res.json(forum);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove moderator from forum
exports.removeModerator = async (req, res) => {
  try {
    const { forumId, userId } = req.params;

    const forum = await Forum.findById(forumId);
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    // Check if user is creator or admin
    const isCreator = forum.createdBy.toString() === req.user.id;
    if (!isCreator && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    forum.moderators = forum.moderators.filter(mod => mod.toString() !== userId);
    await forum.save();

    await forum.populate('moderators', 'name');
    res.json(forum);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get forum statistics
exports.getForumStats = async (req, res) => {
  try {
    const { courseId } = req.params;

    const stats = await Forum.aggregate([
      { $match: { course: mongoose.Types.ObjectId(courseId), isActive: true } },
      {
        $group: {
          _id: null,
          totalForums: { $sum: 1 },
          totalTopics: { $sum: '$metadata.totalTopics' },
          totalPosts: { $sum: '$metadata.totalPosts' },
          totalViews: { $sum: '$metadata.viewCount' },
          categoryDistribution: {
            $push: '$category'
          }
        }
      }
    ]);

    const categoryCounts = {};
    if (stats[0] && stats[0].categoryDistribution) {
      stats[0].categoryDistribution.forEach(category => {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
    }

    res.json({
      totalForums: stats[0]?.totalForums || 0,
      totalTopics: stats[0]?.totalTopics || 0,
      totalPosts: stats[0]?.totalPosts || 0,
      totalViews: stats[0]?.totalViews || 0,
      categoryDistribution: categoryCounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's forums
exports.getUserForums = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;

    const forums = await Forum.find({
      $or: [
        { createdBy: targetUserId },
        { moderators: targetUserId }
      ],
      isActive: true
    })
    .populate('createdBy', 'name')
    .populate('course', 'title')
    .populate('moderators', 'name')
    .sort({ 'metadata.lastActivity': -1 });

    res.json(forums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search forums
exports.searchForums = async (req, res) => {
  try {
    const { q, courseId } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const filter = {
      isActive: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    if (courseId) filter.course = courseId;

    const forums = await Forum.find(filter)
      .populate('createdBy', 'name')
      .populate('course', 'title')
      .populate('moderators', 'name')
      .sort({ 'metadata.lastActivity': -1 })
      .limit(20);

    res.json(forums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 