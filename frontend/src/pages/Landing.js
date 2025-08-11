import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Button, SimpleGrid, Image, VStack, HStack, Icon, Flex, useColorModeValue, Card, CardBody, Badge } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaCheckCircle, FaRocket, FaUserGraduate, FaEye, FaPlay, FaUsers, FaClock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const testimonials = [
  {
    name: 'Aman Sharma',
    text: 'This LMS helped me crack NEET! The lectures and notes are top-notch.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Priya Singh',
    text: 'The best platform for affordable, quality education. Highly recommended!',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    name: 'Rahul Verma',
    text: 'I loved the interactive lectures and the support from teachers.',
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
  },
];

const whyChoose = [
  { icon: FaRocket, label: 'Expert Faculty' },
  { icon: FaUserGraduate, label: 'Proven Results' },
  { icon: FaCheckCircle, label: 'Affordable Pricing' },
  { icon: FaStar, label: 'Student-Centric Approach' },
];

const Landing = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const bg = useColorModeValue('gray.50', 'gray.900');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data.slice(0, 4)))
      .catch(() => setCourses([]));
  }, []);

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
      {/* Hero Section */}
      <MotionBox
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        as="section"
        py={24}
        textAlign="center"
        color="white"
        position="relative"
        zIndex={1}
      >
        <Heading fontSize={{ base: '3xl', md: '5xl' }} mb={4} fontWeight="bold" className="gradient-text">
          Unlock Your Potential with <Text as="span" color="yellow.300">LMS</Text>
        </Heading>
        <Text fontSize={{ base: 'lg', md: '2xl' }} mb={8} opacity="0.9">
          India's most affordable, high-quality learning platform for NEET, JEE, and more.
        </Text>
        {!user ? (
          <Button 
            size="lg" 
            variant="3d-primary"
            px={10} 
            py={6} 
            fontWeight="bold" 
            fontSize="xl" 
            onClick={() => window.location.href = '/register'}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            Get Started
          </Button>
        ) : (
          <HStack spacing={4}>
            <Button 
              size="lg" 
              variant="3d-primary"
              px={8} 
              py={6} 
              fontWeight="bold" 
              fontSize="xl" 
              onClick={() => navigate('/user/dashboard')}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              Go to Dashboard
            </Button>
            <Button 
              size="lg" 
              variant="glass"
              px={8} 
              py={6} 
              fontWeight="bold" 
              fontSize="xl" 
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              Browse Courses
            </Button>
          </HStack>
        )}
      </MotionBox>

      {/* Featured Courses */}
      <Box as="section" id="featured" py={20} maxW="6xl" mx="auto" px={4}>
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Heading 
            mb={6} 
            textAlign="center" 
            color="white" 
            className="gradient-text"
            fontSize={{ base: '3xl', md: '4xl' }}
            textShadow="0 4px 8px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)"
            fontWeight="extrabold"
            letterSpacing="wide"
          >
            Explore Our Courses
          </Heading>
          <Text 
            textAlign="center" 
            color="white" 
            opacity="0.95" 
            fontSize="lg" 
            mb={8}
            textShadow="0 2px 4px rgba(0,0,0,0.3)"
            fontWeight="medium"
          >
            Discover high-quality courses designed to help you succeed
          </Text>
        </MotionBox>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          {courses.map((course, index) => (
            <MotionCard
              key={course._id}
              variant="3d"
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
              cursor="pointer"
              onClick={() => navigate(`/course/${course._id}`)}
            >
              <CardBody p={6}>
                <Box position="relative" mb={4}>
                  <Image 
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=180&fit=crop'} 
                    alt={course.title} 
                    rounded="lg" 
                    w="full" 
                    h="180px" 
                    objectFit="cover"
                    shadow="lg"
                  />
                  <Badge
                    position="absolute"
                    top={2}
                    right={2}
                    variant="neon"
                    colorScheme="teal"
                  >
                    {course.price ? `₹${course.price}` : 'Free'}
                  </Badge>
                </Box>
                <Heading fontSize="xl" mb={2} color="gray.800">{course.title}</Heading>
                <Text mb={4} color="gray.600" fontSize="sm">{course.description.slice(0, 60)}...</Text>
                <HStack justify="space-between" align="center" mb={4}>
                  <HStack spacing={2} color="gray.500" fontSize="sm">
                    <Icon as={FaUsers} />
                    <Text>{course.enrolledStudents || 0} students</Text>
                  </HStack>
                  <HStack spacing={2} color="gray.500" fontSize="sm">
                    <Icon as={FaClock} />
                    <Text>{course.duration || '10h'}</Text>
                  </HStack>
                </HStack>
                <Button
                  size="sm"
                  variant="3d"
                  leftIcon={<FaEye />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/course/${course._id}`);
                  }}
                  w="full"
                >
                  View Course
                </Button>
              </CardBody>
            </MotionCard>
          ))}
        </SimpleGrid>
      </Box>

      {/* Testimonials */}
      <Box as="section" id="testimonials" py={20} bg="glass.100" backdropFilter="blur(10px)">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Heading 
            mb={8} 
            textAlign="center" 
            color="white" 
            className="gradient-text"
            textShadow="0 4px 8px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)"
            fontWeight="extrabold"
            letterSpacing="wide"
          >
            Student Success Stories
          </Heading>
        </MotionBox>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} maxW="6xl" mx="auto" px={4}>
          {testimonials.map((t, i) => (
            <MotionCard
              key={i}
              variant="glass"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.04, rotateY: 3 }}
              transition={{ 
                duration: 0.6,
                delay: i * 0.1,
                type: 'spring', 
                stiffness: 200 
              }}
              viewport={{ once: true }}
            >
              <CardBody p={8} textAlign="center">
                <Box
                  position="relative"
                  mb={4}
                  display="inline-block"
                >
                  <Image 
                    src={t.avatar} 
                    alt={t.name} 
                    rounded="full" 
                    boxSize="80px" 
                    mx="auto"
                    shadow="lg"
                    border="3px solid"
                    borderColor="neon.blue"
                  />
                  <Box
                    position="absolute"
                    top="-2px"
                    left="-2px"
                    right="-2px"
                    bottom="-2px"
                    bg="neon.blue"
                    rounded="full"
                    opacity="0.3"
                    filter="blur(8px)"
                    zIndex={-1}
                  />
                </Box>
                <Text fontSize="lg" mb={2} fontStyle="italic" color="gray.700">"{t.text}"</Text>
                <Text fontWeight="bold" color="neon.blue">{t.name}</Text>
              </CardBody>
            </MotionCard>
          ))}
        </SimpleGrid>
      </Box>

      {/* Why Choose Us */}
      <Box as="section" id="why" py={20} maxW="5xl" mx="auto" px={4}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Heading 
            mb={8} 
            textAlign="center" 
            color="white" 
            className="gradient-text"
            textShadow="0 4px 8px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)"
            fontWeight="extrabold"
            letterSpacing="wide"
          >
            Why Choose Us?
          </Heading>
        </MotionBox>
        <HStack spacing={8} justify="center" flexWrap="wrap">
          {whyChoose.map((item, i) => (
            <MotionBox
              key={i}
              className="why-choose-item"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1, rotateY: 10 }}
              transition={{ 
                duration: 0.6,
                delay: i * 0.1,
                type: 'spring', 
                stiffness: 300 
              }}
              viewport={{ once: true }}
            >
              <VStack spacing={4} p={6} bg="glass.200" rounded="xl" backdropFilter="blur(10px)">
                <Box
                  p={4}
                  bg="neon.blue"
                  rounded="full"
                  color="white"
                  boxShadow="0 0 20px rgba(59, 130, 246, 0.5)"
                >
                  <Icon as={item.icon} boxSize={8} />
                </Box>
                <Text 
                  fontWeight="bold" 
                  fontSize="lg" 
                  color="white"
                  textShadow="0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.3)"
                  letterSpacing="wide"
                >
                  {item.label}
                </Text>
              </VStack>
            </MotionBox>
          ))}
        </HStack>
      </Box>

      <Footer />
    </Box>
  );
};

export default Landing; 