const Enrollment = require('../models/Enrollment');

exports.enroll = async (req, res) => {
  try {
    const { courseId, isPaid } = req.body;
    const existing = await Enrollment.findOne({ user: req.user.id, course: courseId });
    if (existing) return res.status(400).json({ message: 'Already enrolled' });
    const enrollment = await Enrollment.create({ user: req.user.id, course: courseId, isPaid });
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate('course')
      .sort({ createdAt: -1 });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: get purchased courses (enrollments) across users
exports.getAllEnrollments = async (req, res) => {
  try {
    const { userId, courseId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (userId) filter.user = userId;
    if (courseId) filter.course = courseId;

    const skip = (page - 1) * limit;

    const enrollments = await Enrollment.find(filter)
      .populate('user', 'name email')
      .populate('course', 'title price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Enrollment.countDocuments(filter);

    res.json({
      enrollments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCourseEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.courseId }).populate('user', 'name email');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.checkEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ 
      user: req.user.id, 
      course: req.params.courseId 
    });
    res.json({ enrolled: !!enrollment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 