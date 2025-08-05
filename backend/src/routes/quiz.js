const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { auth } = require('../middleware/auth');

// Public
router.get('/', quizController.getQuizzes);
router.get('/:id', quizController.getQuizById);

// Protected
router.post('/', auth, quizController.createQuiz);
router.put('/:id', auth, quizController.updateQuiz);
router.delete('/:id', auth, quizController.deleteQuiz);
router.post('/:id/submit', auth, quizController.submitQuiz);
router.get('/user/attempts', auth, quizController.getUserAttempts);

module.exports = router;