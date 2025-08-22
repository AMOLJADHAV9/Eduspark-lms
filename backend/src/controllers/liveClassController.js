const LiveClass = require('../models/LiveClass');
const Course = require('../models/Course');
const User = require('../models/User');
const { createLiveClassNotification } = require('./notificationController');

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
      requireApproval,
      streamingPlatform = 'youtube',
      youtubeStreamUrl,
      zegoRoomId,
      meetingUrl
    } = req.body;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate YouTube URL if using YouTube platform
    if (streamingPlatform === 'youtube' && !youtubeStreamUrl) {
      return res.status(400).json({ message: 'YouTube stream URL is required for YouTube live streaming' });
    }

    // Extract video ID from YouTube URL if provided
    let youtubeVideoId = null;
    if (youtubeStreamUrl) {
      const videoIdMatch = youtubeStreamUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
      youtubeVideoId = videoIdMatch ? videoIdMatch[1] : null;
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
      requireApproval: requireApproval || false,
      streamingPlatform,
      youtubeStreamUrl,
      youtubeVideoId,
      zegoRoomId,
      meetingUrl
    });

    await liveClass.populate('course instructor');

    // Create notifications for enrolled students
    try {
      const notificationTitle = `New Live Class: ${title}`;
      const notificationMessage = `A new live class "${title}" has been scheduled for ${new Date(scheduledAt).toLocaleDateString()} at ${new Date(scheduledAt).toLocaleTimeString()}. Join us for an interactive learning session!`;
      
      await createLiveClassNotification(liveClass._id, notificationTitle, notificationMessage);
    } catch (notificationError) {
      console.error('Failed to create notifications:', notificationError);
      // Don't fail the live class creation if notifications fail
    }

    res.status(201).json(liveClass);
  } catch (error) {
    console.error('Error creating live class:', error);
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

    const updates = { ...req.body };

    // If youtubeStreamUrl is provided, auto-extract the video ID
    if (typeof updates.youtubeStreamUrl === 'string' && updates.youtubeStreamUrl.trim() !== '') {
      const url = updates.youtubeStreamUrl.trim();
      let videoId = null;

      // Try to extract from common URL formats
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([^&\n?#]+)/);
      if (match && match[1]) {
        videoId = match[1];
      } else {
        // Fallback: if plain 11-char YouTube ID
        const idCandidate = url.split('?')[0];
        if (/^[a-zA-Z0-9_-]{11}$/.test(idCandidate)) {
          videoId = idCandidate;
        }
      }

      if (videoId) {
        updates.youtubeVideoId = videoId;
      }
    }

    const updatedLiveClass = await LiveClass.findByIdAndUpdate(
      req.params.id,
      updates,
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
      meetingUrl: liveClass.meetingUrl,
      streamingPlatform: liveClass.streamingPlatform,
      zegoRoomId: liveClass.zegoRoomId
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
    
    // Set meeting URL based on streaming platform, but preserve existing if provided
    if (liveClass.streamingPlatform === 'youtube' && liveClass.youtubeStreamUrl) {
      liveClass.meetingUrl = liveClass.youtubeStreamUrl;
    } else if (liveClass.streamingPlatform === 'google_meet') {
      // Use provided Google Meet link if present; otherwise fallback to a generic meet URL pattern
      liveClass.meetingUrl = liveClass.meetingUrl && liveClass.meetingUrl.trim() !== ''
        ? liveClass.meetingUrl
        : `https://meet.google.com/${liveClass.meetingId}`;
    } else if (liveClass.streamingPlatform === 'zego') {
      // Frontend will render ZEGOCLOUD UI with roomId; leave meetingUrl empty
      liveClass.meetingUrl = '';
    } else if (liveClass.streamingPlatform === 'custom') {
      // Respect any custom meeting URL
      liveClass.meetingUrl = liveClass.meetingUrl || '';
    }
    
    await liveClass.save();

    // Send live notifications to enrolled students
    try {
      const notificationTitle = `Live Class Started: ${liveClass.title}`;
      const notificationMessage = `The live class "${liveClass.title}" has started! Click to join the stream now.`;
      
      await createLiveClassNotification(liveClass._id, notificationTitle, notificationMessage);
    } catch (notificationError) {
      console.error('Failed to send live notifications:', notificationError);
    }

    res.json({ 
      message: 'Live class started',
      meetingUrl: liveClass.meetingUrl,
      meetingId: liveClass.meetingId,
      streamingPlatform: liveClass.streamingPlatform,
      youtubeStreamUrl: liveClass.youtubeStreamUrl,
      zegoRoomId: liveClass.zegoRoomId
    });
  } catch (error) {
    console.error('Error starting live class:', error);
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
      meetingLink,
      meetingUrl: meetingUrlBody,
      streamingPlatform = 'youtube',
      youtubeStreamUrl,
      zegoRoomId
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
      meetingUrl: meetingUrlBody || meetingLink || undefined,
      status: 'scheduled',
      allowChat: true,
      allowScreenShare: true,
      allowWhiteboard: true,
      requireApproval: false,
      streamingPlatform,
      youtubeStreamUrl,
      zegoRoomId
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

    const updatedLiveClass = await LiveClass.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
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