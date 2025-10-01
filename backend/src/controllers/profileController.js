const StudentProfile = require('../models/StudentProfile');
const TeacherProfile = require('../models/TeacherProfile');
const User = require('../models/User');

// Get current user's profile (student or teacher)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    let profile;
    if (role === 'teacher') {
      profile = await TeacherProfile.findOne({ user: userId });
    } else {
      profile = await StudentProfile.findOne({ user: userId });
    }
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update current user's profile (student or teacher)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    let profile;
    if (role === 'teacher') {
      profile = await TeacherProfile.findOneAndUpdate(
        { user: userId },
        req.body,
        { new: true, upsert: true }
      );
    } else {
      profile = await StudentProfile.findOneAndUpdate(
        { user: userId },
        req.body,
        { new: true, upsert: true }
      );
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};