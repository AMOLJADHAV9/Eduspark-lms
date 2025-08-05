const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  thumbnail: { type: String },
  price: { type: Number, default: 0 },
  syllabus: { type: String },
  category: { type: String, required: true, enum: [
    'Programming',
    'Web Development',
    'Backend Development',
    'Data Science',
    'Design',
    'Technology',
    'Business',
    'Marketing',
    'Finance',
    'Health',
    'Education',
    'Other'
  ] },
  level: { type: String, required: true, enum: ['beginner', 'intermediate', 'advanced'] },
  duration: { type: Number, default: 0 }, // in hours
  tags: [{ type: String }],
  lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublished: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema); 