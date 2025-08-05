const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Scheduling
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  timezone: { type: String, default: 'Asia/Kolkata' },
  
  // Status
  status: { 
    type: String, 
    enum: ['scheduled', 'live', 'ended', 'cancelled'], 
    default: 'scheduled' 
  },
  
  // Meeting details
  meetingId: { type: String, unique: true },
  meetingUrl: { type: String },
  meetingPassword: { type: String },
  
  // Recording
  recordingUrl: { type: String },
  recordingDuration: { type: Number }, // in minutes
  isRecorded: { type: Boolean, default: false },
  
  // Participants
  maxParticipants: { type: Number, default: 100 },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Settings
  allowChat: { type: Boolean, default: true },
  allowScreenShare: { type: Boolean, default: true },
  allowWhiteboard: { type: Boolean, default: true },
  requireApproval: { type: Boolean, default: false },
  
  // Chat messages (for persistence)
  chatMessages: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['text', 'question', 'answer'], default: 'text' }
  }],
  
  // Whiteboard data
  whiteboardData: {
    elements: [{ type: mongoose.Schema.Types.Mixed }],
    lastUpdated: { type: Date }
  },
  
  // Analytics
  attendanceCount: { type: Number, default: 0 },
  averageWatchTime: { type: Number, default: 0 }, // in minutes
  
}, { timestamps: true });

// Generate unique meeting ID
liveClassSchema.pre('save', async function(next) {
  if (!this.meetingId) {
    this.meetingId = `meet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

module.exports = mongoose.model('LiveClass', liveClassSchema); 