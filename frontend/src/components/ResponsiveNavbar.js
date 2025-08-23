import React, { useState } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  Spacer, 
  HStack, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  Avatar, 
  useColorModeValue, 
  IconButton, 
  Drawer, 
  DrawerBody, 
  DrawerHeader, 
  DrawerOverlay, 
  DrawerContent, 
  DrawerCloseButton, 
  VStack, 
  useDisclosure, 
  useBreakpointValue,
  Input,
  InputGroup,
  InputLeftElement,
  Divider,
  useToast
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { 
  FaBars, 
  FaSearch, 
  FaHome, 
  FaBook, 
  FaVideo, 
  FaUser, 
  FaSignOutAlt,
  FaDashboard
} from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionText = motion(Text);

const ResponsiveNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isTeacher } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useBreakpointValue({ base: true, md: false });
  const toast = useToast();
  
  const glassBg = useColorModeValue(
    'rgba(255,255,255,0.95)',
    'rgba(26,32,44,0.95)'
  );

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: "Logged out successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchTerm.trim())}`);
      onClose();
    }
  };

  const getMenuItems = () => {
    const baseItems = [
      ...(user?.role !== 'admin' ? [{ label: 'Home', to: '/', icon: FaHome }] : []),
      ...(user?.role !== 'admin' ? [{ label: 'Courses', to: '/courses', icon: FaBook }] : []),
      ...(user?.role !== 'teacher' && user?.role !== 'admin' ? [{ label: 'Live Classes', to: '/live-classes', icon: FaVideo }] : []),
      ...(user ? [
        ...(user.role === 'teacher' ? [{ label: 'Teacher Dashboard', to: '/teacher/dashboard', icon: FaDashboard }] : []),
      ] : []),
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
    ];

    return baseItems;
  };

  const menuItems = getMenuItems();

  const MobileMenu = () => (
    <Drawer isOpen={isOpen} placement="top" onClose={onClose} size="full">
      <DrawerOverlay />
      <DrawerContent bg={glassBg} backdropFilter="blur(20px)">
        <DrawerCloseButton size="lg" color="teal.500" />
        <DrawerHeader borderBottomWidth="1px" color="teal.500" fontWeight="bold" fontSize="xl">
          Menu
        </DrawerHeader>
        <DrawerBody pt={6}>
          <VStack spacing={4} align="stretch">
            {/* Search Bar */}
            <Box mb={4}>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <FaSearch color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  bg="white"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'teal.500' }}
                />
              </InputGroup>
              <Button
                mt={2}
                colorScheme="teal"
                size="sm"
                w="full"
                onClick={handleSearch}
              >
                Search
              </Button>
            </Box>

            <Divider />

            {/* Navigation Items */}
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                justifyContent="flex-start"
                size="lg"
                leftIcon={item.icon ? <item.icon /> : undefined}
                onClick={() => {
                  navigate(item.to);
                  onClose();
                }}
                _hover={{ bg: 'teal.50', color: 'teal.600' }}
                borderRadius="lg"
                h="56px"
              >
                {item.label}
              </Button>
            ))}

            <Divider />

            {/* User Actions */}
            {user ? (
              <VStack spacing={4} pt={4}>
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  size="lg"
                  leftIcon={<FaDashboard />}
                  onClick={() => {
                    navigate(isAdmin ? "/admin/dashboard" : isTeacher ? "/teacher/dashboard" : "/user/dashboard");
                    onClose();
                  }}
                  w="full"
                  h="56px"
                  borderRadius="lg"
                >
                  Dashboard
                </Button>
                {!isAdmin && (
                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    size="lg"
                    leftIcon={<FaUser />}
                    onClick={() => {
                      navigate("/profile");
                      onClose();
                    }}
                    w="full"
                    h="56px"
                    borderRadius="lg"
                  >
                    Profile
                  </Button>
                )}
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  size="lg"
                  leftIcon={<FaSignOutAlt />}
                  onClick={() => {
                    handleLogout();
                    onClose();
                  }}
                  w="full"
                  h="56px"
                  borderRadius="lg"
                  color="red.500"
                  _hover={{ bg: 'red.50', color: 'red.600' }}
                >
                  Logout
                </Button>
              </VStack>
            ) : (
              <VStack spacing={4} pt={4}>
                <Button
                  as={RouterLink}
                  to="/login"
                  colorScheme="teal"
                  variant="outline"
                  size="lg"
                  w="full"
                  onClick={onClose}
                  h="56px"
                  borderRadius="lg"
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
                  h="56px"
                  borderRadius="lg"
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
      px={{ base: 3, md: 6, lg: 8 }}
      py={{ base: 3, md: 4 }}
      bg={glassBg}
      backdropFilter="blur(20px)"
      borderBottom="1px solid"
      borderColor="glass.300"
      boxShadow="glass"
      position="sticky"
      top={0}
      zIndex={1000}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Flex align="center" maxW="7xl" mx="auto">
        {/* Logo */}
        <MotionText
          fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
          fontWeight="extrabold"
          className="gradient-text"
          cursor="pointer"
          onClick={() => navigate('/')}
          whileHover={{ 
            scale: 1.05, 
            textShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
            filter: 'brightness(1.2)'
          }}
          transition={{ type: 'spring', stiffness: 300 }}
          flexShrink={0}
        >
          SkillEdge
        </MotionText>

        <Spacer />

        {/* Desktop Search Bar */}
        {!isMobile && (
          <Box flex={1} maxW="400px" mx={6}>
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none">
                <FaSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                bg="white"
                borderColor="gray.200"
                _focus={{ borderColor: 'teal.500' }}
              />
            </InputGroup>
          </Box>
        )}

        {/* Desktop Menu */}
        {!isMobile && (
          <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
            {menuItems.slice(0, 4).map((item) => (
              <MotionText
                key={item.label}
                cursor="pointer"
                fontWeight="medium"
                color="gray.700"
                fontSize="sm"
                whileHover={{ scale: 1.08, color: '#5A4BDA' }}
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
        )}

        <Spacer />

        {/* User Menu - Desktop */}
        {user ? (
          <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
            <NotificationBell />
            <Menu>
              <MenuButton 
                as={Button} 
                variant="ghost" 
                rightIcon={<Avatar size="sm" name={user.name} />}
                _hover={{ bg: 'teal.50', color: 'teal.500' }}
                _active={{ bg: 'teal.100' }}
                size="md"
              >
                <Text display={{ base: 'none', lg: 'block' }}>{user.name}</Text>
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to={isAdmin ? "/admin/dashboard" : isTeacher ? "/teacher/dashboard" : "/user/dashboard"}>
                  <FaDashboard style={{ marginRight: '8px' }} />
                  Dashboard
                </MenuItem>
                {!isAdmin && (
                  <MenuItem as={RouterLink} to="/profile">
                    <FaUser style={{ marginRight: '8px' }} />
                    Profile
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout} color="red.500">
                  <FaSignOutAlt style={{ marginRight: '8px' }} />
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        ) : (
          <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
            <Button 
              as={RouterLink} 
              to="/login" 
              colorScheme="teal" 
              variant="outline" 
              size="md"
              _hover={{ bg: 'teal.50', color: 'teal.600' }}
            >
              Login
            </Button>
            <Button 
              as={RouterLink} 
              to="/register" 
              colorScheme="teal" 
              size="md"
              _hover={{ bg: 'teal.500', color: 'white' }}
            >
              Register
            </Button>
          </HStack>
        )}

        {/* Mobile Menu Button */}
        <IconButton
          icon={<FaBars />}
          onClick={onOpen}
          variant="ghost"
          colorScheme="teal"
          size="lg"
          display={{ base: 'flex', md: 'none' }}
          ml={2}
          aria-label="Open menu"
        />
      </Flex>

      {/* Mobile Menu */}
      <MobileMenu />
    </MotionBox>
  );
};

export default ResponsiveNavbar;
