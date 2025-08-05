const PaymentPlan = require('../models/PaymentPlan');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const Course = require('../models/Course');

// Get all payment plans
exports.getPaymentPlans = async (req, res) => {
  try {
    const { type, status = 'active', isPopular, isRecommended } = req.query;
    
    const filter = { status };
    if (type) filter.type = type;
    if (isPopular !== undefined) filter.isPopular = isPopular;
    if (isRecommended !== undefined) filter.isRecommended = isRecommended;

    const plans = await PaymentPlan.find(filter)
      .sort({ sortOrder: 1, 'pricing.amount': 1 });

    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payment plan by ID
exports.getPaymentPlanById = async (req, res) => {
  try {
    const { planId } = req.params;
    
    const plan = await PaymentPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Payment plan not found' });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's subscriptions
exports.getUserSubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;
    const { status } = req.query;

    const filter = { user: targetUserId };
    if (status) filter.status = status;

    const subscriptions = await Subscription.find(filter)
      .populate('plan')
      .sort({ createdAt: -1 });

    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create subscription
exports.createSubscription = async (req, res) => {
  try {
    const { planId, paymentMethod, couponCode } = req.body;

    // Get the payment plan
    const plan = await PaymentPlan.findById(planId);
    if (!plan || plan.status !== 'active') {
      return res.status(404).json({ message: 'Payment plan not found' });
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      user: req.user.id,
      status: { $in: ['active', 'trialing'] }
    });

    if (existingSubscription) {
      return res.status(400).json({ message: 'You already have an active subscription' });
    }

    // Validate coupon if provided
    let discountAmount = 0;
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        const validation = coupon.canBeUsedBy(req.user, plan.pricing.amount);
        if (!validation.valid) {
          return res.status(400).json({ message: validation.reason });
        }
        discountAmount = coupon.calculateDiscount(plan.pricing.amount);
      }
    }

    // Calculate final amount
    const finalAmount = plan.pricing.amount - discountAmount;

    // Create subscription
    const subscription = await Subscription.create({
      user: req.user.id,
      plan: planId,
      status: plan.pricing.trialDays > 0 ? 'trialing' : 'active',
      billing: {
        startDate: new Date(),
        nextBillingDate: plan.pricing.trialDays > 0 
          ? new Date(Date.now() + plan.pricing.trialDays * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to monthly
        trialEndDate: plan.pricing.trialDays > 0 
          ? new Date(Date.now() + plan.pricing.trialDays * 24 * 60 * 60 * 1000)
          : null
      },
      payment: {
        amount: finalAmount,
        currency: plan.pricing.currency,
        interval: plan.pricing.interval,
        paymentMethod
      },
      features: {
        activeFeatures: plan.features.filter(f => f.isIncluded).map(f => f.name),
        limits: plan.limits
      },
      discounts: coupon ? [{
        type: 'coupon',
        code: coupon.code,
        percentage: coupon.type === 'percentage' ? coupon.discount.percentage : null,
        amount: discountAmount,
        appliedAt: new Date()
      }] : []
    });

    // Create payment record
    const payment = await Payment.create({
      user: req.user.id,
      subscription: subscription._id,
      type: 'subscription',
      status: 'completed',
      amount: finalAmount,
      currency: plan.pricing.currency,
      description: `Subscription to ${plan.name}`,
      paymentMethod,
      metadata: {
        source: 'web'
      }
    });

    // Update coupon usage if applicable
    if (coupon) {
      coupon.usage.currentUses += 1;
      coupon.usage.usedBy.push({
        user: req.user.id,
        orderId: subscription._id,
        amount: discountAmount
      });
      await coupon.save();
    }

    // Update plan metadata
    plan.metadata.totalSubscribers += 1;
    plan.metadata.totalRevenue += finalAmount;
    await plan.save();

    await subscription.populate('plan');
    res.status(201).json(subscription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { cancelAtPeriodEnd = true } = req.body;

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      user: req.user.id
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.status === 'canceled') {
      return res.status(400).json({ message: 'Subscription is already canceled' });
    }

    if (cancelAtPeriodEnd) {
      subscription.billing.cancelAtPeriodEnd = true;
      subscription.billing.canceledAt = new Date();
    } else {
      subscription.status = 'canceled';
      subscription.billing.canceledAt = new Date();
    }

    await subscription.save();
    await subscription.populate('plan');

    res.json(subscription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user's payments
exports.getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;
    const { status, type, page = 1, limit = 20 } = req.query;

    const filter = { user: targetUserId };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const skip = (page - 1) * limit;

    const payments = await Payment.find(filter)
      .populate('subscription')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Validate coupon
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount = 0 } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const validation = coupon.canBeUsedBy(req.user, orderAmount);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.reason });
    }

    const discountAmount = coupon.calculateDiscount(orderAmount);

    res.json({
      coupon: {
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        discount: coupon.discount
      },
      discountAmount,
      finalAmount: orderAmount - discountAmount
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get available coupons
exports.getAvailableCoupons = async (req, res) => {
  try {
    const { userType, category } = req.query;

    const filter = { 'validity.isActive': true };
    if (userType) filter['restrictions.userTypes'] = userType;
    if (category) filter['discount.appliesTo'] = category;

    const coupons = await Coupon.find(filter)
      .select('code name description type discount validity usage')
      .sort({ 'validity.endDate': 1 });

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create payment plan (admin only)
exports.createPaymentPlan = async (req, res) => {
  try {
    const planData = req.body;
    
    const plan = await PaymentPlan.create(planData);
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update payment plan (admin only)
exports.updatePaymentPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const updateData = req.body;

    const plan = await PaymentPlan.findByIdAndUpdate(
      planId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({ message: 'Payment plan not found' });
    }

    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete payment plan (admin only)
exports.deletePaymentPlan = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await PaymentPlan.findByIdAndDelete(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Payment plan not found' });
    }

    res.json({ message: 'Payment plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create coupon (admin only)
exports.createCoupon = async (req, res) => {
  try {
    const couponData = req.body;
    
    const coupon = await Coupon.create(couponData);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update coupon (admin only)
exports.updateCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const updateData = req.body;

    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete coupon (admin only)
exports.deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;

    const coupon = await Coupon.findByIdAndDelete(couponId);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payment analytics
exports.getPaymentAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    else if (period === '1y') startDate.setFullYear(startDate.getFullYear() - 1);

    // Get revenue analytics
    const revenueStats = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalPayments: { $sum: 1 },
          averagePayment: { $avg: '$amount' }
        }
      }
    ]);

    // Get subscription analytics
    const subscriptionStats = await Subscription.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get plan popularity
    const planStats = await Subscription.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $lookup: {
          from: 'paymentplans',
          localField: 'plan',
          foreignField: '_id',
          as: 'planData'
        }
      },
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
          planName: { $first: '$planData.name' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      revenue: revenueStats[0] || { totalRevenue: 0, totalPayments: 0, averagePayment: 0 },
      subscriptions: subscriptionStats,
      popularPlans: planStats,
      period
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 