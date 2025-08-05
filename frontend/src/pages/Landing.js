import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Button, SimpleGrid, Image, VStack, HStack, Icon, Flex, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaCheckCircle, FaRocket, FaUserGraduate, FaEye } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MotionBox = motion(Box);

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
    <Box bg={bg} minH="100vh">
      <Navbar />
      {/* Hero Section */}
      <MotionBox
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        as="section"
        py={24}
        textAlign="center"
        bgGradient="linear(to-br, teal.400, blue.500)"
        color="white"
      >
        <Heading fontSize={{ base: '3xl', md: '5xl' }} mb={4} fontWeight="bold">
          Unlock Your Potential with <Text as="span" color="yellow.300">LMS</Text>
        </Heading>
        <Text fontSize={{ base: 'lg', md: '2xl' }} mb={8}>
          India’s most affordable, high-quality learning platform for NEET, JEE, and more.
        </Text>
        {!user ? (
          <Button 
            size="lg" 
            colorScheme="yellow" 
            px={10} 
            py={6} 
            fontWeight="bold" 
            fontSize="xl" 
            boxShadow="xl"
            onClick={() => window.location.href = '/register'}
          >
            Get Started
          </Button>
        ) : (
          <HStack spacing={4}>
            <Button 
              size="lg" 
              colorScheme="teal" 
              px={8} 
              py={6} 
              fontWeight="bold" 
              fontSize="xl" 
              boxShadow="xl"
              onClick={() => navigate('/user/dashboard')}
            >
              Go to Dashboard
            </Button>
            <Button 
              size="lg" 
              colorScheme="yellow" 
              variant="outline"
              px={8} 
              py={6} 
              fontWeight="bold" 
              fontSize="xl" 
              boxShadow="xl"
              onClick={() => navigate('/')}
            >
              Browse Courses
            </Button>
          </HStack>
        )}
      </MotionBox>

      {/* Featured Courses */}
      <Box as="section" id="featured" py={20} maxW="6xl" mx="auto">
        <Heading mb={8} textAlign="center" color="teal.600">Featured Courses</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
                     {courses.map(course => (
             <MotionBox
               key={course._id}
               whileHover={{ scale: 1.05 }}
               transition={{ type: 'spring', stiffness: 300 }}
               bg="white"
               rounded="xl"
               shadow="lg"
               p={6}
               textAlign="left"
               position="relative"
               cursor="pointer"
               onClick={() => navigate(`/course/${course._id}`)}
               _hover={{ shadow: '2xl' }}
             >
               <Image src={course.thumbnail || 'https://via.placeholder.com/300x180'} alt={course.title} rounded="md" mb={4} w="full" h="180px" objectFit="cover" />
               <Heading fontSize="xl" mb={2}>{course.title}</Heading>
               <Text mb={2} color="gray.600">{course.description.slice(0, 60)}...</Text>
               <HStack justify="space-between" align="center">
                 <Text fontWeight="bold" color="teal.500">{course.price ? `₹${course.price}` : 'Free'}</Text>
                 <Button
                   size="sm"
                   colorScheme="teal"
                   leftIcon={<FaEye />}
                   onClick={(e) => {
                     e.stopPropagation();
                     navigate(`/course/${course._id}`);
                   }}
                   _hover={{ transform: 'scale(1.05)' }}
                 >
                   View Course
                 </Button>
               </HStack>
             </MotionBox>
           ))}
        </SimpleGrid>
      </Box>

      {/* Testimonials */}
      <Box as="section" id="testimonials" py={20} bg="gray.100">
        <Heading mb={8} textAlign="center" color="teal.600">Student Success Stories</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} maxW="6xl" mx="auto">
          {testimonials.map((t, i) => (
            <MotionBox
              key={i}
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 200 }}
              bg="white"
              rounded="xl"
              shadow="md"
              p={8}
              textAlign="center"
            >
              <Image src={t.avatar} alt={t.name} rounded="full" boxSize="80px" mx="auto" mb={4} />
              <Text fontSize="lg" mb={2} fontStyle="italic">“{t.text}”</Text>
              <Text fontWeight="bold" color="teal.500">{t.name}</Text>
            </MotionBox>
          ))}
        </SimpleGrid>
      </Box>

      {/* Why Choose Us */}
      <Box as="section" id="why" py={20} maxW="5xl" mx="auto">
        <Heading mb={8} textAlign="center" color="teal.600">Why Choose Us?</Heading>
        <HStack spacing={8} justify="center" flexWrap="wrap">
          {whyChoose.map((item, i) => (
            <VStack key={i} spacing={4}>
              <Icon as={item.icon} boxSize={12} color="teal.400" />
              <Text fontWeight="bold" fontSize="lg">{item.label}</Text>
            </VStack>
          ))}
        </HStack>
      </Box>

      <Footer />
    </Box>
  );
};

export default Landing; 