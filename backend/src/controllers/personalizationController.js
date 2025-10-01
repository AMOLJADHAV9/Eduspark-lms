const UserPreference = require('../models/UserPreference');
const LearningPath = require('../models/LearningPath');
const Recommendation = require('../models/Recommendation');
const AdaptiveContent = require('../models/AdaptiveContent');
const Course = require('../models/Course');
const User = require('../models/User');

// Get user preferences
exports.getUserPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;

    let preferences = await UserPreference.findOne({ user: targetUserId });
    
    if (!preferences) {
      // Create default preferences
      preferences = await UserPreference.create({
        user: targetUserId,
        learningStyle: { visual: 25, auditory: 25, kinesthetic: 25, reading: 25 },
        interests: [],
        skillLevels: [],
        goals: [],
        timeAvailability: { dailyHours: 1, weeklyDays: 5, preferredTimeSlots: [], maxSessionDuration: 60 },
        contentPreferences: { preferredFormats: ['video'], difficultyPreference: 'moderate', pacePreference: 'normal', languagePreference: 'en', accessibilityNeeds: [] },
        socialPreferences: { groupLearning: true, peerInteraction: true, instructorInteraction: true, publicProfile: true, notifications: { email: true, push: true, sms: false } },
        aiSettings: { recommendationStrength: 0.7, explorationRate: 0.3, personalizationLevel: 'moderate', allowDataCollection: true, allowPersonalization: true }
      });
    }

    res.json(preferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user preferences
exports.updateUserPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;
    const updateData = req.body;

    const preferences = await UserPreference.findOneAndUpdate(
      { user: targetUserId },
      { ...updateData, 'metadata.lastUpdated': new Date() },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(preferences);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get personalized course recommendations
exports.getCourseRecommendations = async (req, res) => {
  try {
    const { limit = 10, algorithm = 'hybrid' } = req.query;

    // Get user preferences
    const preferences = await UserPreference.findOne({ user: req.user.id });
    if (!preferences) {
      return res.status(404).json({ message: 'User preferences not found' });
    }

    // Get user's learning history
    const userHistory = await Recommendation.find({ 
      user: req.user.id,
      'userFeedback.action': { $in: ['enrolled', 'completed'] }
    }).sort({ createdAt: -1 }).limit(50);

    // Build recommendation query based on user preferences
    const query = { isPublished: true };
    
    // Filter by user interests
    if (preferences.interests.length > 0) {
      const userCategories = preferences.interests.map(interest => interest.category);
      query.category = { $in: userCategories };
    }

    // Filter by difficulty preference
    if (preferences.contentPreferences.difficultyPreference) {
      query.level = preferences.contentPreferences.difficultyPreference;
    }

    // Get recommended courses
    const courses = await Course.find(query)
      .populate('createdBy', 'name')
      .limit(parseInt(limit))
      .sort({ rating: -1, totalRatings: -1 });

    // Calculate recommendation scores
    const recommendations = courses.map(course => {
      let score = 0;
      const reasons = [];

      // Score based on user interests
      const matchingInterest = preferences.interests.find(interest => 
        interest.category === course.category
      );
      if (matchingInterest) {
        score += matchingInterest.level * 0.3;
        reasons.push({ factor: 'similar_interests', weight: 0.3, description: `Matches your interest in ${course.category}` });
      }

      // Score based on difficulty preference
      if (course.level === preferences.contentPreferences.difficultyPreference) {
        score += 0.2;
        reasons.push({ factor: 'difficulty_match', weight: 0.2, description: 'Matches your preferred difficulty level' });
      }

      // Score based on course rating
      if (course.rating > 0) {
        score += (course.rating / 5) * 0.2;
        reasons.push({ factor: 'high_rating', weight: 0.2, description: `Highly rated (${course.rating}/5)` });
      }

      // Score based on popularity
      if (course.totalRatings > 10) {
        score += 0.1;
        reasons.push({ factor: 'popular', weight: 0.1, description: 'Popular among learners' });
      }

      // Score based on content format preference
      if (preferences.contentPreferences.preferredFormats.includes('video')) {
        score += 0.1;
        reasons.push({ factor: 'format_preference', weight: 0.1, description: 'Includes video content' });
      }

      return {
        course,
        score: Math.min(1, score),
        reasons,
        algorithm
      };
    });

    // Sort by score and return top recommendations
    recommendations.sort((a, b) => b.score - a.score);

    res.json(recommendations.slice(0, parseInt(limit)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get learning paths for user
exports.getLearningPaths = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;

    const filter = { user: targetUserId };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const skip = (page - 1) * limit;

    const learningPaths = await LearningPath.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LearningPath.countDocuments(filter);

    res.json({
      learningPaths,
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

// Create learning path
exports.createLearningPath = async (req, res) => {
  try {
    const pathData = req.body;
    pathData.user = req.user.id;

    const learningPath = await LearningPath.create(pathData);
    res.status(201).json(learningPath);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update learning path
exports.updateLearningPath = async (req, res) => {
  try {
    const { pathId } = req.params;
    const updateData = req.body;

    const learningPath = await LearningPath.findOneAndUpdate(
      { _id: pathId, user: req.user.id },
      { ...updateData, 'metadata.lastModified': new Date() },
      { new: true, runValidators: true }
    );

    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    res.json(learningPath);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get adaptive content for user
exports.getAdaptiveContent = async (req, res) => {
  try {
    const { courseId, contentType } = req.query;

    const filter = { user: req.user.id };
    if (courseId) filter.course = courseId;
    if (contentType) filter.contentType = contentType;

    const adaptiveContent = await AdaptiveContent.find(filter)
      .populate('course', 'title')
      .populate('lecture', 'title')
      .sort({ 'progress.lastAccessed': -1 });

    res.json(adaptiveContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update adaptive content progress
exports.updateAdaptiveContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const updateData = req.body;

    const adaptiveContent = await AdaptiveContent.findOneAndUpdate(
      { _id: contentId, user: req.user.id },
      { 
        ...updateData,
        'progress.lastAccessed': new Date(),
        'metadata.lastUpdated': new Date()
      },
      { new: true, runValidators: true }
    );

    if (!adaptiveContent) {
      return res.status(404).json({ message: 'Adaptive content not found' });
    }

    res.json(adaptiveContent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get personalized dashboard data
exports.getPersonalizedDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user preferences
    const preferences = await UserPreference.findOne({ user: userId });

    // Get active learning paths
    const activePaths = await LearningPath.find({ 
      user: userId, 
      status: 'active' 
    }).limit(5);

    // Get recent recommendations
    const recentRecommendations = await Recommendation.find({ 
      user: userId, 
      status: 'active' 
    }).sort({ createdAt: -1 }).limit(10);

    // Get adaptive content progress
    const adaptiveContent = await AdaptiveContent.find({ 
      user: userId 
    }).sort({ 'progress.lastAccessed': -1 }).limit(10);

    // Calculate learning statistics
    const totalTimeSpent = adaptiveContent.reduce((sum, content) => sum + (content.progress.timeSpent || 0), 0);
    const completedContent = adaptiveContent.filter(content => content.progress.isCompleted).length;
    const averageEngagement = adaptiveContent.length > 0 
      ? adaptiveContent.reduce((sum, content) => sum + (content.analytics.engagementScore || 0), 0) / adaptiveContent.length 
      : 0;

    const dashboardData = {
      preferences,
      activePaths,
      recentRecommendations,
      adaptiveContent,
      statistics: {
        totalTimeSpent,
        completedContent,
        averageEngagement: Math.round(averageEngagement),
        activePathsCount: activePaths.length,
        recommendationsCount: recentRecommendations.length
      }
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate AI-powered learning path
exports.generateLearningPath = async (req, res) => {
  try {
    const { goal, type, difficulty, estimatedDuration } = req.body;

    // Get user preferences
    const preferences = await UserPreference.findOne({ user: req.user.id });
    if (!preferences) {
      return res.status(404).json({ message: 'User preferences not found' });
    }

    // Find relevant courses based on goal and preferences
    const query = { isPublished: true };
    if (difficulty) query.level = difficulty;
    if (preferences.interests.length > 0) {
      const userCategories = preferences.interests.map(interest => interest.category);
      query.category = { $in: userCategories };
    }

    const relevantCourses = await Course.find(query)
      .populate('createdBy', 'name')
      .limit(20);

    // Create milestones based on courses
    const milestones = relevantCourses.slice(0, 5).map((course, index) => ({
      title: `Complete ${course.title}`,
      description: course.description,
      type: 'course',
      targetId: course._id,
      order: index + 1,
      estimatedHours: course.duration || 2,
      requiredScore: 70
    }));

    // Create learning path
    const learningPath = await LearningPath.create({
      user: req.user.id,
      name: `${goal} Learning Path`,
      description: `Personalized learning path to achieve: ${goal}`,
      goal,
      type: type || 'custom',
      difficulty: difficulty || 'intermediate',
      estimatedDuration: estimatedDuration || 20,
      milestones,
      metadata: {
        createdBy: 'ai',
        version: 1
      }
    });

    res.status(201).json(learningPath);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update recommendation feedback
exports.updateRecommendationFeedback = async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const { rating, action, feedback } = req.body;

    const recommendation = await Recommendation.findOneAndUpdate(
      { _id: recommendationId, user: req.user.id },
      {
        'userFeedback.rating': rating,
        'userFeedback.action': action,
        'userFeedback.feedback': feedback,
        'userFeedback.timestamp': new Date(),
        status: action === 'dismissed' ? 'dismissed' : 'active'
      },
      { new: true }
    );

    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    res.json(recommendation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 