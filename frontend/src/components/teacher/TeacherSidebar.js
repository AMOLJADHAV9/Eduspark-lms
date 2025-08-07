import React from 'react';
import { Box, VStack, Link, Text, Divider } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
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
  { to: '/teacher/dashboard', label: 'Dashboard', icon: FaHome },
  { to: '/teacher/courses', label: 'My Courses', icon: FaBook },
  { to: '/teacher/lectures', label: 'Lectures', icon: FaVideo },
  { to: '/teacher/live-classes', label: 'Live Classes', icon: FaCalendarAlt },
  { to: '/teacher/assignments', label: 'Assignments', icon: FaFileAlt },
  { to: '/teacher/quizzes', label: 'Quizzes', icon: FaComments },
  { to: '/teacher/students', label: 'Students', icon: FaUsers },
  { to: '/teacher/analytics', label: 'Analytics', icon: FaChartLine },
  { to: '/teacher/earnings', label: 'Earnings', icon: FaDollarSign },
  { to: '/teacher/settings', label: 'Settings', icon: FaCog },
  { to: '/teacher/profile', label: 'Profile', icon: FaCog },
];

const TeacherSidebar = () => (
  <Box bg="gray.800" color="white" minH="100vh" w={{ base: 'full', md: 64 }} p={6} shadow="xl">
    <Text fontSize="2xl" fontWeight="bold" mb={8} color="teal.300">Teacher Panel</Text>
    <VStack align="stretch" spacing={2}>
      {links.map(link => {
        const IconComponent = link.icon;
        return (
          <Link
            as={NavLink}
            to={link.to}
            key={link.to}
            px={4}
            py={3}
            rounded="md"
            _hover={{ bg: 'teal.600', color: 'white' }}
            _activeLink={{ bg: 'teal.400', color: 'white' }}
            fontWeight="medium"
            display="flex"
            alignItems="center"
            gap={3}
          >
            <IconComponent />
            {link.label}
          </Link>
        );
      })}
    </VStack>
  </Box>
);

export default TeacherSidebar; 