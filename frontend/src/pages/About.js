import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaUsers, FaBook, FaAward, FaGlobe, FaHeart, FaRocket, FaStar } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const About = () => {
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const features = [
    {
      icon: FaGraduationCap,
      title: 'Quality Education',
      description: 'Access to high-quality educational content from expert instructors.',
      color: 'neon.blue',
    },
    {
      icon: FaUsers,
      title: 'Expert Faculty',
      description: 'Learn from experienced educators and industry professionals.',
      color: 'neon.green',
    },
    {
      icon: FaBook,
      title: 'Comprehensive Courses',
      description: 'Wide range of courses covering various subjects and skill levels.',
      color: 'neon.purple',
    },
    {
      icon: FaAward,
      title: 'Proven Results',
      description: 'Track record of helping students achieve their educational goals.',
      color: 'neon.yellow',
    },
    {
      icon: FaGlobe,
      title: 'Accessible Learning',
      description: 'Learn anytime, anywhere with our flexible online platform.',
      color: 'neon.pink',
    },
    {
      icon: FaHeart,
      title: 'Student-Centric',
      description: 'Focused on providing the best learning experience for students.',
      color: 'neon.red',
    },
  ];

  return (
    <Box bg="gradients.primary" minH="100vh" position="relative" overflow="hidden">
      {/* Animated background elements */}
      <Box
        position="absolute"
        top="10%"
        left="10%"
        w="300px"
        h="300px"
        bg="neon.blue"
        borderRadius="full"
        opacity="0.1"
        filter="blur(60px)"
        animation="pulse 6s infinite"
      />
      <Box
        position="absolute"
        top="60%"
        right="15%"
        w="250px"
        h="250px"
        bg="neon.purple"
        borderRadius="full"
        opacity="0.1"
        filter="blur(50px)"
        animation="pulse 8s infinite"
      />
      <Box
        position="absolute"
        bottom="20%"
        left="20%"
        w="200px"
        h="200px"
        bg="neon.pink"
        borderRadius="full"
        opacity="0.1"
        filter="blur(40px)"
        animation="pulse 7s infinite"
      />

      <Navbar />
      <Container maxW="6xl" py={12}>
        <VStack spacing={12} align="stretch">
          {/* Hero Section */}
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            textAlign="center" 
            py={12}
          >
            <Heading 
              size="2xl" 
              mb={6} 
              color="white" 
              className="gradient-text"
              textShadow="0 4px 8px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)"
              fontWeight="extrabold"
              letterSpacing="wide"
            >
              About LMS
            </Heading>
            <Text 
              fontSize="xl" 
              color="white" 
              opacity="0.95" 
              maxW="3xl" 
              mx="auto"
              textShadow="0 2px 4px rgba(0,0,0,0.3)"
              fontWeight="medium"
            >
              We are dedicated to providing high-quality, affordable education to students across India. 
              Our mission is to make learning accessible to everyone through our innovative online platform.
            </Text>
          </MotionBox>

          {/* Mission & Vision */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <MotionCard
              variant="glass"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, rotateY: 3 }}
            >
              <CardBody>
                <VStack spacing={4} align="start">
                  <HStack spacing={3}>
                    <Box
                      p={3}
                      bg="neon.blue"
                      rounded="full"
                      color="white"
                      boxShadow="0 0 15px rgba(59, 130, 246, 0.5)"
                    >
                      <Icon as={FaRocket} boxSize={6} />
                    </Box>
                    <Heading size="lg" color="white">Our Mission</Heading>
                  </HStack>
                  <Text color="white" opacity="0.9">
                    To democratize education by providing affordable, high-quality learning resources 
                    to students across India. We believe that every student deserves access to 
                    excellent educational content regardless of their location or financial background.
                  </Text>
                </VStack>
              </CardBody>
            </MotionCard>

            <MotionCard
              variant="glass"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, rotateY: -3 }}
            >
              <CardBody>
                <VStack spacing={4} align="start">
                  <HStack spacing={3}>
                    <Box
                      p={3}
                      bg="neon.green"
                      rounded="full"
                      color="white"
                      boxShadow="0 0 15px rgba(34, 197, 94, 0.5)"
                    >
                      <Icon as={FaStar} boxSize={6} />
                    </Box>
                    <Heading size="lg" color="white">Our Vision</Heading>
                  </HStack>
                  <Text color="white" opacity="0.9">
                    To become India's leading online learning platform, empowering millions of students 
                    to achieve their educational and career goals through innovative technology and 
                    expert-led instruction.
                  </Text>
                </VStack>
              </CardBody>
            </MotionCard>
          </SimpleGrid>

          {/* Features */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Heading 
              size="lg" 
              textAlign="center" 
              color="white" 
              mb={8} 
              className="gradient-text"
              textShadow="0 4px 8px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)"
              fontWeight="extrabold"
              letterSpacing="wide"
            >
              Why Choose Us?
            </Heading>
          </MotionBox>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {features.map((feature, index) => (
              <MotionCard
                key={index}
                variant="3d"
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
                }}
                transition={{ 
                  duration: 0.6,
                  delay: index * 0.1,
                  type: 'spring', 
                  stiffness: 300 
                }}
                viewport={{ once: true }}
              >
                <CardBody textAlign="center" p={6}>
                  <Box
                    p={4}
                    bg={feature.color}
                    rounded="full"
                    color="white"
                    boxShadow={`0 0 20px ${feature.color === 'neon.blue' ? 'rgba(59, 130, 246, 0.5)' : 
                                   feature.color === 'neon.green' ? 'rgba(34, 197, 94, 0.5)' :
                                   feature.color === 'neon.purple' ? 'rgba(147, 51, 234, 0.5)' :
                                   feature.color === 'neon.yellow' ? 'rgba(234, 179, 8, 0.5)' :
                                   feature.color === 'neon.pink' ? 'rgba(236, 72, 153, 0.5)' :
                                   'rgba(239, 68, 68, 0.5)'}`}
                    display="inline-block"
                    mb={4}
                  >
                    <Icon as={feature.icon} boxSize={8} />
                  </Box>
                  <Heading 
                    size="md" 
                    color="white" 
                    mb={3}
                    textShadow="0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.3)"
                    fontWeight="bold"
                    letterSpacing="wide"
                  >
                    {feature.title}
                  </Heading>
                  <Text 
                    color="white" 
                    opacity={0.95}
                    fontSize="sm"
                    textShadow="0 1px 3px rgba(0,0,0,0.7)"
                    fontWeight="medium"
                  >
                    {feature.description}
                  </Text>
                </CardBody>
              </MotionCard>
            ))}
          </SimpleGrid>

          {/* Stats Section */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card variant="glass" p={8}>
              <CardBody>
                <VStack spacing={8}>
                  <Heading 
                    size="lg" 
                    color="white" 
                    textAlign="center" 
                    className="gradient-text"
                    textShadow="0 4px 8px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)"
                    fontWeight="extrabold"
                    letterSpacing="wide"
                  >
                    Our Impact
                  </Heading>
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8} w="full">
                    <VStack spacing={2}>
                      <Heading size="2xl" color="neon.blue">10K+</Heading>
                      <Text color="white" opacity="0.8" textAlign="center">Students Enrolled</Text>
                    </VStack>
                    <VStack spacing={2}>
                      <Heading size="2xl" color="neon.green">500+</Heading>
                      <Text color="white" opacity="0.8" textAlign="center">Courses Available</Text>
                    </VStack>
                    <VStack spacing={2}>
                      <Heading size="2xl" color="neon.purple">50+</Heading>
                      <Text color="white" opacity="0.8" textAlign="center">Expert Instructors</Text>
                    </VStack>
                    <VStack spacing={2}>
                      <Heading size="2xl" color="neon.yellow">95%</Heading>
                      <Text color="white" opacity="0.8" textAlign="center">Success Rate</Text>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          </MotionBox>
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
};

export default About; 