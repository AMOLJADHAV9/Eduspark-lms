const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  learningStyle: {
    visual: { type: Number, default: 0 }, // 0-100 scale
    auditory: { type: Number, default: 0 },
    kinesthetic: { type: Number, default: 0 },
    reading: { type: Number, default: 0 }
  },
  interests: [{
    category: { type: String, required: true },
    level: { type: Number, default: 1 }, // 1-5 scale
    lastUpdated: { type: Date, default: Date.now }
  }],
  skillLevels: [{
    skill: { type: String, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    confidence: { type: Number, default: 50 }, // 0-100 scale
    lastAssessed: { type: Date, default: Date.now }
  }],
  goals: [{
    type: { type: String, enum: ['career', 'personal', 'academic', 'certification'], required: true },
    description: { type: String, required: true },
    targetDate: { type: Date },
    priority: { type: Number, default: 1 }, // 1-5 scale
    isActive: { type: Boolean, default: true },
    progress: { type: Number, default: 0 }, // 0-100 scale
    createdAt: { type: Date, default: Date.now }
  }],
  timeAvailability: {
    dailyHours: { type: Number, default: 1 }, // Hours per day
    weeklyDays: { type: Number, default: 5 }, // Days per week
    preferredTimeSlots: [{ type: String }], // ['morning', 'afternoon', 'evening']
    maxSessionDuration: { type: Number, default: 60 } // Minutes
  },
  contentPreferences: {
    preferredFormats: [{ type: String }], // ['video', 'text', 'interactive', 'audio']
    difficultyPreference: { type: String, enum: ['easy', 'moderate', 'challenging'], default: 'moderate' },
    pacePreference: { type: String, enum: ['slow', 'normal', 'fast'], default: 'normal' },
    languagePreference: { type: String, default: 'en' },
    accessibilityNeeds: [{ type: String }] // ['subtitles', 'audio_description', 'high_contrast']
  },
  socialPreferences: {
    groupLearning: { type: Boolean, default: true },
    peerInteraction: { type: Boolean, default: true },
    instructorInteraction: { type: Boolean, default: true },
    publicProfile: { type: Boolean, default: true },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  aiSettings: {
    recommendationStrength: { type: Number, default: 0.7 }, // 0-1 scale
    explorationRate: { type: Number, default: 0.3 }, // 0-1 scale
    personalizationLevel: { type: String, enum: ['minimal', 'moderate', 'high'], default: 'moderate' },
    allowDataCollection: { type: Boolean, default: true },
    allowPersonalization: { type: Boolean, default: true }
  },
  metadata: {
    lastUpdated: { type: Date, default: Date.now },
    totalAssessments: { type: Number, default: 0 },
    preferenceAccuracy: { type: Number, default: 0 }, // 0-1 scale
    learningPatterns: [{
      type: { type: String },
      frequency: { type: Number },
      duration: { type: Number },
      effectiveness: { type: Number }
    }]
  }
}, { timestamps: true });

// Indexes for efficient queries
userPreferenceSchema.index({ user: 1 });
userPreferenceSchema.index({ 'interests.category': 1 });
userPreferenceSchema.index({ 'skillLevels.skill': 1 });

module.exports = mongoose.model('UserPreference', userPreferenceSchema); 