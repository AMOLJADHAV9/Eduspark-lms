const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// Create a new assignment
exports.createAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.create({
      ...req.body,
      createdBy: req.user.id
    });
    
    await assignment.populate('course', 'title');
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all assignments
exports.getAssignments = async (req, res) => {
  try {
    const { course, published } = req.query;
    const filter = {};
    
    if (course) filter.course = course;
    if (published !== undefined) filter.isPublished = published === 'true';
    
    const assignments = await Assignment.find(filter)
      .populate('course', 'title')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assignment by ID
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title')
      .populate('createdBy', 'name');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('course', 'title');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Also delete all submissions for this assignment
    await AssignmentSubmission.deleteMany({ assignment: req.params.id });
    
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { comments } = req.body;
    
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if user is enrolled in the course (use Enrollment collection)
    const enrollment = await Enrollment.findOne({
      course: assignment.course,
      user: req.user.id
    });
    
    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course to submit assignments' });
    }
    
    // Check if assignment is published
    if (!assignment.isPublished) {
      return res.status(403).json({ message: 'This assignment is not available for submission' });
    }
    
    // Check if already submitted
    const existingSubmission = await AssignmentSubmission.findOne({
      user: req.user.id,
      assignment: assignmentId
    });
    
    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }
    
    // Check if late submission is allowed
    const now = new Date();
    const isLate = now > assignment.dueDate;
    let latePenalty = 0;
    
    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({ message: 'Late submissions are not allowed for this assignment' });
    }
    
    if (isLate && assignment.latePenalty > 0) {
      latePenalty = assignment.latePenalty;
    }
    
    // Build attachments array from uploaded files (multer) or fallback to body attachments
    const uploadedAttachments = Array.isArray(req.files) ? req.files.map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      path: `/uploads/assignments/${f.filename}`,
      size: f.size
    })) : [];

    const bodyAttachments = Array.isArray(req.body.attachments) ? req.body.attachments : [];

    const submission = await AssignmentSubmission.create({
      user: req.user.id,
      assignment: assignmentId,
      course: assignment.course,
      dueDate: assignment.dueDate,
      isLate,
      latePenalty,
      maxScore: assignment.maxScore,
      status: isLate ? 'late' : 'submitted',
      attachments: uploadedAttachments.length ? uploadedAttachments : bodyAttachments,
      comments
    });
    
    await submission.populate('assignment', 'title');
    res.status(201).json(submission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Grade assignment submission
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback, rubricScores } = req.body;
    
    const submission = await AssignmentSubmission.findById(submissionId)
      .populate('assignment', 'maxScore')
      .populate('user', 'name');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    const maxScore = submission.assignment.maxScore;
    const percentage = Math.round((score / maxScore) * 100);
    
    // Apply late penalty if applicable
    let finalScore = score;
    if (submission.isLate && submission.latePenalty > 0) {
      finalScore = score * (1 - submission.latePenalty / 100);
    }
    
    submission.score = finalScore;
    submission.percentage = percentage;
    submission.feedback = feedback;
    submission.rubricScores = rubricScores || [];
    submission.status = 'graded';
    submission.gradedBy = req.user.id;
    submission.gradedAt = new Date();
    
    await submission.save();
    
    res.json(submission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user's assignment submissions
exports.getUserSubmissions = async (req, res) => {
  try {
    const { course } = req.query;
    const filter = { user: req.user.id };
    
    if (course) filter.course = course;
    
    const submissions = await AssignmentSubmission.find(filter)
      .populate('assignment', 'title description')
      .populate('course', 'title')
      .populate('gradedBy', 'name')
      .sort({ submittedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all submissions for an assignment (instructor view)
exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
      .populate('user', 'name email')
      .populate('gradedBy', 'name')
      .sort({ submittedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Teacher-specific controller functions
exports.getTeacherAssignments = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher only.' });
    }
    
    // Get courses created by the teacher
    const teacherCourses = await Course.find({ createdBy: req.user.id });
    const courseIds = teacherCourses.map(course => course._id);
    
    // Get assignments for teacher's courses
    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'title')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTeacherAssignment = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher only.' });
    }
    
    const { courseId, title, description, dueDate, maxScore, instructions } = req.body;
    
    // Verify the course belongs to the teacher
    const course = await Course.findOne({ _id: courseId, createdBy: req.user.id });
    if (!course) {
      return res.status(403).json({ message: 'Access denied. Course not found or not owned by teacher.' });
    }
    
    const assignment = await Assignment.create({
      course: courseId,
      title,
      description,
      dueDate: new Date(dueDate),
      maxScore: parseInt(maxScore),
      instructions,
      createdBy: req.user.id,
      isPublished: true
    });
    
    await assignment.populate('course', 'title');
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTeacherAssignment = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher only.' });
    }
    
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Verify the assignment belongs to a course owned by the teacher
    const course = await Course.findOne({ _id: assignment.course, createdBy: req.user.id });
    if (!course) {
      return res.status(403).json({ message: 'Access denied. Assignment not owned by teacher.' });
    }
    
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('course', 'title');
    
    res.json(updatedAssignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTeacherAssignment = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher only.' });
    }
    
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Verify the assignment belongs to a course owned by the teacher
    const course = await Course.findOne({ _id: assignment.course, createdBy: req.user.id });
    if (!course) {
      return res.status(403).json({ message: 'Access denied. Assignment not owned by teacher.' });
    }
    
    await Assignment.findByIdAndDelete(req.params.id);
    // Also delete all submissions for this assignment
    await AssignmentSubmission.deleteMany({ assignment: req.params.id });
    
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 