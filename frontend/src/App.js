import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { customTheme } from './theme';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCourses from './pages/admin/Courses';
import AdminLectures from './pages/admin/Lectures';
import AdminEnrollments from './pages/admin/Enrollments';
import AdminPayments from './pages/admin/Payments';
import UserDashboard from './pages/UserDashboard';
import Landing from './pages/Landing';
import CourseDetail from './pages/CourseDetail';
import CourseLearning from './pages/CourseLearning';
import About from './pages/About';
import Contact from './pages/Contact';
import Courses from './pages/Courses';
import LiveClasses from './pages/LiveClasses';
import LiveClassRoom from './pages/LiveClassRoom';
import QuizCreate from './pages/QuizCreate';
import QuizTake from './pages/QuizTake';
import CourseQuizzes from './pages/CourseQuizzes';
import AdminQuizzes from './pages/admin/Quizzes';
import AssignmentCreate from './pages/AssignmentCreate';
import AssignmentSubmit from './pages/AssignmentSubmit';
import CourseAssignments from './pages/CourseAssignments';
import AdminAssignments from './pages/admin/Assignments';
import AdminCertificates from './pages/admin/Certificates';
import CourseForums from './pages/CourseForums';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AuthProvider from './context/AuthContext';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherCourses from './pages/teacher/Courses';
import TeacherLectures from './pages/teacher/Lectures';
import TeacherLiveClasses from './pages/teacher/LiveClasses';
import TeacherAssignments from './pages/teacher/Assignments';
import TeacherQuizzes from './pages/teacher/Quizzes';
import TeacherStudents from './pages/teacher/Students';
import TeacherAnalytics from './pages/teacher/Analytics';
import TeacherEarnings from './pages/teacher/Earnings';
import TeacherSettings from './pages/teacher/Settings';
import TeacherProfile from './pages/teacher/Profile';
import TeacherStories from './pages/teacher/Stories';
import RoleSelection from './pages/RoleSelection';
import TeacherApplications from './pages/admin/TeacherApplications';
import StudentProfile from './pages/Profile';
import Notifications from './pages/Notifications';
import Home from './pages/teacher/Home';
import Room from './pages/teacher/Room';

function App() {
  return (
    <ErrorBoundary>
      <ChakraProvider theme={customTheme}>
        <AuthProvider>
          <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/lectures" element={<AdminLectures />} />
            <Route path="/admin/enrollments" element={<AdminEnrollments />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/course/:id/learn" element={<CourseLearning />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/courses" element={<Courses />} />
          <Route path="/live-classes" element={<LiveClasses />} />
          <Route path="/live-class/:id" element={<LiveClassRoom />} />
          <Route path="/quiz/create" element={<QuizCreate />} />
          <Route path="/quiz/:id" element={<QuizTake />} />
          <Route path="/course/:courseId/quizzes" element={<CourseQuizzes />} />
          <Route path="/admin/quizzes" element={<AdminQuizzes />} />
          <Route path="/assignment/create" element={<AssignmentCreate />} />
          <Route path="/assignment/:id/submit" element={<AssignmentSubmit />} />
          <Route path="/course/:courseId/assignments" element={<CourseAssignments />} />
          <Route path="/admin/assignments" element={<AdminAssignments />} />
          <Route path="/admin/certificates" element={<AdminCertificates />} />
          <Route path="/course/:courseId/forums" element={<CourseForums />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/courses" element={<TeacherCourses />} />
          <Route path="/teacher/lectures" element={<TeacherLectures />} />
          <Route path="/teacher/live-classes" element={<TeacherLiveClasses />} />
          <Route path="/room/:id" element={<Room />} />
          <Route path="/teacher/room/:id" element={<Room />} />
          <Route path="/home" element={<Home />} />
          <Route path="/teacher/home" element={<Home />} />

          <Route path="/teacher/assignments" element={<TeacherAssignments />} />
          <Route path="/teacher/quizzes" element={<TeacherQuizzes />} />
          <Route path="/teacher/students" element={<TeacherStudents />} />
          <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
          <Route path="/teacher/earnings" element={<TeacherEarnings />} />
          <Route path="/teacher/settings" element={<TeacherSettings />} />
          <Route path="/teacher/stories" element={<TeacherStories />} />
          <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/admin/teacher-applications" element={<TeacherApplications />} />
            <Route path="/teacher/profile" element={<TeacherProfile />} />
            <Route path="/profile" element={<StudentProfile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
    </ErrorBoundary>
  );
}

export default App;
