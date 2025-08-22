const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { auth, adminAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure uploads storage for assignment submissions
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'assignments');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

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
router.post('/:assignmentId/submit', auth, upload.array('attachments', 10), assignmentController.submitAssignment);
router.get('/user/submissions', auth, assignmentController.getUserSubmissions);
router.get('/:assignmentId/submissions', auth, assignmentController.getAssignmentSubmissions);
router.post('/submissions/:submissionId/grade', auth, assignmentController.gradeSubmission);

module.exports = router; 