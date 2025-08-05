const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { auth } = require('../middleware/auth');

// Public routes
router.get('/', questionController.getQuestions);
router.get('/:id', questionController.getQuestionById);

// Protected routes
router.post('/', auth, questionController.createQuestion);
router.put('/:id', auth, questionController.updateQuestion);
router.delete('/:id', auth, questionController.deleteQuestion);

module.exports = router; 