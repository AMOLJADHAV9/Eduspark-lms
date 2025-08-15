const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  type: { 
    type: String, 
    enum: ['subscription', 'one_time', 'refund', 'credit', 'adjustment'],
    required: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'canceled', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  amount: { type: Number, required: true }, // Amount in cents
  currency: { type: String, default: 'USD' },
  description: { type: String, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['stripe', 'paypal', 'razorpay', 'bank_transfer', 'cash', 'credit_card', 'debit_card'],
    required: true
  },
  paymentMethodDetails: {
    type: { type: String }, // 'card', 'bank_account', 'paypal_account'
    last4: { type: String },
    brand: { type: String }, // 'visa', 'mastercard', 'amex', etc.
    expMonth: { type: Number },
    expYear: { type: Number },
    country: { type: String },
    fingerprint: { type: String }
  },
  billing: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    address: {
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String }
    }
  },
  fees: {
    processingFee: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 }
  },
  metadata: {
    stripePaymentIntentId: { type: String },
    paypalPaymentId: { type: String },
    transactionId: { type: String },
    invoiceId: { type: String },
    receiptUrl: { type: String },
    failureReason: { type: String },
    failureCode: { type: String },
    source: { type: String, enum: ['web', 'mobile', 'admin', 'api'] },
    ipAddress: { type: String },
    userAgent: { type: String }
  },
  refunds: [{
    refundId: { type: String, required: true },
    amount: { type: Number, required: true },
    reason: { type: String },
    status: { type: String, enum: ['pending', 'succeeded', 'failed'] },
    processedAt: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed }
  }],
  timeline: [{
    event: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    description: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed }
  }],
  analytics: {
    processingTime: { type: Number }, // Milliseconds
    conversionFunnel: { type: String }, // 'direct', 'organic', 'paid', 'referral'
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    referrer: { type: String },
    deviceType: { type: String },
    browser: { type: String },
    os: { type: String }
  },
  risk: {
    riskScore: { type: Number, default: 0 }, // 0-100 scale
    riskFactors: [{ type: String }],
    flagged: { type: Boolean, default: false },
    reviewed: { type: Boolean, default: false },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    notes: { type: String }
  }
}, { timestamps: true });

// Indexes for efficient queries
paymentSchema.index({ user: 1, status: 1, createdAt: -1 });
paymentSchema.index({ subscription: 1 });
paymentSchema.index({ 'metadata.stripePaymentIntentId': 1 });
paymentSchema.index({ 'metadata.paypalPaymentId': 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Virtual for display amount
paymentSchema.virtual('displayAmount').get(function() {
  const amount = this.amount / 100; // Convert cents to dollars
  const currency = this.currency;
  return `${currency} ${amount.toFixed(2)}`;
});

// Virtual for net amount
paymentSchema.virtual('netAmount').get(function() {
  return this.amount - this.fees.processingFee - this.fees.taxAmount + this.fees.discountAmount - this.fees.refundAmount;
});

// Virtual for payment age
paymentSchema.virtual('ageInMinutes').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60));
});

// Pre-save middleware to update timeline
paymentSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.timeline.push({
      event: `status_changed_to_${this.status}`,
      description: `Payment status changed to ${this.status}`,
      timestamp: new Date()
    });
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema); 