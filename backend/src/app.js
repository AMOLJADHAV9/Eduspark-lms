require('dotenv').config();
const express = require('express');
const cors = require('cors');
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
const paymentRoutes = require('./routes/payment');
const analyticsRoutes = require('./routes/analytics');
const profileRoutes = require('./routes/profile');

app.use(cors({
  origin: [
    'https://lms-drab-six.vercel.app', // Vercel frontend
    'http://localhost:3000' // local dev
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());

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
app.use('/api/analytics', analyticsRoutes);
app.use('/api/profile', profileRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
