const Leaderboard = require('../models/Leaderboard');
const LeaderboardEntry = require('../models/LeaderboardEntry');
const UserPoints = require('../models/UserPoints');
const User = require('../models/User');

// Get all leaderboards
exports.getLeaderboards = async (req, res) => {
  try {
    const { type, category, isActive = true, page = 1, limit = 20 } = req.query;
    
    const filter = { isPublic: true };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive;

    const skip = (page - 1) * limit;
    
    const leaderboards = await Leaderboard.find(filter)
      .populate('scope.course', 'title')
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Leaderboard.countDocuments(filter);

    res.json({
      leaderboards,
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

// Get leaderboard by ID with rankings
exports.getLeaderboardById = async (req, res) => {
  try {
    const { leaderboardId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const leaderboard = await Leaderboard.findById(leaderboardId);
    if (!leaderboard || !leaderboard.isPublic) {
      return res.status(404).json({ message: 'Leaderboard not found' });
    }

    const skip = (page - 1) * limit;

    // Get leaderboard entries
    const entries = await LeaderboardEntry.find({ 
      leaderboard: leaderboardId,
      isActive: true 
    })
    .populate('user', 'name email')
    .sort({ score: -1, rank: 1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await LeaderboardEntry.countDocuments({ 
      leaderboard: leaderboardId,
      isActive: true 
    });

    // Get user's own entry if they're logged in
    let userEntry = null;
    if (req.user) {
      userEntry = await LeaderboardEntry.findOne({
        leaderboard: leaderboardId,
        user: req.user.id
      }).populate('user', 'name email');
    }

    res.json({
      leaderboard,
      entries,
      userEntry,
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

// Get user's leaderboard entries
exports.getUserLeaderboards = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const entries = await LeaderboardEntry.find({ 
      user: targetUserId,
      isActive: true 
    })
    .populate('leaderboard')
    .populate('user', 'name email')
    .sort({ score: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await LeaderboardEntry.countDocuments({ 
      user: targetUserId,
      isActive: true 
    });

    res.json({
      entries,
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

// Update leaderboard entry
exports.updateEntry = async (req, res) => {
  try {
    const { leaderboardId } = req.params;
    const { score, metadata } = req.body;

    const leaderboard = await Leaderboard.findById(leaderboardId);
    if (!leaderboard || !leaderboard.isActive) {
      return res.status(404).json({ message: 'Leaderboard not found' });
    }

    // Get or create entry
    let entry = await LeaderboardEntry.findOne({
      leaderboard: leaderboardId,
      user: req.user.id
    });

    if (!entry) {
      entry = new LeaderboardEntry({
        leaderboard: leaderboardId,
        user: req.user.id,
        score: 0
      });
    }

    // Update score and metadata
    if (score !== undefined) {
      entry.previousRank = entry.rank;
      entry.score = score;
    }

    if (metadata) {
      entry.metadata = { ...entry.metadata, ...metadata };
    }

    await entry.save();

    // Update rankings
    await updateLeaderboardRankings(leaderboardId);

    // Get updated entry with rank
    const updatedEntry = await LeaderboardEntry.findById(entry._id)
      .populate('user', 'name email')
      .populate('leaderboard');

    res.json(updatedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Claim leaderboard reward
exports.claimReward = async (req, res) => {
  try {
    const { leaderboardId } = req.params;

    const entry = await LeaderboardEntry.findOne({
      leaderboard: leaderboardId,
      user: req.user.id
    });

    if (!entry) {
      return res.status(404).json({ message: 'Leaderboard entry not found' });
    }

    if (entry.rewards.claimed) {
      return res.status(400).json({ message: 'Reward already claimed' });
    }

    const leaderboard = await Leaderboard.findById(leaderboardId);
    if (!leaderboard) {
      return res.status(404).json({ message: 'Leaderboard not found' });
    }

    // Determine reward based on rank
    let reward = null;
    if (entry.rank === 1) reward = leaderboard.rewards.top1;
    else if (entry.rank <= 3) reward = leaderboard.rewards.top3;
    else if (entry.rank <= 10) reward = leaderboard.rewards.top10;
    else if (entry.rank <= 50) reward = leaderboard.rewards.top50;
    else reward = leaderboard.rewards.participation;

    if (reward) {
      entry.rewards.pointsAwarded = reward.points || 0;
      entry.rewards.badgesUnlocked = reward.badges || [];
      entry.rewards.specialAccessGranted = reward.specialAccess || [];
      entry.rewards.claimed = true;
      entry.rewards.claimedAt = new Date();

      // Update user points
      if (reward.points > 0) {
        await UserPoints.findOneAndUpdate(
          { user: req.user.id },
          {
            $inc: { totalPoints: reward.points },
            $push: {
              transactions: {
                type: 'earned',
                amount: reward.points,
                reason: `Leaderboard: ${leaderboard.name} - Rank ${entry.rank}`,
                source: 'leaderboard',
                sourceId: leaderboardId
              }
            }
          },
          { upsert: true }
        );
      }

      await entry.save();
    }

    res.json({ message: 'Reward claimed successfully', entry });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create leaderboard (admin only)
exports.createLeaderboard = async (req, res) => {
  try {
    const leaderboardData = req.body;
    
    const leaderboard = await Leaderboard.create(leaderboardData);
    res.status(201).json(leaderboard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update leaderboard (admin only)
exports.updateLeaderboard = async (req, res) => {
  try {
    const { leaderboardId } = req.params;
    const updateData = req.body;

    const leaderboard = await Leaderboard.findByIdAndUpdate(
      leaderboardId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!leaderboard) {
      return res.status(404).json({ message: 'Leaderboard not found' });
    }

    res.json(leaderboard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete leaderboard (admin only)
exports.deleteLeaderboard = async (req, res) => {
  try {
    const { leaderboardId } = req.params;

    const leaderboard = await Leaderboard.findByIdAndDelete(leaderboardId);
    if (!leaderboard) {
      return res.status(404).json({ message: 'Leaderboard not found' });
    }

    // Also delete all entries for this leaderboard
    await LeaderboardEntry.deleteMany({ leaderboard: leaderboardId });

    res.json({ message: 'Leaderboard deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update all leaderboard rankings
exports.updateAllRankings = async (req, res) => {
  try {
    const leaderboards = await Leaderboard.find({ isActive: true });
    
    for (const leaderboard of leaderboards) {
      await updateLeaderboardRankings(leaderboard._id);
    }

    res.json({ message: 'All leaderboard rankings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to update leaderboard rankings
async function updateLeaderboardRankings(leaderboardId) {
  const entries = await LeaderboardEntry.find({ 
    leaderboard: leaderboardId,
    isActive: true 
  }).sort({ score: -1 });

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const newRank = i + 1;
    
    if (entry.rank !== newRank) {
      entry.previousRank = entry.rank;
      entry.rank = newRank;
      await entry.save();
    }
  }
}

// Get leaderboard statistics
exports.getLeaderboardStats = async (req, res) => {
  try {
    const { leaderboardId } = req.params;

    const stats = await LeaderboardEntry.aggregate([
      { $match: { leaderboard: mongoose.Types.ObjectId(leaderboardId), isActive: true } },
      {
        $group: {
          _id: null,
          totalParticipants: { $sum: 1 },
          averageScore: { $avg: '$score' },
          highestScore: { $max: '$score' },
          lowestScore: { $min: '$score' },
          totalPoints: { $sum: '$rewards.pointsAwarded' }
        }
      }
    ]);

    res.json(stats[0] || {
      totalParticipants: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      totalPoints: 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 