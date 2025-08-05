const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { adminAuth, auth } = require('../middleware/auth');

// Teacher-specific routes (must come before /:id routes)
router.get('/teacher', auth, courseController.getTeacherCourses);
router.post('/teacher', auth, courseController.createTeacherCourse);
router.put('/teacher/:id', auth, courseController.updateTeacherCourse);
router.delete('/teacher/:id', auth, courseController.deleteTeacherCourse);

router.get('/', courseController.getCourses);
router.get('/search', courseController.searchCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', adminAuth, courseController.createCourse);
router.put('/:id', adminAuth, courseController.updateCourse);
router.delete('/:id', adminAuth, courseController.deleteCourse);

module.exports = router; 