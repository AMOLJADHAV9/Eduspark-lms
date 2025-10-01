const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const leaderboardController = require('../controllers/leaderboardController');
const { auth, adminAuth } = require('../middleware/auth');

// Achievements
router.get('/achievements', achievementController.getAchievements);
router.get('/achievements/:achievementId', achievementController.getAchievementById);
router.get('/users/achievements', auth, achievementController.getUserAchievements);
router.get('/users/:userId/achievements', achievementController.getUserAchievements);
router.post('/achievements/:achievementId/progress', auth, achievementController.updateProgress);
router.post('/achievements/:achievementId/claim', auth, achievementController.claimReward);
router.get('/achievements/:achievementId/progress', auth, achievementController.getUserProgress);
router.get('/users/:userId/achievements/:achievementId/progress', achievementController.getUserProgress);
router.get('/achievements/recommended', auth, achievementController.getRecommendedAchievements);

// Admin achievements
router.post('/achievements', adminAuth, achievementController.createAchievement);
router.put('/achievements/:achievementId', adminAuth, achievementController.updateAchievement);
router.delete('/achievements/:achievementId', adminAuth, achievementController.deleteAchievement);

// Leaderboards
router.get('/leaderboards', leaderboardController.getLeaderboards);
router.get('/leaderboards/:leaderboardId', leaderboardController.getLeaderboardById);
router.get('/users/leaderboards', auth, leaderboardController.getUserLeaderboards);
router.get('/users/:userId/leaderboards', leaderboardController.getUserLeaderboards);
router.post('/leaderboards/:leaderboardId/entry', auth, leaderboardController.updateEntry);
router.post('/leaderboards/:leaderboardId/claim', auth, leaderboardController.claimReward);
router.get('/leaderboards/:leaderboardId/stats', leaderboardController.getLeaderboardStats);

// Admin leaderboards
router.post('/leaderboards', adminAuth, leaderboardController.createLeaderboard);
router.put('/leaderboards/:leaderboardId', adminAuth, leaderboardController.updateLeaderboard);
router.delete('/leaderboards/:leaderboardId', adminAuth, leaderboardController.deleteLeaderboard);
router.post('/leaderboards/update-rankings', adminAuth, leaderboardController.updateAllRankings);

module.exports = router; 