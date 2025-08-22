const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { getAllApplications, reviewApplication } = require('../controllers/teacherApplicationController');
const { adminAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const StudentStory = require('../models/StudentStory');

router.get('/users', adminAuth, adminController.getAllUsers);
router.put('/users/:id/role', adminAuth, adminController.updateUserRole);
router.delete('/users/:id', adminAuth, adminController.deleteUser);
router.get('/stats', adminAuth, adminController.getStats);

// Student stories upload and CRUD
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'stories');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

router.post('/stories', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, story, published = 'true' } = req.body;
    const imagePath = req.file ? `/uploads/stories/${req.file.filename}` : undefined;
    const doc = await StudentStory.create({ name, story, imagePath, published: published === 'true' });
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/stories', adminAuth, async (req, res) => {
  const items = await StudentStory.find().sort({ createdAt: -1 });
  res.json(items);
});

router.delete('/stories/:id', adminAuth, async (req, res) => {
  await StudentStory.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Teacher application routes
router.get('/teacher-applications', adminAuth, getAllApplications);
router.put('/teacher-applications/:applicationId/review', adminAuth, reviewApplication);

module.exports = router; 