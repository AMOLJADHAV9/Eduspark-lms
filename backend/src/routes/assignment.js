const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { auth, adminAuth } = require('../middleware/auth');

// Teacher-specific routes (must come before /:id routes)
router.get('/teacher', auth, assignmentController.getTeacherAssignments);
router.post('/teacher', auth, assignmentController.createTeacherAssignment);
router.put('/teacher/:id', auth, assignmentController.updateTeacherAssignment);
router.delete('/teacher/:id', auth, assignmentController.deleteTeacherAssignment);

// Public routes
router.get('/', assignmentController.getAssignments);
router.get('/:id', assignmentController.getAssignmentById);

// Protected routes
router.post('/', adminAuth, assignmentController.createAssignment);
router.put('/:id', adminAuth, assignmentController.updateAssignment);
router.delete('/:id', adminAuth, assignmentController.deleteAssignment);

// Assignment submission routes
router.post('/:assignmentId/submit', auth, assignmentController.submitAssignment);
router.get('/user/submissions', auth, assignmentController.getUserSubmissions);
router.get('/:assignmentId/submissions', auth, assignmentController.getAssignmentSubmissions);
router.post('/submissions/:submissionId/grade', auth, assignmentController.gradeSubmission);

module.exports = router; 