const express = require('express');
const router = express.Router();
const liveClassController = require('../controllers/liveClassController');
const { auth, adminAuth } = require('../middleware/auth');
const crypto = require('crypto');

// Teacher-specific routes (must come before /:id routes)
router.get('/teacher', auth, liveClassController.getTeacherLiveClasses);
router.post('/teacher', auth, liveClassController.createTeacherLiveClass);
router.put('/teacher/:id', auth, liveClassController.updateTeacherLiveClass);
router.delete('/teacher/:id', auth, liveClassController.deleteTeacherLiveClass);


// Public routes (for viewing)
router.get('/', liveClassController.getLiveClasses);
router.get('/:id', liveClassController.getLiveClassById);

// Protected routes
router.post('/', auth, liveClassController.createLiveClass);
router.put('/:id', auth, liveClassController.updateLiveClass);
router.delete('/:id', auth, liveClassController.deleteLiveClass);

// Live class actions
router.post('/:id/join', auth, liveClassController.joinLiveClass);
router.post('/:id/start', auth, liveClassController.startLiveClass);
router.post('/:id/end', auth, liveClassController.endLiveClass);

// ZEGOCLOUD: issue kit token for a given live class and user
router.post('/:id/zego-token', auth, async (req, res) => {
  try {
    const LiveClass = require('../models/LiveClass');
    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) return res.status(404).json({ message: 'Live class not found' });

    if (liveClass.streamingPlatform !== 'zego') {
      return res.status(400).json({ message: 'Zego is not enabled for this class' });
    }

    const appID = parseInt(process.env.ZEGO_APP_ID || '0', 10);
    const serverSecret = process.env.ZEGO_SERVER_SECRET;
    if (!appID || !serverSecret) {
      return res.status(500).json({ message: 'Zego credentials not configured on server' });
    }

    const userId = req.user.id;
    const userName = req.user.name || 'User';
    const roomId = liveClass.zegoRoomId || liveClass._id.toString();

    // Minimal JWT generation for Zego "token for test" equivalent
    const now = Math.floor(Date.now() / 1000);
    const expire = now + 60 * 60 * 2; // 2 hours
    const payload = {
      app_id: appID,
      user_id: userId,
      nonce: crypto.randomBytes(8).toString('hex'),
      ctime: now,
      expire,
      payload: {
        room_id: roomId,
        privileges: { 1: 1, 2: 1 }
      }
    };

    const header = { alg: 'HS256', typ: 'JWT' };
    const base64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const unsigned = base64url(header) + '.' + base64url(payload);
    const signature = crypto
      .createHmac('sha256', serverSecret)
      .update(unsigned)
      .digest('base64url');
    const token = unsigned + '.' + signature;

    res.json({ token, appID, roomId, userId, userName });
  } catch (e) {
    res.status(500).json({ message: 'Failed to create Zego token', error: e.message });
  }
});

// Real-time features
router.post('/:id/chat', auth, liveClassController.addChatMessage);
router.put('/:id/whiteboard', auth, liveClassController.updateWhiteboard);

// Analytics
router.get('/:id/analytics', auth, liveClassController.getLiveClassAnalytics);

module.exports = router; 