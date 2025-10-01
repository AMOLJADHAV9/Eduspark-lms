const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { auth, adminAuth } = require('../middleware/auth');

// Public routes
router.get('/verify/:verificationCode', certificateController.verifyCertificate);

// Protected routes
router.post('/generate/:courseId', auth, certificateController.generateCertificate);
router.get('/user', auth, certificateController.getUserCertificates);
router.get('/:id', auth, certificateController.getCertificateById);

// Admin routes
router.get('/', adminAuth, certificateController.getAllCertificates);
router.put('/:id', adminAuth, certificateController.updateCertificate);
router.delete('/:id', adminAuth, certificateController.deleteCertificate);
router.get('/stats/overview', adminAuth, certificateController.getCertificateStats);

module.exports = router; 