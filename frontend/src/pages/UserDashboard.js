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
import { FaPlay, FaBook, FaChartLine, FaGraduationCap, FaClock, FaStar, FaEye, FaCreditCard } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { api } from '../utils/api';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchEnrollments();
    fetchPayments();
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

  const fetchPayments = async () => {
    try {
      const data = await api.get('/api/payment/payments');
      setPayments(data.payments || data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  };

  if (loading) {
    return (
      <Box bg="white" minH="100vh">
        <Navbar />
        <Center h="60vh">
          <VStack spacing={6}>
            <Spinner size="xl" color="teal.500" thickness="4px" />
            <Text color="brand.text" fontSize="lg">Loading your dashboard...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box bg="white" minH="100vh" position="relative" overflow="hidden">
      <Navbar />
      <Container maxW="6xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card p={8} textAlign="center">
              <CardBody>
                <Heading 
                  size="lg" 
                  mb={2} 
                  color="brand.text" 
                  fontWeight="extrabold"
                  letterSpacing="wide"
                >
                  Welcome back, {user?.name}!
                </Heading>
                <Text color="gray.700" opacity="1" fontSize="lg" fontWeight="medium">
                  Continue your learning journey
                </Text>
              </CardBody>
            </Card>
          </MotionBox>

          {/* Stats */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
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
                  bg="teal.500"
                  rounded="full"
                  color="white"
                  boxShadow="0 0 12px rgba(90, 75, 218, 0.25)"
                  display="inline-block"
                  mb={4}
                >
                  <Icon as={FaBook} boxSize={8} />
                </Box>
                <Heading size="lg" color="brand.text" mb={2}>
                  {enrollments.length}
                </Heading>
                <Text color="gray.700" opacity="1">Enrolled Courses</Text>
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
                <Box p={4} bg="green.500" rounded="full" color="white" display="inline-block" mb={4}>
                  <Icon as={FaPlay} boxSize={8} />
                </Box>
                <Heading size="lg" color="brand.text" mb={2}>
                  {enrollments.filter(e => e.progress > 0).length}
                </Heading>
                <Text color="gray.700" opacity="1">Active Courses</Text>
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
                <Box p={4} bg="purple.500" rounded="full" color="white" display="inline-block" mb={4}>
                  <Icon as={FaChartLine} boxSize={8} />
                </Box>
                <Heading size="lg" color="brand.text" mb={2}>
                  {enrollments.length > 0 
                    ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
                    : 0}%
                </Heading>
                <Text color="gray.700" opacity="1">Average Progress</Text>
              </CardBody>
            </MotionCard>

            <MotionCard
              variant="3d"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <CardBody textAlign="center" p={6}>
                <Box p={4} bg="orange.500" rounded="full" color="white" display="inline-block" mb={4}>
                  <Icon as={FaCreditCard} boxSize={8} />
                </Box>
                <Heading size="lg" color="brand.text" mb={2}>
                  {payments.filter(p => p.status === 'completed').length}
                </Heading>
                <Text color="gray.700" opacity="1">Total Payments</Text>
                <Text fontSize="sm" color="green.600" mt={1}>
                  ₹{(payments.filter(p => p.status === 'completed').reduce((acc, p) => acc + (p.amount / 100), 0)).toFixed(2)}
                </Text>
              </CardBody>
            </MotionCard>
          </SimpleGrid>

          {/* Enrolled Courses */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Heading size="lg" color="brand.text" mb={6} fontWeight="extrabold" letterSpacing="wide">
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
                <Heading size="md" color="brand.text" mb={2}>No courses enrolled yet</Heading>
                <Text color="gray.700" opacity="1" mb={6}>
                  Start your learning journey by enrolling in a course
                </Text>
                <Button
                  colorScheme="teal"
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
                      <Heading fontSize="lg" mb={3} color="gray.800" noOfLines={2} fontWeight="bold">
                        {enrollment.course.title}
                      </Heading>
                      
                      <VStack spacing={3} mb={4} align="stretch">
                        <HStack justify="space-between" color="gray.600" fontSize="sm">
                          <HStack spacing={2}>
                            <Icon as={FaClock} color="gray.500" />
                            <Text color="gray.600" fontWeight="medium">Last accessed: {new Date(enrollment.updatedAt).toLocaleDateString()}</Text>
                          </HStack>
                        </HStack>
                        
                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="sm" color="gray.700" fontWeight="semibold">Progress</Text>
                            <Text fontSize="sm" color="gray.700" fontWeight="semibold">{enrollment.progress || 0}%</Text>
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

          {/* Purchase History */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Heading size="lg" color="brand.text" mb={6} fontWeight="extrabold" letterSpacing="wide">
              Purchased Courses
            </Heading>
          </MotionBox>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {enrollments.filter(e => e.isPaid).length === 0 ? (
              <Card variant="glass">
                <CardBody textAlign="center" py={8}>
                  <Text color="gray.600">No purchased courses yet.</Text>
                </CardBody>
              </Card>
            ) : (
              enrollments.filter(e => e.isPaid).map((enrollment) => (
                <Card key={enrollment._id} variant="outline">
                  <CardBody>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Heading size="md">{enrollment.course.title}</Heading>
                        <Text color="gray.600">Purchased on {new Date(enrollment.enrolledAt).toLocaleDateString()}</Text>
                      </VStack>
                      <Badge colorScheme="green">Paid</Badge>
                    </HStack>
                  </CardBody>
                </Card>
              ))
            )}
          </SimpleGrid>

          {/* Payment History */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Heading size="lg" color="brand.text" mb={6} fontWeight="extrabold" letterSpacing="wide">
              Payment History
            </Heading>
          </MotionBox>
          <Card>
            <CardBody>
              {paymentsLoading ? (
                <Center py={8}>
                  <Spinner size="lg" />
                </Center>
              ) : payments.length === 0 ? (
                <Text color="gray.600">No payments found.</Text>
              ) : (
                <VStack align="stretch" spacing={3}>
                  {payments.map(p => (
                    <Card key={p._id} variant="outline" p={4}>
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={2} flex={1}>
                          <Text fontWeight="medium" fontSize="lg">{p.description}</Text>
                          <HStack spacing={4} fontSize="sm" color="gray.600">
                            <Text>Date: {new Date(p.createdAt).toLocaleDateString()}</Text>
                            <Text>Time: {new Date(p.createdAt).toLocaleTimeString()}</Text>
                            {p.metadata?.courseTitle && (
                              <Text>Course: {p.metadata.courseTitle}</Text>
                            )}
                          </HStack>
                          <HStack spacing={2}>
                            <Badge colorScheme="blue" variant="outline">
                              {p.paymentMethod}
                            </Badge>
                            {p.metadata?.razorpay_payment_id && (
                              <Badge colorScheme="green" variant="outline">
                                ID: {p.metadata.razorpay_payment_id.slice(-8)}
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                        <VStack align="end" spacing={2}>
                          <Badge 
                            colorScheme={p.status === 'completed' ? 'green' : p.status === 'failed' ? 'red' : 'yellow'} 
                            size="lg"
                            textTransform="capitalize"
                          >
                            {p.status}
                          </Badge>
                          <Text fontWeight="bold" fontSize="lg" color="green.600">
                            {p.currency} {(p.amount / 100).toFixed(2)}
                          </Text>
                        </VStack>
                      </HStack>
                    </Card>
                  ))}
                </VStack>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default UserDashboard; 