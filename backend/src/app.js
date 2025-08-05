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

app.use(cors({
  origin: [
    'https://lms-frontend.vercel.app',
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'http://localhost:3000' // for development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
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
