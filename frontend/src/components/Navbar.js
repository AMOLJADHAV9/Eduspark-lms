import React from 'react';
import { Box, Flex, Text, Button, Spacer, HStack, Menu, MenuButton, MenuList, MenuItem, Avatar, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

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
  hover: { scale: 1.08, color: '#319795', textShadow: '0 2px 8px rgba(49,151,149,0.15)' },
};

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
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

  return (
    <MotionBox
      as="nav"
      px={8}
      py={4}
      bg={glassBg}
      shadow="lg"
      position="sticky"
      top={0}
      zIndex={10}
      borderBottom={glassBorder}
      style={{ backdropFilter: 'blur(16px)' }}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Flex align="center">
        <MotionText
          fontSize="2xl"
          fontWeight="bold"
          color="teal.500"
          cursor="pointer"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.12, color: '#38B2AC', textShadow: '0 2px 16px rgba(56,178,172,0.25)' }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          LMS
        </MotionText>
        <Spacer />
        <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
          {[
            { label: 'Home', to: '/' },
            { label: 'Courses', to: '/courses' },
            { label: 'Live Classes', to: '/live-classes' },
            ...(user ? [
              { label: 'Certificates', to: '/certificates' },
              { label: 'Achievements', to: '/achievements' },
              { label: 'Personalized', to: '/personalized-dashboard' },
              ...(user.role === 'teacher' ? [{ label: 'Teacher Dashboard', to: '/teacher/dashboard' }] : []),
            ] : []),
            { label: 'Pricing', to: '/pricing' },
            { label: 'Verify Certificate', to: '/certificate/verify' },
            { label: 'About', to: '/about' },
            { label: 'Contact', to: '/contact' },
          ].map((item) => (
            <MotionText
              key={item.label}
              cursor="pointer"
              fontWeight="medium"
              color="gray.700"
              variants={menuItemVariants}
              initial="initial"
              whileHover="hover"
              transition={{ type: 'spring', stiffness: 400 }}
              onClick={() => navigate(item.to)}
              position="relative"
              _after={{
                content: '""',
                display: 'block',
                width: '0%',
                height: '2px',
                bg: 'teal.400',
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
        {user ? (
          <HStack spacing={4}>
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
          </HStack>
        ) : (
          <>
            <Button as={RouterLink} to="/login" colorScheme="teal" variant="outline" mr={3} _hover={{ bg: 'teal.50', color: 'teal.500' }}>Login</Button>
            <Button as={RouterLink} to="/register" colorScheme="teal" _hover={{ bg: 'teal.400', color: 'white' }}>Register</Button>
          </>
        )}
      </Flex>
    </MotionBox>
  );
};

export default Navbar; 