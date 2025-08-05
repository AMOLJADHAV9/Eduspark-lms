const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['percentage', 'fixed_amount', 'free_shipping', 'free_trial', 'lifetime_discount'],
    required: true
  },
  discount: {
    percentage: { type: Number, min: 0, max: 100 }, // For percentage discounts
    amount: { type: Number, min: 0 }, // For fixed amount discounts (in cents)
    minimumPurchase: { type: Number, default: 0 }, // Minimum purchase amount (in cents)
    maximumDiscount: { type: Number }, // Maximum discount amount (in cents)
    appliesTo: { 
      type: String, 
      enum: ['all', 'subscriptions', 'courses', 'bundles', 'specific_products'],
      default: 'all'
    },
    excludedProducts: [{ type: mongoose.Schema.Types.ObjectId }],
    includedProducts: [{ type: mongoose.Schema.Types.ObjectId }]
  },
  validity: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    timeRestrictions: {
      validDays: [{ type: String }], // ['monday', 'tuesday', etc.]
      validHours: {
        start: { type: String }, // '09:00'
        end: { type: String } // '17:00'
      }
    }
  },
  usage: {
    maxUses: { type: Number, default: -1 }, // -1 for unlimited
    currentUses: { type: Number, default: 0 },
    maxUsesPerUser: { type: Number, default: 1 },
    maxUsesPerCode: { type: Number, default: 1 },
    usedBy: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      usedAt: { type: Date, default: Date.now },
      orderId: { type: mongoose.Schema.Types.ObjectId },
      amount: { type: Number }
    }]
  },
  restrictions: {
    userTypes: [{ type: String }], // ['new', 'existing', 'vip', 'student']
    userGroups: [{ type: String }], // ['students', 'teachers', 'enterprise']
    countries: [{ type: String }],
    excludedCountries: [{ type: String }],
    minimumAge: { type: Number },
    maximumAge: { type: Number },
    requiredFields: [{ type: String }], // ['email', 'phone', 'address']
    excludedEmailDomains: [{ type: String }],
    includedEmailDomains: [{ type: String }]
  },
  affiliate: {
    isAffiliateCode: { type: Boolean, default: false },
    affiliateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    commissionRate: { type: Number, default: 0 }, // Percentage
    trackingCode: { type: String },
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String }
  },
  analytics: {
    totalRevenue: { type: Number, default: 0 },
    totalDiscounts: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    topProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    topUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  metadata: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    campaign: { type: String },
    source: { type: String, enum: ['admin', 'api', 'affiliate', 'system'] },
    notes: { type: String },
    tags: [{ type: String }]
  }
}, { timestamps: true });

// Indexes for efficient queries
couponSchema.index({ code: 1 });
couponSchema.index({ 'validity.isActive': 1, 'validity.endDate': 1 });
couponSchema.index({ 'affiliate.isAffiliateCode': 1 });
couponSchema.index({ 'usage.currentUses': 1, 'usage.maxUses': 1 });

// Virtual for validity status
couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.validity.isActive && 
         this.validity.startDate <= now && 
         this.validity.endDate >= now &&
         (this.usage.maxUses === -1 || this.usage.currentUses < this.usage.maxUses);
});

// Virtual for days until expiry
couponSchema.virtual('daysUntilExpiry').get(function() {
  return Math.ceil((this.validity.endDate - Date.now()) / (1000 * 60 * 60 * 24));
});

// Virtual for usage percentage
couponSchema.virtual('usagePercentage').get(function() {
  if (this.usage.maxUses === -1) return 0;
  return Math.round((this.usage.currentUses / this.usage.maxUses) * 100);
});

// Method to check if user can use coupon
couponSchema.methods.canBeUsedBy = function(user, orderAmount = 0) {
  // Check if coupon is valid
  if (!this.isValid) return { valid: false, reason: 'Coupon is not valid' };

  // Check minimum purchase amount
  if (orderAmount < this.discount.minimumPurchase) {
    return { 
      valid: false, 
      reason: `Minimum purchase amount of ${this.discount.minimumPurchase / 100} required` 
    };
  }

  // Check if user has already used this coupon
  const userUsage = this.usage.usedBy.filter(usage => 
    usage.user.toString() === user._id.toString()
  ).length;

  if (userUsage >= this.usage.maxUsesPerUser) {
    return { valid: false, reason: 'You have already used this coupon' };
  }

  // Check user type restrictions
  if (this.restrictions.userTypes.length > 0) {
    const userType = user.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 'new' : 'existing';
    if (!this.restrictions.userTypes.includes(userType)) {
      return { valid: false, reason: 'Coupon not available for your user type' };
    }
  }

  // Check country restrictions
  if (this.restrictions.countries.length > 0) {
    // This would need user's country information
    // if (!this.restrictions.countries.includes(user.country)) {
    //   return { valid: false, reason: 'Coupon not available in your country' };
    // }
  }

  return { valid: true };
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(orderAmount) {
  let discountAmount = 0;

  if (this.type === 'percentage') {
    discountAmount = (orderAmount * this.discount.percentage) / 100;
  } else if (this.type === 'fixed_amount') {
    discountAmount = this.discount.amount;
  }

  // Apply maximum discount limit
  if (this.discount.maximumDiscount && discountAmount > this.discount.maximumDiscount) {
    discountAmount = this.discount.maximumDiscount;
  }

  return Math.min(discountAmount, orderAmount);
};

module.exports = mongoose.model('Coupon', couponSchema); 