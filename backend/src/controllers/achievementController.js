const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const UserPoints = require('../models/UserPoints');
const User = require('../models/User');

// Get all achievements
exports.getAchievements = async (req, res) => {
  try {
    const { category, type, rarity, search, page = 1, limit = 20 } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (rarity) filter.rarity = rarity;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'metadata.tags': { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const achievements = await Achievement.find(filter)
      .sort({ rarity: 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Achievement.countDocuments(filter);

    res.json({
      achievements,
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

// Get achievement by ID
exports.getAchievementById = async (req, res) => {
  try {
    const { achievementId } = req.params;
    
    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    res.json(achievement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's achievements
exports.getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;
    const { status, category, page = 1, limit = 20 } = req.query;

    const filter = { user: targetUserId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const userAchievements = await UserAchievement.find(filter)
      .populate('achievement')
      .sort({ earnedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await UserAchievement.countDocuments(filter);

    // Get achievement statistics
    const stats = await UserAchievement.aggregate([
      { $match: { user: mongoose.Types.ObjectId(targetUserId) } },
      {
        $lookup: {
          from: 'achievements',
          localField: 'achievement',
          foreignField: '_id',
          as: 'achievementData'
        }
      },
      {
        $group: {
          _id: null,
          totalEarned: { $sum: 1 },
          totalPoints: { $sum: '$rewards.pointsAwarded' },
          categories: { $addToSet: '$achievementData.category' },
          rarities: { $addToSet: '$achievementData.rarity' }
        }
      }
    ]);

    res.json({
      userAchievements,
      statistics: stats[0] || {
        totalEarned: 0,
        totalPoints: 0,
        categories: [],
        rarities: []
      },
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

// Update achievement progress
exports.updateProgress = async (req, res) => {
  try {
    const { achievementId } = req.params;
    const { progress, activity } = req.body;

    const achievement = await Achievement.findById(achievementId);
    if (!achievement || !achievement.isActive) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    // Get or create user achievement
    let userAchievement = await UserAchievement.findOne({
      user: req.user.id,
      achievement: achievementId
    });

    if (!userAchievement) {
      userAchievement = new UserAchievement({
        user: req.user.id,
        achievement: achievementId,
        progress: {
          current: 0,
          target: achievement.criteria.value
        }
      });
    }

    // Update progress
    if (progress !== undefined) {
      userAchievement.progress.current = Math.min(progress, achievement.criteria.value);
    }

    // Add activity to metadata
    if (activity) {
      userAchievement.metadata.relatedActivities.push({
        type: activity.type,
        value: activity.value,
        timestamp: new Date()
      });
    }

    // Check if achievement is completed
    if (userAchievement.progress.current >= achievement.criteria.value && userAchievement.status !== 'completed') {
      userAchievement.status = 'completed';
      userAchievement.earnedAt = new Date();

      // Award rewards
      userAchievement.rewards.pointsAwarded = achievement.rewards.points;
      userAchievement.rewards.badgesUnlocked = achievement.rewards.badges;
      userAchievement.rewards.specialAccessGranted = achievement.rewards.specialAccess;

      // Update user points
      await UserPoints.findOneAndUpdate(
        { user: req.user.id },
        {
          $inc: { totalPoints: achievement.rewards.points },
          $push: {
            transactions: {
              type: 'earned',
              amount: achievement.rewards.points,
              reason: `Achievement: ${achievement.name}`,
              source: 'achievement',
              sourceId: achievementId
            }
          }
        },
        { upsert: true }
      );

      // Update achievement metadata
      await Achievement.findByIdAndUpdate(achievementId, {
        $inc: { 'metadata.totalEarned': 1 },
        $set: { 'metadata.lastEarned': new Date() }
      });
    }

    await userAchievement.save();
    await userAchievement.populate('achievement');

    res.json(userAchievement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Claim achievement reward
exports.claimReward = async (req, res) => {
  try {
    const { achievementId } = req.params;

    const userAchievement = await UserAchievement.findOne({
      user: req.user.id,
      achievement: achievementId
    });

    if (!userAchievement) {
      return res.status(404).json({ message: 'User achievement not found' });
    }

    if (userAchievement.status !== 'completed') {
      return res.status(400).json({ message: 'Achievement not completed yet' });
    }

    if (userAchievement.rewards.claimed) {
      return res.status(400).json({ message: 'Reward already claimed' });
    }

    userAchievement.status = 'claimed';
    userAchievement.rewards.claimed = true;
    userAchievement.rewards.claimedAt = new Date();

    await userAchievement.save();

    res.json({ message: 'Reward claimed successfully', userAchievement });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get achievement progress for user
exports.getUserProgress = async (req, res) => {
  try {
    const { achievementId } = req.params;
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;

    const userAchievement = await UserAchievement.findOne({
      user: targetUserId,
      achievement: achievementId
    }).populate('achievement');

    if (!userAchievement) {
      // Return progress for unstarted achievement
      const achievement = await Achievement.findById(achievementId);
      if (!achievement) {
        return res.status(404).json({ message: 'Achievement not found' });
      }

      return res.json({
        achievement,
        progress: {
          current: 0,
          target: achievement.criteria.value,
          percentage: 0
        },
        status: 'not_started'
      });
    }

    res.json(userAchievement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recommended achievements for user
exports.getRecommendedAchievements = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get user's current statistics
    const userPoints = await UserPoints.findOne({ user: req.user.id });
    const userStats = userPoints?.statistics || {};

    // Find achievements that match user's current activity
    const recommendations = await Achievement.find({
      isActive: true,
      isHidden: false,
      $or: [
        { 'criteria.type': 'courses_completed', 'criteria.value': { $lte: (userStats.coursesCompleted || 0) + 5 } },
        { 'criteria.type': 'lectures_watched', 'criteria.value': { $lte: (userStats.lecturesWatched || 0) + 10 } },
        { 'criteria.type': 'streak_days', 'criteria.value': { $lte: (userPoints?.currentStreak || 0) + 3 } },
        { 'criteria.type': 'total_points', 'criteria.value': { $lte: (userPoints?.totalPoints || 0) + 100 } }
      ]
    })
    .sort({ rarity: 1, 'metadata.difficulty': 1 })
    .limit(parseInt(limit));

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create achievement (admin only)
exports.createAchievement = async (req, res) => {
  try {
    const achievementData = req.body;
    
    const achievement = await Achievement.create(achievementData);
    res.status(201).json(achievement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update achievement (admin only)
exports.updateAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;
    const updateData = req.body;

    const achievement = await Achievement.findByIdAndUpdate(
      achievementId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    res.json(achievement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete achievement (admin only)
exports.deleteAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;

    const achievement = await Achievement.findByIdAndDelete(achievementId);
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    // Also delete all user achievements for this achievement
    await UserAchievement.deleteMany({ achievement: achievementId });

    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 