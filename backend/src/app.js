require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { initSocket } = require('./socket');
const app = express();
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/course');
const lectureRoutes = require('./routes/lecture');
const enrollmentRoutes = require('./routes/enrollment');
const progressRoutes = require('./routes/progress');
const adminRoutes = require('./routes/admin');
const liveClassRoutes = require('./routes/liveClass');
const quizRoutes = require('./routes/quiz');
const questionRoutes = require('./routes/question');
const assignmentRoutes = require('./routes/assignment');
const certificateRoutes = require('./routes/certificate');
const forumRoutes = require('./routes/forum');
const gamificationRoutes = require('./routes/gamification');
const personalizationRoutes = require('./routes/personalization');
// Existing routes
const paymentRoutes = require('./routes/payment');
// Add unified payments routes mounting
const paymentsRoutes = require('./routes/payments.routes');
const analyticsRoutes = require('./routes/analytics');
const profileRoutes = require('./routes/profile');
const notificationRoutes = require('./routes/notification');

const parseOrigins = (csv) => (csv || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:3000',
  'https://lms-drab-six.vercel.app'
];

const allowedOrigins = parseOrigins(process.env.CORS_ORIGINS).length
  ? parseOrigins(process.env.CORS_ORIGINS)
  : defaultOrigins;

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow same-network IPs dynamically if wildcard flag is set
    if (process.env.CORS_ALLOW_LAN === 'true') {
      const ipLike = /^https?:\/\/(\d{1,3}\.){3}\d{1,3}(:\d+)?$/;
      if (ipLike.test(origin)) return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple root route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'LMS Backend API is running',
    status: 'success',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      courses: '/api/courses',
      liveClasses: '/api/live-classes',
      quizzes: '/api/quizzes',
      assignments: '/api/assignments'
    }
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/live-classes', liveClassRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api', forumRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/personalization', personalizationRoutes);
app.use('/api/payment', paymentRoutes);
// Mount new payments routes under /api/payments to support the new integration
app.use('/api/payments', paymentsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);

// Public stories endpoint (no auth)
const StudentStory = require('./models/StudentStory');
app.get('/api/public/stories', async (req, res) => {
  try {
    const items = await StudentStory.find({ published: true }).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
