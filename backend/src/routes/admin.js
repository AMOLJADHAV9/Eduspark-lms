const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { getAllApplications, reviewApplication } = require('../controllers/teacherApplicationController');
const { adminAuth } = require('../middleware/auth');

router.get('/users', adminAuth, adminController.getAllUsers);
router.put('/users/:id/role', adminAuth, adminController.updateUserRole);
router.delete('/users/:id', adminAuth, adminController.deleteUser);
router.get('/stats', adminAuth, adminController.getStats);

// Teacher application routes
router.get('/teacher-applications', adminAuth, getAllApplications);
router.put('/teacher-applications/:applicationId/review', adminAuth, reviewApplication);

module.exports = router; 