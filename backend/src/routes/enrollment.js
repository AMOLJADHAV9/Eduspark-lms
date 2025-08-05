const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/', auth, enrollmentController.enroll);
router.get('/user', auth, enrollmentController.getUserEnrollments);
router.get('/check/:courseId', auth, enrollmentController.checkEnrollment);
router.get('/course/:courseId', adminAuth, enrollmentController.getCourseEnrollments);

module.exports = router; 