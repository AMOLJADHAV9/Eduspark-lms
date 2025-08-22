import React, { useState } from 'react';
import { Box, Flex, Heading, Text, Button, VStack, HStack, useDisclosure, useBreakpointValue } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TeacherSidebar from '../components/teacher/TeacherSidebar';
import AdminSidebar from '../components/admin/AdminSidebar';

const ResponsiveTest = () => {
  const { user } = useAuth();
  const { isOpen: isTeacherOpen, onToggle: onTeacherToggle, onClose: onTeacherClose } = useDisclosure();
  const { isOpen: isAdminOpen, onToggle: onAdminToggle, onClose: onAdminClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box bg="white" minH="100vh">
      <Navbar />
      
      <Box p={8}>
        <Heading mb={6} textAlign="center">Responsive Design Test Page</Heading>
        <Text mb={8} textAlign="center" fontSize="lg" color="gray.600">
          This page demonstrates the responsive sidebar functionality on mobile and desktop
        </Text>

        <VStack spacing={8} align="stretch">
          {/* Teacher Sidebar Test */}
          <Box>
            <Heading size="md" mb={4} color="teal.600">Teacher Sidebar Test</Heading>
            <Text mb={4} color="gray.600">
              {isMobile 
                ? "On mobile: Click the hamburger menu to open the sidebar drawer"
                : "On desktop: Sidebar is always visible on the left"
              }
            </Text>
            
            <Flex minH="400px" bg="gray.50" borderRadius="lg" overflow="hidden">
              <TeacherSidebar 
                isOpen={isTeacherOpen} 
                onToggle={onTeacherToggle} 
                onClose={onTeacherClose} 
              />
              <Box flex={1} p={6}>
                <VStack spacing={4} align="start">
                  <Text fontWeight="bold">Teacher Dashboard Content</Text>
                  <Text>This is the main content area that adjusts based on sidebar visibility.</Text>
                  <Text>On mobile: Content takes full width when sidebar is closed</Text>
                  <Text>On desktop: Content is always positioned next to the sidebar</Text>
                </VStack>
              </Box>
            </Flex>
          </Box>

          {/* Admin Sidebar Test */}
          <Box>
            <Heading size="md" mb={4} color="blue.600">Admin Sidebar Test</Heading>
            <Text mb={4} color="gray.600">
              {isMobile 
                ? "On mobile: Click the hamburger menu to open the sidebar drawer"
                : "On desktop: Sidebar is always visible on the left"
              }
            </Text>
            
            <Flex minH="400px" bg="gray.50" borderRadius="lg" overflow="hidden">
              <AdminSidebar 
                isOpen={isAdminOpen} 
                onToggle={onAdminToggle} 
                onClose={onAdminClose} 
              />
              <Box flex={1} p={6}>
                <VStack spacing={4} align="start">
                  <Text fontWeight="bold">Admin Dashboard Content</Text>
                  <Text>This is the main content area that adjusts based on sidebar visibility.</Text>
                  <Text>On mobile: Content takes full width when sidebar is closed</Text>
                  <Text>On desktop: Content is always positioned next to the sidebar</Text>
                </VStack>
              </Box>
            </Flex>
          </Box>

          {/* Responsive Features Summary */}
          <Box bg="teal.50" p={6} borderRadius="lg" border="1px solid" borderColor="teal.200">
            <Heading size="md" mb={4} color="teal.700">Responsive Features Implemented</Heading>
            <VStack spacing={3} align="start">
              <Text color="teal.700">✅ Mobile-first responsive design</Text>
              <Text color="teal.700">✅ Collapsible sidebars on mobile with drawer navigation</Text>
              <Text color="teal.700">✅ Always-visible sidebars on desktop</Text>
              <Text color="teal.700">✅ Responsive navbar with mobile menu</Text>
              <Text color="teal.700">✅ Mobile-optimized landing page with prominent Get Started button</Text>
              <Text color="teal.700">✅ Responsive grid layouts for different screen sizes</Text>
              <Text color="teal.700">✅ Touch-friendly mobile interactions</Text>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default ResponsiveTest;
