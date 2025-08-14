import React from 'react';
import { Box, VStack, Link, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/courses', label: 'Courses' },
  { to: '/admin/lectures', label: 'Lectures' },
  { to: '/admin/quizzes', label: 'Quizzes' },
  { to: '/admin/assignments', label: 'Assignments' },
  { to: '/admin/certificates', label: 'Certificates' },
  { to: '/admin/enrollments', label: 'Enrollments' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/teacher-applications', label: 'Teacher Applications' },
  { to: '/analytics', label: 'Analytics' }, // Added analytics link for admin only
];

const AdminSidebar = () => (
  <Box bg="gray.800" color="white" minH="100vh" w={{ base: 'full', md: 60 }} p={6} shadow="xl">
    <Text fontSize="2xl" fontWeight="bold" mb={8} color="teal.300">Admin Panel</Text>
    <VStack align="stretch" spacing={4}>
      {links.map(link => (
        <Link
          as={NavLink}
          to={link.to}
          key={link.to}
          px={4}
          py={2}
          rounded="md"
          _hover={{ bg: 'teal.600', color: 'white' }}
          _activeLink={{ bg: 'teal.400', color: 'white' }}
          fontWeight="medium"
        >
          {link.label}
        </Link>
      ))}
    </VStack>
  </Box>
);

export default AdminSidebar; 