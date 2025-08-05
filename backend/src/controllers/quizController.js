const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const mongoose = require('mongoose');

// Create a new quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, course, lecture, questions, timeLimit, passingScore } = req.body;
    const quiz = await Quiz.create({
      title,
      description,
      course,
      lecture,
      questions,
      timeLimit,
      passingScore,
      createdBy: req.user.id,
    });
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all quizzes for a course/lecture
exports.getQuizzes = async (req, res) => {
  try {
    const { course, lecture } = req.query;
    const filter = {};
    if (course) filter.course = course;
    if (lecture) filter.lecture = lecture;
    const quizzes = await Quiz.find(filter).populate('questions');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single quiz
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('questions');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a quiz
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit quiz answers and auto-grade
exports.submitQuiz = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body; // { questionId: answer }
    const quiz = await Quiz.findById(req.params.id).populate('questions');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let score = 0;
    let total = quiz.questions.length;
    let results = [];
    quiz.questions.forEach(q => {
      let correct = false;
      if (q.type === 'mcq' || q.type === 'short') {
        correct = String(answers[q._id]) === String(q.correctAnswer);
      } else if (q.type === 'truefalse') {
        correct = Boolean(answers[q._id]) === Boolean(q.correctAnswer);
      }
      if (correct) score++;
      results.push({ questionId: q._id, correct, userAnswer: answers[q._id], correctAnswer: q.correctAnswer });
    });
    const passed = score >= (quiz.passingScore || 0);
    const percentage = Math.round((score / total) * 100);

    // Save quiz attempt
    await QuizAttempt.create({
      user: req.user.id,
      quiz: quiz._id,
      course: quiz.course,
      score,
      totalQuestions: total,
      percentage,
      passed,
      answers,
      results,
      timeTaken: timeTaken || 0
    });

    res.json({ score, total, passed, results, percentage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's quiz attempts
exports.getUserAttempts = async (req, res) => {
  try {
    const { course } = req.query;
    const filter = { user: req.user.id };
    if (course) filter.course = course;
    
    const attempts = await QuizAttempt.find(filter)
      .populate('quiz', 'title description')
      .populate('course', 'title')
      .sort({ completedAt: -1 });
    
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};