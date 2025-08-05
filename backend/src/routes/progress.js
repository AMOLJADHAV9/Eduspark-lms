const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { auth } = require('../middleware/auth');

router.post('/complete', auth, progressController.markLectureComplete);
router.get('/my', auth, progressController.getUserProgress);

module.exports = router; 