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
    <Box bg="white" minH="100vh" position="relative" overflow="hidden">
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
              color="brand.text" 
              fontWeight="extrabold"
              letterSpacing="wide"
            >
              About LMS
            </Heading>
            <Text 
              fontSize="xl" 
              color="gray.700" 
              opacity="1" 
              maxW="3xl" 
              mx="auto"
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
                    <Heading size="lg" color="brand.text">Our Mission</Heading>
                  </HStack>
                  <Text color="gray.700" opacity="1">
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
                    <Heading size="lg" color="brand.text">Our Vision</Heading>
                  </HStack>
                  <Text color="gray.700" opacity="1">
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
              color="brand.text" 
              mb={8} 
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
                    color="brand.text" 
                    mb={3}
                    fontWeight="bold"
                    letterSpacing="wide"
                  >
                    {feature.title}
                  </Heading>
                  <Text 
                    color="gray.700" 
                    opacity={1}
                    fontSize="sm"
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
            <Card p={8}>
              <CardBody>
                <VStack spacing={8}>
                  <Heading 
                    size="lg" 
                    color="brand.text" 
                    textAlign="center" 
                    fontWeight="extrabold"
                    letterSpacing="wide"
                  >
                    Our Impact
                  </Heading>
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8} w="full">
                    <VStack spacing={2}>
                      <Heading size="2xl" color="teal.500">10K+</Heading>
                      <Text color="gray.700" opacity="1" textAlign="center">Students Enrolled</Text>
                    </VStack>
                    <VStack spacing={2}>
                      <Heading size="2xl" color="green.500">500+</Heading>
                      <Text color="gray.700" opacity="1" textAlign="center">Courses Available</Text>
                    </VStack>
                    <VStack spacing={2}>
                      <Heading size="2xl" color="purple.500">50+</Heading>
                      <Text color="gray.700" opacity="1" textAlign="center">Expert Instructors</Text>
                    </VStack>
                    <VStack spacing={2}>
                      <Heading size="2xl" color="yellow.500">95%</Heading>
                      <Text color="gray.700" opacity="1" textAlign="center">Success Rate</Text>
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