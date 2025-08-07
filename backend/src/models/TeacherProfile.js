const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  expertise: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    enum: ['0-1', '1-3', '3-5', '5-10', '10+'],
    default: '0-1'
  },
  education: {
    type: String,
    trim: true
  },
  portfolio: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    trim: true
  },
  socialLinks: [{
    platform: { type: String },
    url: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('TeacherProfile', teacherProfileSchema);