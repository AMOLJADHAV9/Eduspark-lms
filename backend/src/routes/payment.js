const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth, adminAuth } = require('../middleware/auth');

// Payment plans routes
router.get('/plans', paymentController.getPaymentPlans);
router.get('/plans/:planId', paymentController.getPaymentPlanById);

// Subscription routes
router.get('/subscriptions', auth, paymentController.getUserSubscriptions);
router.get('/users/:userId/subscriptions', paymentController.getUserSubscriptions);
router.post('/subscriptions', auth, paymentController.createSubscription);
router.put('/subscriptions/:subscriptionId/cancel', auth, paymentController.cancelSubscription);

// Payment routes
router.get('/payments', auth, paymentController.getUserPayments);
router.post('/payments', auth, paymentController.createPaymentRecord);
router.get('/users/:userId/payments', paymentController.getUserPayments);
router.get('/all/payments', adminAuth, paymentController.getAllPayments);

// Coupon routes
router.post('/coupons/validate', auth, paymentController.validateCoupon);
router.get('/coupons', paymentController.getAvailableCoupons);

// Analytics routes
router.get('/analytics', adminAuth, paymentController.getPaymentAnalytics);

// Admin routes for payment plans
router.post('/plans', adminAuth, paymentController.createPaymentPlan);
router.put('/plans/:planId', adminAuth, paymentController.updatePaymentPlan);
router.delete('/plans/:planId', adminAuth, paymentController.deletePaymentPlan);

// Admin routes for coupons
router.post('/coupons', adminAuth, paymentController.createCoupon);
router.put('/coupons/:couponId', adminAuth, paymentController.updateCoupon);
router.delete('/coupons/:couponId', adminAuth, paymentController.deleteCoupon);

module.exports = router; 