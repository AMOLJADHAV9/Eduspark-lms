const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  answers: { type: Map, of: mongoose.Schema.Types.Mixed }, // questionId: answer
  results: [{ // Detailed results for each question
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    correct: { type: Boolean },
    userAnswer: mongoose.Schema.Types.Mixed,
    correctAnswer: mongoose.Schema.Types.Mixed
  }],
  timeTaken: { type: Number }, // in seconds
  completedAt: { type: Date, default: Date.now },
  startedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema); 