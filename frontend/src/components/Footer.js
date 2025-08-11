import React from 'react';
import { Box, Flex, Text, Link, HStack, VStack, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  FaHeart, 
  FaRocket, 
  FaGraduationCap, 
  FaStar, 
  FaMagic,
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaEnvelope
} from 'react-icons/fa';

const MotionBox = motion(Box);

const Footer = () => (
  <MotionBox
    bg="gradients.dark"
    color="white"
    py={12}
    mt={16}
    position="relative"
    overflow="hidden"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
  >
    {/* Animated background elements */}
    <Box
      position="absolute"
      top="10%"
      left="10%"
      w="200px"
      h="200px"
      bg="neon.blue"
      borderRadius="full"
      opacity="0.05"
      filter="blur(40px)"
      animation="pulse 6s infinite"
    />
    <Box
      position="absolute"
      bottom="20%"
      right="15%"
      w="150px"
      h="150px"
      bg="neon.purple"
      borderRadius="full"
      opacity="0.05"
      filter="blur(30px)"
      animation="pulse 8s infinite"
    />

    <Box maxW="7xl" mx="auto" px={8} position="relative" zIndex={1}>
      <Flex direction={{ base: 'column', lg: 'row' }} align="start" justify="space-between" spacing={8}>
        {/* Brand Section */}
        <VStack align="start" spacing={4} flex={1} mb={{ base: 8, lg: 0 }}>
          <HStack spacing={3}>
            <Box
              w="50px"
              h="50px"
              bg="gradients.primary"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="neon-blue"
            >
              <Icon as={FaGraduationCap} boxSize={6} color="white" />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontWeight="extrabold" fontSize="2xl" className="gradient-text">
                PW LMS
              </Text>
              <Text fontSize="sm" color="gray.300">
                Empowering Education Through Technology
              </Text>
            </VStack>
          </HStack>
          <Text color="gray.300" maxW="300px" lineHeight="tall">
            Transform your learning experience with our cutting-edge Learning Management System. 
            Join thousands of students and educators worldwide.
          </Text>
          <HStack spacing={4}>
            <Icon as={FaRocket} color="neon.blue" />
            <Icon as={FaStar} color="neon.purple" />
            <Icon as={FaMagic} color="neon.pink" />
          </HStack>
        </VStack>

        {/* Quick Links */}
        <VStack align="start" spacing={4} flex={1} mb={{ base: 8, lg: 0 }}>
          <Text fontWeight="bold" fontSize="lg" color="white">
            Quick Links
          </Text>
          <VStack align="start" spacing={2}>
            <Link 
              href="#about" 
              color="gray.300" 
              _hover={{ 
                color: 'neon.blue',
                textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
                transform: 'translateX(5px)'
              }}
              transition="all 0.3s"
            >
              About Us
            </Link>
            <Link 
              href="#courses" 
              color="gray.300" 
              _hover={{ 
                color: 'neon.purple',
                textShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                transform: 'translateX(5px)'
              }}
              transition="all 0.3s"
            >
              Courses
            </Link>
            <Link 
              href="#live-classes" 
              color="gray.300" 
              _hover={{ 
                color: 'neon.green',
                textShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                transform: 'translateX(5px)'
              }}
              transition="all 0.3s"
            >
              Live Classes
            </Link>
            <Link 
              href="#certificates" 
              color="gray.300" 
              _hover={{ 
                color: 'neon.orange',
                textShadow: '0 0 10px rgba(245, 158, 11, 0.5)',
                transform: 'translateX(5px)'
              }}
              transition="all 0.3s"
            >
              Certificates
            </Link>
          </VStack>
        </VStack>

        {/* Support */}
        <VStack align="start" spacing={4} flex={1} mb={{ base: 8, lg: 0 }}>
          <Text fontWeight="bold" fontSize="lg" color="white">
            Support
          </Text>
          <VStack align="start" spacing={2}>
            <Link 
              href="#contact" 
              color="gray.300" 
              _hover={{ 
                color: 'neon.blue',
                textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
                transform: 'translateX(5px)'
              }}
              transition="all 0.3s"
            >
              Contact Us
            </Link>
            <Link 
              href="#help" 
              color="gray.300" 
              _hover={{ 
                color: 'neon.purple',
                textShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                transform: 'translateX(5px)'
              }}
              transition="all 0.3s"
            >
              Help Center
            </Link>
            <Link 
              href="#privacy" 
              color="gray.300" 
              _hover={{ 
                color: 'neon.green',
                textShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                transform: 'translateX(5px)'
              }}
              transition="all 0.3s"
            >
              Privacy Policy
            </Link>
            <Link 
              href="#terms" 
              color="gray.300" 
              _hover={{ 
                color: 'neon.orange',
                textShadow: '0 0 10px rgba(245, 158, 11, 0.5)',
                transform: 'translateX(5px)'
              }}
              transition="all 0.3s"
            >
              Terms of Service
            </Link>
          </VStack>
        </VStack>

        {/* Social Links */}
        <VStack align="start" spacing={4} flex={1}>
          <Text fontWeight="bold" fontSize="lg" color="white">
            Connect With Us
          </Text>
          <HStack spacing={4}>
            <Box
              as="a"
              href="#github"
              w="40px"
              h="40px"
              bg="glass.200"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              _hover={{
                bg: 'neon.blue',
                boxShadow: 'neon-blue',
                transform: 'translateY(-3px) scale(1.1)',
              }}
              transition="all 0.3s"
            >
              <Icon as={FaGithub} color="white" />
            </Box>
            <Box
              as="a"
              href="#twitter"
              w="40px"
              h="40px"
              bg="glass.200"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              _hover={{
                bg: 'neon.purple',
                boxShadow: 'neon-purple',
                transform: 'translateY(-3px) scale(1.1)',
              }}
              transition="all 0.3s"
            >
              <Icon as={FaTwitter} color="white" />
            </Box>
            <Box
              as="a"
              href="#linkedin"
              w="40px"
              h="40px"
              bg="glass.200"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              _hover={{
                bg: 'neon.green',
                boxShadow: 'neon-green',
                transform: 'translateY(-3px) scale(1.1)',
              }}
              transition="all 0.3s"
            >
              <Icon as={FaLinkedin} color="white" />
            </Box>
            <Box
              as="a"
              href="#email"
              w="40px"
              h="40px"
              bg="glass.200"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              _hover={{
                bg: 'neon.orange',
                boxShadow: 'neon-orange',
                transform: 'translateY(-3px) scale(1.1)',
              }}
              transition="all 0.3s"
            >
              <Icon as={FaEnvelope} color="white" />
            </Box>
          </HStack>
        </VStack>
      </Flex>

      {/* Bottom Section */}
      <Box 
        borderTop="1px solid" 
        borderColor="glass.300" 
        mt={8} 
        pt={8}
        textAlign="center"
      >
        <HStack justify="center" spacing={2} mb={2}>
          <Text fontSize="sm" color="gray.300">
            Made with
          </Text>
          <Icon as={FaHeart} color="neon.pink" animation="pulse 2s infinite" />
          <Text fontSize="sm" color="gray.300">
            by the PW LMS Team
          </Text>
        </HStack>
        <Text fontSize="sm" color="gray.400">
          &copy; {new Date().getFullYear()} PW LMS. All rights reserved.
        </Text>
      </Box>
    </Box>
  </MotionBox>
);

export default Footer; 