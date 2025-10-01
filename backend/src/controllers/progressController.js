const Progress = require('../models/Progress');

exports.markLectureComplete = async (req, res) => {
  try {
    const { courseId, lectureId } = req.body;
    const existing = await Progress.findOne({ user: req.user.id, course: courseId, lecture: lectureId });
    if (existing) return res.status(400).json({ message: 'Already marked as complete' });
    const progress = await Progress.create({ user: req.user.id, course: courseId, lecture: lectureId });
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.id }).populate('course lecture');
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 