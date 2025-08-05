# LMS (Learning Management System)

A comprehensive Learning Management System built with React.js frontend and Node.js backend.

## Features

- User authentication and authorization
- Course management
- Live classes with real-time communication
- Quiz and assignment system
- Progress tracking
- Certificate generation
- Forum discussions
- Analytics dashboard
- Payment integration
- Gamification features

## Tech Stack

### Frontend
- React.js 19.1.0
- Chakra UI for styling
- React Router for navigation
- Framer Motion for animations
- Socket.io for real-time features

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for real-time communication
- bcryptjs for password hashing

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd LMS
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lms
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

## Development

### Start Backend Server
```bash
cd backend
npm run dev
```

### Start Frontend Development Server
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Deployment

### Backend Deployment

1. **Environment Variables**
   Create a `.env` file in the backend directory with production values:
   ```env
   PORT=5000
   MONGO_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-jwt-secret
   NODE_ENV=production
   ```

2. **Deploy to Platform (e.g., Heroku, Railway, Render)**
   ```bash
   cd backend
   npm start
   ```

### Frontend Deployment

1. **Build the application**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Platform (e.g., Netlify, Vercel, GitHub Pages)**
   - Upload the `build` folder contents
   - Set environment variables if needed

### Environment Variables for Frontend

If deploying to a platform that supports environment variables, you may need to set:
- `REACT_APP_API_URL`: Your backend API URL

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course
- `GET /api/courses/:id` - Get course by ID
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Live Classes
- `GET /api/live-classes` - Get all live classes
- `POST /api/live-classes` - Create live class
- `GET /api/live-classes/:id` - Get live class by ID
- `PUT /api/live-classes/:id` - Update live class
- `DELETE /api/live-classes/:id` - Delete live class

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `POST /api/quizzes` - Create quiz
- `GET /api/quizzes/:id` - Get quiz by ID
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz

### Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments/:id` - Get assignment by ID
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

## Database Schema

The application uses MongoDB with the following main collections:
- Users
- Courses
- Lectures
- LiveClasses
- Quizzes
- Assignments
- Enrollments
- Progress
- Certificates
- Forums

## Security Considerations

1. **JWT Secret**: Use a strong, unique JWT secret in production
2. **MongoDB**: Use MongoDB Atlas or secure your MongoDB instance
3. **CORS**: Configure CORS properly for your domain
4. **Environment Variables**: Never commit sensitive data to version control
5. **HTTPS**: Use HTTPS in production

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGO_URI in your .env file
   - Verify network connectivity

2. **Port Already in Use**
   - Change the PORT in your .env file
   - Kill processes using the port

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for version conflicts in package.json

4. **CORS Errors**
   - Ensure the backend CORS configuration matches your frontend domain
   - Check if the API URL is correct

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository or contact the development team. 