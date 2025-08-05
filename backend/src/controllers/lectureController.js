const Lecture = require('../models/Lecture');

exports.addLecture = async (req, res) => {
  try {
    const { course, title, videoUrl, notesUrl, order } = req.body;
    const lecture = await Lecture.create({ course, title, videoUrl, notesUrl, order });
    res.status(201).json(lecture);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLecturesByCourse = async (req, res) => {
  try {
    const lectures = await Lecture.find({ course: req.params.courseId }).sort('order');
    res.json(lectures);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });
    res.json(lecture);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findByIdAndDelete(req.params.id);
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });
    res.json({ message: 'Lecture deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Teacher-specific controller functions
exports.getTeacherLectures = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher only.' });
    }
    
    // Get courses created by the teacher
    const Course = require('../models/Course');
    const teacherCourses = await Course.find({ createdBy: req.user.id });
    const courseIds = teacherCourses.map(course => course._id);
    
    // Get lectures for teacher's courses
    const lectures = await Lecture.find({ course: { $in: courseIds } }).populate('course', 'title');
    res.json(lectures);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addTeacherLecture = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher only.' });
    }
    
    const { title, description, course, videoUrl, duration, order } = req.body;
    
    // Verify the course belongs to the teacher
    const Course = require('../models/Course');
    const courseDoc = await Course.findOne({ _id: course, createdBy: req.user.id });
    if (!courseDoc) {
      return res.status(403).json({ message: 'Access denied. Course not found or not owned by teacher.' });
    }
    
    const lecture = await Lecture.create({ 
      title, 
      description, 
      course, 
      videoUrl, 
      duration, 
      order 
    });
    res.status(201).json(lecture);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTeacherLecture = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher only.' });
    }
    
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }
    
    // Verify the lecture belongs to a course owned by the teacher
    const Course = require('../models/Course');
    const course = await Course.findOne({ _id: lecture.course, createdBy: req.user.id });
    if (!course) {
      return res.status(403).json({ message: 'Access denied. Lecture not owned by teacher.' });
    }
    
    const updatedLecture = await Lecture.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedLecture);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTeacherLecture = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher only.' });
    }
    
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }
    
    // Verify the lecture belongs to a course owned by the teacher
    const Course = require('../models/Course');
    const course = await Course.findOne({ _id: lecture.course, createdBy: req.user.id });
    if (!course) {
      return res.status(403).json({ message: 'Access denied. Lecture not owned by teacher.' });
    }
    
    await Lecture.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lecture deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 