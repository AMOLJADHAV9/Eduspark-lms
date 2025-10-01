const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
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
  age: {
    type: Number
  },
  bio: {
    type: String,
    trim: true
  },
  interests: [{
    type: String,
    trim: true
  }],
  profilePicture: {
    type: String,
    trim: true
  },
  gradeLevel: {
    type: String,
    trim: true
  },
  school: {
    type: String,
    trim: true
  },
  socialLinks: [{
    platform: { type: String },
    url: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);