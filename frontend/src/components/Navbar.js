import React, { useState } from 'react';
import { Box, Flex, Text, Button, Spacer, HStack, Menu, MenuButton, MenuList, MenuItem, Avatar, useColorModeValue, IconButton, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, VStack, useDisclosure, useBreakpointValue } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { FaBars, FaTimes } from 'react-icons/fa';

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const MotionBox = motion(Box);
const MotionText = motion(Text);
const MotionMenuList = motion(MenuList);

const menuItemVariants = {
  initial: { y: 0, scale: 1, color: '#4A5568' },
  hover: { scale: 1.08, color: '#5A4BDA', textShadow: '0 2px 8px rgba(90,75,218,0.15)' },
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const glassBg = useColorModeValue(
    'rgba(255,255,255,0.7)',
    'rgba(26,32,44,0.7)'
  );
  const glassBorder = useColorModeValue(
    '1px solid rgba(180, 255, 255, 0.18)',
    '1px solid rgba(49, 151, 149, 0.18)'
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getMenuItems = () => {
    const baseItems = [
      // Hide Home for admin users
      ...(user?.role !== 'admin' ? [{ label: 'Home', to: '/' }] : []),
      // Hide Courses for admin users
      ...(user?.role !== 'admin' ? [{ label: 'Courses', to: '/courses' }] : []),
      // Hide Live Classes for teachers and admin users
      ...(user?.role !== 'teacher' && user?.role !== 'admin' ? [{ label: 'Live Classes', to: '/live-classes' }] : []),
      ...(user ? [
        // Hide Certificates for admin users
        ...(user.role !== 'admin' ? [{ label: 'Certificates', to: '/certificates' }] : []),
        // Hide Achievements for teachers and admin users
        ...(user.role !== 'teacher' && user.role !== 'admin' ? [{ label: 'Achievements', to: '/achievements' }] : []),
        // Hide Personalized for teachers and admin users
        ...(user.role !== 'teacher' && user.role !== 'admin' ? [{ label: 'Personalized', to: '/personalized-dashboard' }] : []),
        ...(user.role === 'teacher' ? [{ label: 'Teacher Dashboard', to: '/teacher/dashboard' }] : []),
      ] : []),
      // Hide Pricing for teachers and admin users
      ...(user?.role !== 'teacher' && user?.role !== 'admin' ? [{ label: 'Pricing', to: '/pricing' }] : []),
      { label: 'Verify Certificate', to: '/certificate/verify' },
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      // Add responsive test link for development
      { label: 'Responsive Test', to: '/responsive-test' },
    ];

    const isStudent = user?.role === 'student';
    const path = location.pathname;
    const onStudentLandingOrDashboard = (path === '/') || (isStudent && path === '/user/dashboard');

    const filtered = onStudentLandingOrDashboard
      ? baseItems.filter(i => !['Personalized', 'Pricing', 'Verify Certificate'].includes(i.label))
      : baseItems;

    return filtered;
  };

  const menuItems = getMenuItems();

  const MobileMenu = () => (
    <Drawer isOpen={isOpen} placement="top" onClose={onClose} size="full">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" color="teal.500" fontWeight="bold">
          Menu
        </DrawerHeader>
        <DrawerBody pt={6}>
          <VStack spacing={4} align="stretch">
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                justifyContent="flex-start"
                size="lg"
                onClick={() => {
                  navigate(item.to);
                  onClose();
                }}
                _hover={{ bg: 'teal.50', color: 'teal.600' }}
              >
                {item.label}
              </Button>
            ))}
            {user ? (
              <VStack spacing={4} pt={4} borderTop="1px solid" borderColor="gray.200">
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  size="lg"
                  onClick={() => {
                    navigate(isAdmin ? "/admin/dashboard" : "/user/dashboard");
                    onClose();
                  }}
                >
                  Dashboard
                </Button>
                {!isAdmin && (
                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    size="lg"
                    onClick={() => {
                      navigate("/profile");
                      onClose();
                    }}
                  >
                    Profile
                  </Button>
                )}
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  size="lg"
                  onClick={() => {
                    handleLogout();
                    onClose();
                  }}
                >
                  Logout
                </Button>
              </VStack>
            ) : (
              <VStack spacing={4} pt={4} borderTop="1px solid" borderColor="gray.200">
                <Button
                  as={RouterLink}
                  to="/login"
                  colorScheme="teal"
                  variant="outline"
                  size="lg"
                  w="full"
                  onClick={onClose}
                >
                  Login
                </Button>
                <Button
                  as={RouterLink}
                  to="/register"
                  colorScheme="teal"
                  size="lg"
                  w="full"
                  onClick={onClose}
                >
                  Register
                </Button>
              </VStack>
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );

  return (
    <MotionBox
      as="nav"
      px={{ base: 4, md: 8 }}
      py={4}
      bg="glass.200"
      backdropFilter="blur(20px)"
      borderBottom="1px solid"
      borderColor="glass.300"
      boxShadow="glass"
      position="sticky"
      top={0}
      zIndex={10}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Flex align="center">
        <MotionText
          fontSize={{ base: 'xl', md: '2xl' }}
          fontWeight="extrabold"
          className="gradient-text"
          cursor="pointer"
          onClick={() => navigate('/')}
          whileHover={{ 
            scale: 1.12, 
            textShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
            filter: 'brightness(1.2)'
          }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          SkillEdge
        </MotionText>
        <Spacer />
        
        {/* Mobile Menu Button */}
        <IconButton
          icon={<FaBars />}
          onClick={onOpen}
          variant="ghost"
          colorScheme="teal"
          size="lg"
          display={{ base: 'flex', md: 'none' }}
          mr={2}
        />

        {/* Desktop Menu */}
        <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
          {menuItems.map((item) => (
            <MotionText
              key={item.label}
              cursor="pointer"
              fontWeight="medium"
              color="gray.700"
              variants={menuItemVariants}
              initial={menuItemVariants.initial}
              whileHover="hover"
              transition={{ type: 'spring', stiffness: 400 }}
              onClick={() => navigate(item.to)}
              position="relative"
               _after={{
                content: '""',
                display: 'block',
                width: '0%',
                height: '2px',
                bg: 'teal.500',
                transition: 'width 0.3s',
                position: 'absolute',
                bottom: -1,
                left: 0,
              }}
              _hover={{
                _after: {
                  width: '100%',
                },
              }}
            >
              {item.label}
            </MotionText>
          ))}
        </HStack>
        <Spacer />
        
        {/* User Menu - Desktop */}
        {user ? (
          <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
            <Menu>
              <MenuButton as={Button} variant="ghost" rightIcon={<Avatar size="sm" name={user.name} />}
                _hover={{ bg: 'teal.50', color: 'teal.500' }}
                _active={{ bg: 'teal.100' }}
              >
                {user.name}
              </MenuButton>
              <AnimatePresence>
                <MotionMenuList
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  as={Box}
                  borderRadius="xl"
                  boxShadow="xl"
                  bg={glassBg}
                  border={glassBorder}
                  style={{ backdropFilter: 'blur(12px)' }}
                >
                  <MenuItem as={RouterLink} to={isAdmin ? "/admin/dashboard" : "/user/dashboard"}>
                    Dashboard
                  </MenuItem>
                  {!isAdmin && (
                    <MenuItem as={RouterLink} to="/profile">Profile</MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </MotionMenuList>
              </AnimatePresence>
            </Menu>
            <NotificationBell />
          </HStack>
        ) : (
          <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
            <Button as={RouterLink} to="/login" colorScheme="teal" variant="outline" mr={3} _hover={{ bg: 'teal.50', color: 'teal.600' }}>Login</Button>
            <Button as={RouterLink} to="/register" colorScheme="teal" _hover={{ bg: 'teal.500', color: 'white' }}>Register</Button>
          </HStack>
        )}
      </Flex>

      {/* Mobile Menu */}
      <MobileMenu />
    </MotionBox>
  );
};

export default Navbar; 