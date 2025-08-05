const LiveClass = require('../models/LiveClass');
const Course = require('../models/Course');
const User = require('../models/User');

// Create a new live class
exports.createLiveClass = async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      scheduledAt,
      duration,
      maxParticipants,
      allowChat,
      allowScreenShare,
      allowWhiteboard,
      requireApproval
    } = req.body;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const liveClass = await LiveClass.create({
      title,
      description,
      course: courseId,
      instructor: req.user.id,
      scheduledAt: new Date(scheduledAt),
      duration,
      maxParticipants: maxParticipants || 100,
      allowChat: allowChat !== false,
      allowScreenShare: allowScreenShare !== false,
      allowWhiteboard: allowWhiteboard !== false,
      requireApproval: requireApproval || false
    });

    await liveClass.populate('course instructor');
    res.status(201).json(liveClass);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all live classes (with filters)
exports.getLiveClasses = async (req, res) => {
  try {
    const { status, courseId, instructorId, upcoming } = req.query;
    let query = {};

    if (status) query.status = status;
    if (courseId) query.course = courseId;
    if (instructorId) query.instructor = instructorId;
    if (upcoming === 'true') {
      query.scheduledAt = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'live'] };
    }

    const liveClasses = await LiveClass.find(query)
      .populate('course', 'title thumbnail')
      .populate('instructor', 'name email')
      .sort({ scheduledAt: 1 });

    res.json(liveClasses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get live class by ID
exports.getLiveClassById = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id)
      .populate('course', 'title description thumbnail')
      .populate('instructor', 'name email')
      .populate('enrolledStudents', 'name email')
      .populate('chatMessages.user', 'name');

    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    res.json(liveClass);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update live class
exports.updateLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    // Only instructor can update
    if (liveClass.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedLiveClass = await LiveClass.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('course instructor');

    res.json(updatedLiveClass);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete live class
exports.deleteLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    // Only instructor or admin can delete
    if (liveClass.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await LiveClass.findByIdAndDelete(req.params.id);
    res.json({ message: 'Live class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Join live class
exports.joinLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    // Check if user is already enrolled
    const isEnrolled = liveClass.enrolledStudents.includes(req.user.id);
    if (!isEnrolled) {
      // Check if course enrollment is required
      const course = await Course.findById(liveClass.course);
      if (course) {
        // For now, allow anyone to join. You can add course enrollment check here
        liveClass.enrolledStudents.push(req.user.id);
        await liveClass.save();
      }
    }

    res.json({ 
      message: 'Joined live class successfully',
      meetingId: liveClass.meetingId,
      meetingUrl: liveClass.meetingUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Start live class
exports.startLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    // Only instructor can start
    if (liveClass.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only instructor can start the class' });
    }

    liveClass.status = 'live';
    liveClass.meetingUrl = `https://meet.google.com/${liveClass.meetingId}`;
    await liveClass.save();

    res.json({ 
      message: 'Live class started',
      meetingUrl: liveClass.meetingUrl,
      meetingId: liveClass.meetingId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// End live class
exports.endLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    // Only instructor can end
    if (liveClass.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only instructor can end the class' });
    }

    liveClass.status = 'ended';
    await liveClass.save();

    res.json({ message: 'Live class ended successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add chat message
exports.addChatMessage = async (req, res) => {
  try {
    const { message, type = 'text' } = req.body;
    const liveClass = await LiveClass.findById(req.params.id);
    
    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    // Check if chat is allowed
    if (!liveClass.allowChat) {
      return res.status(400).json({ message: 'Chat is disabled for this class' });
    }

    liveClass.chatMessages.push({
      user: req.user.id,
      message,
      type
    });

    await liveClass.save();
    await liveClass.populate('chatMessages.user', 'name');

    res.json({ 
      message: 'Message sent',
      chatMessage: liveClass.chatMessages[liveClass.chatMessages.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update whiteboard data
exports.updateWhiteboard = async (req, res) => {
  try {
    const { elements } = req.body;
    const liveClass = await LiveClass.findById(req.params.id);
    
    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    // Only instructor can update whiteboard
    if (liveClass.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only instructor can update whiteboard' });
    }

    liveClass.whiteboardData = {
      elements,
      lastUpdated: new Date()
    };

    await liveClass.save();
    res.json({ message: 'Whiteboard updated', whiteboardData: liveClass.whiteboardData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get live class analytics
exports.getLiveClassAnalytics = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    // Only instructor can view analytics
    if (liveClass.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const analytics = {
      totalEnrolled: liveClass.enrolledStudents.length,
      attendanceCount: liveClass.attendanceCount,
      averageWatchTime: liveClass.averageWatchTime,
      chatMessageCount: liveClass.chatMessages.length,
      status: liveClass.status,
      duration: liveClass.duration,
      scheduledAt: liveClass.scheduledAt
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Teacher-specific controller functions
exports.getTeacherLiveClasses = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher only.' });
    }
    
    const liveClasses = await LiveClass.find({ instructor: req.user.id })
      .populate('course', 'title thumbnail')
      .populate('enrolledStudents', 'name email')
      .sort({ scheduledAt: -1 });
    
    res.json(liveClasses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createTeacherLiveClass = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher only.' });
    }
    
    const {
      title,
      description,
      courseId,
      scheduledDate,
      scheduledTime,
      duration,
      maxStudents,
      meetingLink
    } = req.body;

    // Verify the course belongs to the teacher
    const course = await Course.findOne({ _id: courseId, createdBy: req.user.id });
    if (!course) {
      return res.status(403).json({ message: 'Access denied. Course not found or not owned by teacher.' });
    }

    // Combine date and time
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);

    const liveClass = await LiveClass.create({
      title,
      description,
      course: courseId,
      instructor: req.user.id,
      scheduledAt,
      duration: parseInt(duration),
      maxParticipants: parseInt(maxStudents),
      meetingLink,
      status: 'scheduled',
      allowChat: true,
      allowScreenShare: true,
      allowWhiteboard: true,
      requireApproval: false
    });

    await liveClass.populate('course', 'title');
    res.status(201).json(liveClass);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTeacherLiveClass = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher only.' });
    }
    
    const liveClass = await LiveClass.findOne({ _id: req.params.id, instructor: req.user.id });
    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found or access denied' });
    }

    const updatedLiveClass = await LiveClass.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedLiveClass);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTeacherLiveClass = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher only.' });
    }
    
    const liveClass = await LiveClass.findOne({ _id: req.params.id, instructor: req.user.id });
    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found or access denied' });
    }

    await LiveClass.findByIdAndDelete(req.params.id);
    res.json({ message: 'Live class deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 