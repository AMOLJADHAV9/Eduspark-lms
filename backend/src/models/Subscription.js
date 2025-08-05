const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentPlan', required: true },
  status: { 
    type: String, 
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'trialing', 'paused'],
    default: 'active'
  },
  billing: {
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    nextBillingDate: { type: Date },
    trialEndDate: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    canceledAt: { type: Date },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date }
  },
  payment: {
    amount: { type: Number, required: true }, // Amount in cents
    currency: { type: String, default: 'USD' },
    interval: { type: String, enum: ['monthly', 'quarterly', 'yearly', 'lifetime'] },
    paymentMethod: { type: String, enum: ['stripe', 'paypal', 'bank_transfer', 'cash'] },
    paymentMethodId: { type: String },
    lastPaymentDate: { type: Date },
    nextPaymentDate: { type: Date },
    totalPaid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 }
  },
  features: {
    activeFeatures: [{ type: String }],
    usage: {
      coursesAccessed: { type: Number, default: 0 },
      liveClassesAttended: { type: Number, default: 0 },
      quizzesTaken: { type: Number, default: 0 },
      assignmentsSubmitted: { type: Number, default: 0 },
      certificatesEarned: { type: Number, default: 0 },
      storageUsed: { type: Number, default: 0 }, // MB
      bandwidthUsed: { type: Number, default: 0 } // GB
    },
    limits: {
      maxCourses: { type: Number, default: -1 },
      maxLiveClasses: { type: Number, default: 0 },
      maxQuizzes: { type: Number, default: -1 },
      maxAssignments: { type: Number, default: -1 },
      maxStorage: { type: Number, default: 1024 }, // MB
      maxBandwidth: { type: Number, default: -1 } // GB
    }
  },
  discounts: [{
    type: { type: String, enum: ['coupon', 'promo', 'loyalty', 'referral'] },
    code: { type: String },
    percentage: { type: Number },
    amount: { type: Number },
    validUntil: { type: Date },
    appliedAt: { type: Date, default: Date.now }
  }],
  invoices: [{
    invoiceId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['paid', 'pending', 'failed', 'refunded'] },
    dueDate: { type: Date },
    paidAt: { type: Date },
    description: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed }
  }],
  metadata: {
    stripeSubscriptionId: { type: String },
    paypalSubscriptionId: { type: String },
    source: { type: String, enum: ['web', 'mobile', 'admin', 'api'] },
    referrer: { type: String },
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    notes: { type: String }
  },
  notifications: {
    paymentReminder: { type: Boolean, default: true },
    paymentSuccess: { type: Boolean, default: true },
    paymentFailed: { type: Boolean, default: true },
    subscriptionExpiring: { type: Boolean, default: true },
    trialEnding: { type: Boolean, default: true }
  },
  analytics: {
    totalValue: { type: Number, default: 0 },
    lifetimeValue: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0 },
    churnRisk: { type: Number, default: 0 }, // 0-100 scale
    lastActivity: { type: Date }
  }
}, { timestamps: true });

// Indexes for efficient queries
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ plan: 1, status: 1 });
subscriptionSchema.index({ 'billing.nextBillingDate': 1 });
subscriptionSchema.index({ 'payment.nextPaymentDate': 1 });
subscriptionSchema.index({ 'analytics.lastActivity': -1 });

// Virtual for subscription age
subscriptionSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.billing.startDate) / (1000 * 60 * 60 * 24));
});

// Virtual for days until next billing
subscriptionSchema.virtual('daysUntilNextBilling').get(function() {
  if (!this.billing.nextBillingDate) return null;
  return Math.ceil((this.billing.nextBillingDate - Date.now()) / (1000 * 60 * 60 * 24));
});

// Virtual for trial status
subscriptionSchema.virtual('isInTrial').get(function() {
  return this.status === 'trialing' && this.billing.trialEndDate && this.billing.trialEndDate > new Date();
});

// Virtual for days left in trial
subscriptionSchema.virtual('trialDaysLeft').get(function() {
  if (!this.isInTrial) return 0;
  return Math.ceil((this.billing.trialEndDate - Date.now()) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Subscription', subscriptionSchema); 