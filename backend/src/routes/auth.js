const express = require('express');
const router = express.Router();
const { register, login, updateRole } = require('../controllers/authController');
const { adminLogin } = require('../controllers/adminAuthController');
const { submitApplication, getUserApplication } = require('../controllers/teacherApplicationController');
const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);

// Teacher application routes
router.post('/teacher-application', auth, submitApplication);
router.get('/teacher-application', auth, getUserApplication);

// Update user role
router.put('/update-role', auth, updateRole);

module.exports = router; 