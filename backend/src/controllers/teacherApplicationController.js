const TeacherApplication = require('../models/TeacherApplication');
const User = require('../models/User');

// Submit teacher application
exports.submitApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      bio,
      expertise,
      experience,
      education,
      portfolio,
      motivation
    } = req.body;

    const userId = req.user.id; // From auth middleware

    // Check if user already has a pending application
    const existingApplication = await TeacherApplication.findOne({
      userId,
      status: 'pending'
    });

    if (existingApplication) {
      return res.status(400).json({
        message: 'You already have a pending application'
      });
    }

    // Create new application
    const application = await TeacherApplication.create({
      userId,
      fullName,
      email,
      phone,
      bio,
      expertise,
      experience,
      education,
      portfolio,
      motivation
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Teacher application error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user's application status
exports.getUserApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const application = await TeacherApplication.findOne({ userId })
      .sort({ createdAt: -1 }); // Get the most recent application

    if (!application) {
      return res.status(404).json({
        message: 'No application found'
      });
    }

    res.json({ application });
  } catch (error) {
    console.error('Get user application error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Admin: Get all applications
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await TeacherApplication.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Admin: Review application
exports.reviewApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.user.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be "approved" or "rejected"'
      });
    }

    const application = await TeacherApplication.findById(applicationId);
    
    if (!application) {
      return res.status(404).json({
        message: 'Application not found'
      });
    }

    // Update application status
    application.status = status;
    application.adminNotes = adminNotes;
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();

    await application.save();

    // If approved, update user role to teacher
    if (status === 'approved') {
      await User.findByIdAndUpdate(application.userId, {
        role: 'teacher'
      });
    }

    res.json({
      message: `Application ${status} successfully`,
      application
    });
  } catch (error) {
    console.error('Review application error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}; 