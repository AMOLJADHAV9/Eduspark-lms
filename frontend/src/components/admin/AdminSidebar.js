import React from 'react';
import ResponsiveSidebar from '../common/ResponsiveSidebar';
import { 
  FaHome, 
  FaUsers, 
  FaBook, 
  FaVideo, 
  FaFileAlt, 
  FaCertificate, 
  FaUserGraduate, 
  FaCreditCard, 
  FaUserTie, 
  FaChartLine,
  FaComments
} from 'react-icons/fa';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: FaHome },
  { to: '/admin/users', label: 'Users', icon: FaUsers },
  { to: '/admin/courses', label: 'Courses', icon: FaBook },
  { to: '/admin/lectures', label: 'Lectures', icon: FaVideo },
  { to: '/admin/assignments', label: 'Assignments', icon: FaFileAlt },
  { to: '/admin/certificates', label: 'Certificates', icon: FaCertificate },
  { to: '/admin/enrollments', label: 'Enrollments', icon: FaUserGraduate },
  { to: '/admin/payments', label: 'Payments', icon: FaCreditCard },
  { to: '/admin/teacher-applications', label: 'Teacher Applications', icon: FaUserTie },
  { to: '/analytics', label: 'Analytics', icon: FaChartLine },
  { to: '/admin/stories', label: 'Student Success Stories', icon: FaComments },
];

const AdminSidebar = ({ isOpen, onToggle, onClose }) => (
  <ResponsiveSidebar
    links={links}
    title="Admin Panel"
    isOpen={isOpen}
    onToggle={onToggle}
    onClose={onClose}
  />
);

export default AdminSidebar; 