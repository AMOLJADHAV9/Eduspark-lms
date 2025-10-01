const express = require('express');
const router = express.Router();
const lectureController = require('../controllers/lectureController');
const { adminAuth, auth } = require('../middleware/auth');

// Teacher-specific routes (must come before /:id routes)
router.get('/teacher', auth, lectureController.getTeacherLectures);
router.post('/teacher', auth, lectureController.addTeacherLecture);
router.put('/teacher/:id', auth, lectureController.updateTeacherLecture);
router.delete('/teacher/:id', auth, lectureController.deleteTeacherLecture);

router.get('/course/:courseId', lectureController.getLecturesByCourse);
router.post('/', adminAuth, lectureController.addLecture);
router.put('/:id', adminAuth, lectureController.updateLecture);
router.delete('/:id', adminAuth, lectureController.deleteLecture);

module.exports = router; 