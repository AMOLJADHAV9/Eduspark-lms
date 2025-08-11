import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Button,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Spinner,
  Center,
  Icon,
  Image,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FaPlay, FaBook, FaChartLine, FaGraduationCap, FaClock, FaStar, FaEye } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { api } from '../utils/api';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const data = await api.get('/api/enrollments/user');
      setEnrollments(data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box bg="gradients.primary" minH="100vh">
        <Navbar />
        <Center h="60vh">
          <VStack spacing={6}>
            <Spinner size="xl" color="white" thickness="4px" />
            <Text color="white" fontSize="lg">Loading your dashboard...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

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
      <Container maxW="6xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card variant="glass" p={8} textAlign="center">
              <CardBody>
                <Heading 
                  size="lg" 
                  mb={2} 
                  color="white" 
                  className="gradient-text" 
                  fontWeight="extrabold"
                  textShadow="0 4px 8px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)"
                  letterSpacing="wide"
                >
                  Welcome back, {user?.name}!
                </Heading>
                <Text 
                  color="white" 
                  opacity="0.95" 
                  fontSize="lg"
                  textShadow="0 2px 4px rgba(0,0,0,0.3)"
                  fontWeight="medium"
                >
                  Continue your learning journey
                </Text>
              </CardBody>
            </Card>
          </MotionBox>

          {/* Stats */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <MotionCard
              variant="3d"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <CardBody textAlign="center" p={6}>
                <Box
                  p={4}
                  bg="neon.blue"
                  rounded="full"
                  color="white"
                  boxShadow="0 0 20px rgba(59, 130, 246, 0.5)"
                  display="inline-block"
                  mb={4}
                >
                  <Icon as={FaBook} boxSize={8} />
                </Box>
                <Heading size="lg" color="white" mb={2}>
                  {enrollments.length}
                </Heading>
                <Text color="white" opacity="0.8">Enrolled Courses</Text>
              </CardBody>
            </MotionCard>
            
            <MotionCard
              variant="3d"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <CardBody textAlign="center" p={6}>
                <Box
                  p={4}
                  bg="neon.green"
                  rounded="full"
                  color="white"
                  boxShadow="0 0 20px rgba(34, 197, 94, 0.5)"
                  display="inline-block"
                  mb={4}
                >
                  <Icon as={FaPlay} boxSize={8} />
                </Box>
                <Heading size="lg" color="white" mb={2}>
                  {enrollments.filter(e => e.progress > 0).length}
                </Heading>
                <Text color="white" opacity="0.8">Active Courses</Text>
              </CardBody>
            </MotionCard>
            
            <MotionCard
              variant="3d"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <CardBody textAlign="center" p={6}>
                <Box
                  p={4}
                  bg="neon.yellow"
                  rounded="full"
                  color="white"
                  boxShadow="0 0 20px rgba(234, 179, 8, 0.5)"
                  display="inline-block"
                  mb={4}
                >
                  <Icon as={FaChartLine} boxSize={8} />
                </Box>
                <Heading size="lg" color="white" mb={2}>
                  {enrollments.length > 0 
                    ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
                    : 0}%
                </Heading>
                <Text color="white" opacity="0.8">Average Progress</Text>
              </CardBody>
            </MotionCard>
          </SimpleGrid>

          {/* Enrolled Courses */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Heading 
              size="lg" 
              color="white" 
              mb={6} 
              className="gradient-text"
              textShadow="0 4px 8px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)"
              fontWeight="extrabold"
              letterSpacing="wide"
            >
              Your Enrolled Courses
            </Heading>
          </MotionBox>

          {enrollments.length === 0 ? (
            <MotionCard
              variant="glass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <CardBody textAlign="center" py={12}>
                <Icon as={FaBook} boxSize={16} color="gray.400" mb={4} />
                <Heading size="md" color="white" mb={2}>No courses enrolled yet</Heading>
                <Text color="white" opacity="0.8" mb={6}>
                  Start your learning journey by enrolling in a course
                </Text>
                <Button
                  variant="3d-primary"
                  onClick={() => navigate('/courses')}
                  size="lg"
                >
                  Browse Courses
                </Button>
              </CardBody>
            </MotionCard>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {enrollments.map((enrollment, index) => (
                <MotionCard
                  key={enrollment._id}
                  variant="3d"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.5 + index * 0.1 
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: 5,
                    boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
                  }}
                  cursor="pointer"
                  onClick={() => navigate(`/course/${enrollment.course._id}`)}
                >
                  <CardBody p={0}>
                    <Box position="relative">
                      <Image 
                        src={enrollment.course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=180&fit=crop'} 
                        alt={enrollment.course.title} 
                        w="full" 
                        h="160px" 
                        objectFit="cover"
                        roundedTop="lg"
                      />
                      <Badge
                        position="absolute"
                        top={3}
                        right={3}
                        variant="neon"
                        colorScheme="teal"
                      >
                        {enrollment.progress || 0}%
                      </Badge>
                    </Box>
                    
                    <Box p={6}>
                      <Heading fontSize="lg" mb={3} color="gray.800" noOfLines={2}>
                        {enrollment.course.title}
                      </Heading>
                      
                      <VStack spacing={3} mb={4} align="stretch">
                        <HStack justify="space-between" color="gray.500" fontSize="sm">
                          <HStack spacing={2}>
                            <Icon as={FaClock} />
                            <Text>Last accessed: {new Date(enrollment.updatedAt).toLocaleDateString()}</Text>
                          </HStack>
                        </HStack>
                        
                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="sm" color="gray.600">Progress</Text>
                            <Text fontSize="sm" color="gray.600">{enrollment.progress || 0}%</Text>
                          </HStack>
                          <Progress 
                            value={enrollment.progress || 0} 
                            colorScheme="teal" 
                            size="sm" 
                            rounded="full"
                            bg="gray.200"
                          />
                        </Box>
                      </VStack>
                      
                      <Button
                        variant="3d"
                        leftIcon={<FaEye />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/course/${enrollment.course._id}`);
                        }}
                        w="full"
                        size="md"
                      >
                        Continue Learning
                      </Button>
                    </Box>
                  </CardBody>
                </MotionCard>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default UserDashboard; 