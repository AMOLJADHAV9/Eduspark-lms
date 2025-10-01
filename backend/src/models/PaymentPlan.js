const mongoose = require('mongoose');

const paymentPlanSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['subscription', 'one_time', 'bundle', 'tier'],
    required: true
  },
  pricing: {
    amount: { type: Number, required: true }, // Amount in cents
    currency: { type: String, default: 'INR' },
    interval: { type: String, enum: ['monthly', 'quarterly', 'yearly', 'lifetime'], default: 'monthly' },
    trialDays: { type: Number, default: 0 },
    setupFee: { type: Number, default: 0 }, // One-time setup fee
    discount: {
      percentage: { type: Number, default: 0 },
      validUntil: { type: Date },
      minimumMonths: { type: Number, default: 0 }
    }
  },
  features: [{
    name: { type: String, required: true },
    description: { type: String },
    isIncluded: { type: Boolean, default: true },
    limit: { type: Number }, // -1 for unlimited
    currentUsage: { type: Number, default: 0 }
  }],
  courseAccess: {
    includedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    excludedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    accessLevel: { type: String, enum: ['all', 'category', 'selected', 'premium'], default: 'selected' },
    categories: [{ type: String }],
    maxCourses: { type: Number, default: -1 } // -1 for unlimited
  },
  limits: {
    maxStudents: { type: Number, default: -1 },
    maxStorage: { type: Number, default: 1024 }, // MB
    maxBandwidth: { type: Number, default: -1 }, // GB
    maxLiveClasses: { type: Number, default: 0 },
    maxQuizzes: { type: Number, default: -1 },
    maxAssignments: { type: Number, default: -1 },
    maxCertificates: { type: Number, default: -1 },
    maxForums: { type: Number, default: -1 }
  },
  billing: {
    autoRenew: { type: Boolean, default: true },
    proration: { type: Boolean, default: true },
    gracePeriod: { type: Number, default: 7 }, // Days
    lateFees: { type: Number, default: 0 },
    cancellationPolicy: { type: String, default: 'immediate' },
    refundPolicy: { type: String, default: '7_days' }
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'deprecated', 'beta'],
    default: 'active'
  },
  isPopular: { type: Boolean, default: false },
  isRecommended: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  metadata: {
    stripePriceId: { type: String },
    paypalPlanId: { type: String },
    totalSubscribers: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    churnRate: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  restrictions: {
    minAge: { type: Number },
    maxAge: { type: Number },
    countries: [{ type: String }],
    excludedCountries: [{ type: String }],
    requiredFields: [{ type: String }],
    termsOfService: { type: String },
    privacyPolicy: { type: String }
  }
}, { timestamps: true });

// Indexes for efficient queries
paymentPlanSchema.index({ type: 1, status: 1 });
paymentPlanSchema.index({ 'pricing.amount': 1 });
paymentPlanSchema.index({ isPopular: 1, isRecommended: 1 });
paymentPlanSchema.index({ sortOrder: 1 });

// Virtual for display price
paymentPlanSchema.virtual('displayPrice').get(function() {
  const amount = this.pricing.amount / 100; // Convert cents to dollars
  const currency = this.pricing.currency;
  return `${currency} ${amount.toFixed(2)}`;
});

// Virtual for discounted price
paymentPlanSchema.virtual('discountedPrice').get(function() {
  if (!this.pricing.discount.percentage) return this.pricing.amount;
  const discount = this.pricing.amount * (this.pricing.discount.percentage / 100);
  return this.pricing.amount - discount;
});

module.exports = mongoose.model('PaymentPlan', paymentPlanSchema); 