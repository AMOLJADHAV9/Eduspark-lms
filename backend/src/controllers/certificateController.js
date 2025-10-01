const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const QuizAttempt = require('../models/QuizAttempt');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Progress = require('../models/Progress');

// Generate certificate for course completion
exports.generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if user is enrolled and has completed the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled
    const enrollment = await Course.findOne({
      _id: courseId,
      'enrollments.user': userId
    });
    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course to receive a certificate' });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      user: userId,
      course: courseId
    });
    if (existingCertificate) {
      return res.status(400).json({ message: 'Certificate already exists for this course' });
    }

    // Calculate course completion metrics
    const progress = await Progress.findOne({ user: userId, course: courseId });
    const quizAttempts = await QuizAttempt.find({ user: userId, course: courseId });
    const assignmentSubmissions = await AssignmentSubmission.find({ user: userId, course: courseId });

    // Calculate total score and percentage
    let totalScore = 0;
    let maxScore = 0;
    let achievements = [];

    // Add quiz scores
    quizAttempts.forEach(attempt => {
      totalScore += attempt.score || 0;
      maxScore += attempt.totalQuestions || 0;
      achievements.push({
        type: 'quiz',
        title: attempt.quiz?.title || 'Quiz',
        score: attempt.score || 0,
        maxScore: attempt.totalQuestions || 0,
        completedAt: attempt.completedAt
      });
    });

    // Add assignment scores
    assignmentSubmissions.forEach(submission => {
      if (submission.status === 'graded') {
        totalScore += submission.score || 0;
        maxScore += submission.maxScore || 0;
        achievements.push({
          type: 'assignment',
          title: submission.assignment?.title || 'Assignment',
          score: submission.score || 0,
          maxScore: submission.maxScore || 0,
          completedAt: submission.gradedAt
        });
      }
    });

    // Add participation points (based on lecture completion)
    if (progress && progress.completedLectures) {
      const participationScore = Math.min(progress.completedLectures.length * 5, 100); // 5 points per lecture, max 100
      totalScore += participationScore;
      maxScore += 100;
      achievements.push({
        type: 'participation',
        title: 'Course Participation',
        score: participationScore,
        maxScore: 100,
        completedAt: new Date()
      });
    }

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Determine grade based on percentage
    let grade;
    if (percentage >= 95) grade = 'A+';
    else if (percentage >= 90) grade = 'A';
    else if (percentage >= 85) grade = 'B+';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 75) grade = 'C+';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';
    else grade = 'F';

    // Check if course is completed (minimum 70% required for certificate)
    if (percentage < 70) {
      return res.status(400).json({ 
        message: 'Course completion requires at least 70%. Current progress: ' + percentage + '%' 
      });
    }

    // Create certificate
    const certificate = await Certificate.create({
      user: userId,
      course: courseId,
      completedAt: new Date(),
      grade,
      percentage,
      totalScore,
      maxScore,
      instructorName: course.createdBy?.name || 'Course Instructor',
      courseTitle: course.title,
      studentName: req.user.name,
      achievements,
      metadata: {
        totalLectures: course.lectures?.length || 0,
        completedLectures: progress?.completedLectures?.length || 0,
        totalQuizzes: quizAttempts.length,
        completedQuizzes: quizAttempts.filter(q => q.passed).length,
        totalAssignments: assignmentSubmissions.length,
        completedAssignments: assignmentSubmissions.filter(a => a.status === 'graded').length,
        timeSpent: progress?.timeSpent || 0,
        lastActivity: progress?.lastActivity || new Date()
      }
    });

    await certificate.populate('course', 'title description');
    await certificate.populate('user', 'name email');

    res.status(201).json(certificate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user's certificates
exports.getUserCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user.id })
      .populate('course', 'title description thumbnail')
      .sort({ issuedAt: -1 });

    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get certificate by ID
exports.getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('course', 'title description')
      .populate('user', 'name email');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Check if user owns this certificate or is admin
    if (certificate.user._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify certificate by verification code
exports.verifyCertificate = async (req, res) => {
  try {
    const { verificationCode } = req.params;

    const certificate = await Certificate.findOne({ verificationCode })
      .populate('course', 'title description')
      .populate('user', 'name email');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found or invalid verification code' });
    }

    res.json({
      isValid: certificate.isVerified,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        courseTitle: certificate.courseTitle,
        studentName: certificate.studentName,
        grade: certificate.grade,
        percentage: certificate.percentage,
        issuedAt: certificate.issuedAt,
        completedAt: certificate.completedAt,
        instructorName: certificate.instructorName
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all certificates (admin only)
exports.getAllCertificates = async (req, res) => {
  try {
    const { course, user, grade } = req.query;
    const filter = {};

    if (course) filter.course = course;
    if (user) filter.user = user;
    if (grade) filter.grade = grade;

    const certificates = await Certificate.find(filter)
      .populate('course', 'title')
      .populate('user', 'name email')
      .sort({ issuedAt: -1 });

    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update certificate (admin only)
exports.updateCertificate = async (req, res) => {
  try {
    const { customMessage, certificateTemplate } = req.body;

    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { customMessage, certificateTemplate },
      { new: true, runValidators: true }
    ).populate('course', 'title description')
     .populate('user', 'name email');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.json(certificate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete certificate (admin only)
exports.deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndDelete(req.params.id);

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get certificate statistics
exports.getCertificateStats = async (req, res) => {
  try {
    const stats = await Certificate.aggregate([
      {
        $group: {
          _id: null,
          totalCertificates: { $sum: 1 },
          averagePercentage: { $avg: '$percentage' },
          gradeDistribution: {
            $push: '$grade'
          }
        }
      }
    ]);

    const gradeCounts = {};
    if (stats[0] && stats[0].gradeDistribution) {
      stats[0].gradeDistribution.forEach(grade => {
        gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
      });
    }

    res.json({
      totalCertificates: stats[0]?.totalCertificates || 0,
      averagePercentage: Math.round(stats[0]?.averagePercentage || 0),
      gradeDistribution: gradeCounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 