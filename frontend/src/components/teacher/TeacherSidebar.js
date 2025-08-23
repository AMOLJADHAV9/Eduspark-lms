import React from 'react';
import ResponsiveSidebar from '../common/ResponsiveSidebar';
import { 
  FaHome, 
  FaBook, 
  FaVideo, 
  FaUsers, 
  FaChartLine, 
  FaDollarSign, 
  FaCalendarAlt,
  FaCog,
  FaFileAlt,
  FaComments
} from 'react-icons/fa';

const links = [
  { to: '/teacher/home', label: 'Home', icon: FaHome },
  { to: '/teacher/dashboard', label: 'Dashboard', icon: FaHome },
  { to: '/teacher/courses', label: 'My Courses', icon: FaBook },
  { to: '/teacher/lectures', label: 'Lectures', icon: FaVideo },
  { to: '/teacher/live-classes', label: 'Live Classes', icon: FaCalendarAlt },
  { to: '/teacher/assignments', label: 'Assignments', icon: FaFileAlt },
  { to: '/teacher/students', label: 'Students', icon: FaUsers },
  { to: '/teacher/analytics', label: 'Analytics', icon: FaChartLine },
  { to: '/teacher/earnings', label: 'Earnings', icon: FaDollarSign },
  { to: '/teacher/settings', label: 'Settings', icon: FaCog },
 // { to: '/teacher/profile', label: 'Profile', icon: FaCog },
  { to: '/teacher/stories', label: 'Student Success Stories', icon: FaComments },
];

const TeacherSidebar = ({ isOpen, onToggle, onClose }) => (
  <ResponsiveSidebar 
    links={links}
    title="Teacher Panel"
    isOpen={isOpen}
    onToggle={onToggle}
    onClose={onClose}
    mobileButtonStyle={{ marginTop: '62px' }}
  />
);

export default TeacherSidebar; 