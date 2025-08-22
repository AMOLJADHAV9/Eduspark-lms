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
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const hasPaidEnrollment = enrollments.some(e => e.isPaid);
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  useEffect(() => {
    if (showPayments) {
      fetchPayments();
    }
  }, [showPayments]);

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
      <Container maxW="6xl" py={{ base: 4, md: 8 }} px={{ base: 2, md: 4 }}>
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          {/* Header */}
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            bg="white"
            p={{ base: 4, md: 8 }}
            borderRadius="2xl"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
            border="1px solid"
            borderColor="gray.200"
          >
            <VStack spacing={4} align="start">
              <Heading 
                color="teal.600" 
                fontSize={{ base: '2xl', md: '3xl' }} 
                fontWeight="extrabold"
                textAlign={{ base: 'center', md: 'left' }}
                w="full"
              >
                Welcome back, {user?.name}!
              </Heading>
              <Text 
                color="gray.600" 
                fontSize={{ base: 'md', md: 'lg' }}
                textAlign={{ base: 'center', md: 'left' }}
                w="full"
              >
                Here's what's happening with your courses today
              </Text>
            </VStack>
          </MotionBox>

          {/* Stats */}
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 4, md: 6 }}>
            <MotionCard
              variant="3d"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <CardBody textAlign="center" p={{ base: 4, md: 6 }}>
                <Box
                  p={{ base: 3, md: 4 }}
                  bg="teal.500"
                  rounded="full"
                  color="white"
                  boxShadow="0 0 12px rgba(90, 75, 218, 0.25)"
                  display="inline-block"
                  mb={{ base: 3, md: 4 }}
                >
                  <Icon as={FaBook} boxSize={{ base: 6, md: 8 }} />
                </Box>
                <Heading size={{ base: 'md', md: 'lg' }} color="brand.text" mb={2}>
                  {enrollments.length}
                </Heading>
                <Text color="gray.700" opacity="1" fontSize={{ base: 'sm', md: 'md' }}>Enrolled Courses</Text>
              </CardBody>
            </MotionCard>
            
            <MotionCard
              variant="3d"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <CardBody textAlign="center" p={{ base: 4, md: 6 }}>
                <Box p={{ base: 3, md: 4 }} bg="green.500" rounded="full" color="white" display="inline-block" mb={{ base: 3, md: 4 }}>
                  <Icon as={FaPlay} boxSize={{ base: 6, md: 8 }} />
                </Box>
                <Heading size={{ base: 'md', md: 'lg' }} color="brand.text" mb={2}>
                  {enrollments.filter(e => (e?.progress || 0) > 0).length}
                </Heading>
                <Text color="gray.700" opacity="1" fontSize={{ base: 'sm', md: 'md' }}>Active Courses</Text>
              </CardBody>
            </MotionCard>
            
            <MotionCard
              variant="3d"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <CardBody textAlign="center" p={{ base: 4, md: 6 }}>
                <Box p={{ base: 3, md: 4 }} bg="purple.500" rounded="full" color="white" display="inline-block" mb={{ base: 3, md: 4 }}>
                  <Icon as={FaChartLine} boxSize={{ base: 6, md: 8 }} />
                </Box>
                <Heading size={{ base: 'md', md: 'lg' }} color="brand.text" mb={2}>
                  {enrollments.length > 0 
                    ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
                    : 0}%
                </Heading>
                <Text color="gray.700" opacity="1" fontSize={{ base: 'sm', md: 'md' }}>Average Progress</Text>
              </CardBody>
            </MotionCard>

          </SimpleGrid>

          {/* Buy Now CTA when no paid courses */}
          {!hasPaidEnrollment && (
            <MotionCard
              variant="glass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <CardBody textAlign="center" py={8}>
                <Heading size="md" color="brand.text" mb={2}>No purchased courses yet</Heading>
                <Text color="gray.700" opacity="1" mb={6}>
                  Unlock premium courses and start learning today
                </Text>
                <Button colorScheme="teal" size="lg" onClick={() => navigate('/courses')}>
                  Buy Now
                </Button>
              </CardBody>
            </MotionCard>
          )}

          {/* Practice Quizzes CTA */}
          <MotionCard
            variant="glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            <CardBody textAlign="center" py={8}>
              <Heading size="md" color="brand.text" mb={2}>Practice Quizzes</Heading>
              <Text color="gray.700" opacity="1" mb={6}>
                Sharpen your skills with interactive quizzes
              </Text>
              <Button colorScheme="teal" size="lg" onClick={() => navigate('/quizzes')}>
                Go to Quizzes
              </Button>
            </CardBody>
          </MotionCard>

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
                {!hasPaidEnrollment && (
                  <Button
                    ml={4}
                    colorScheme="teal"
                    variant="outline"
                    onClick={() => navigate('/courses')}
                    size="lg"
                  >
                    Buy Now
                  </Button>
                )}
              </CardBody>
            </MotionCard>
          ) : (
            <>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {(showAllCourses ? enrollments : enrollments.slice(0, 2))
                  .filter((enrollment) => enrollment && enrollment.course)
                  .map((enrollment, index) => (
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
                    onClick={() => navigate(`/course/${enrollment.course?._id}`)}
                  >
                    <CardBody p={0}>
                      <Box position="relative">
                        <Image 
                          src={enrollment.course?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=180&fit=crop'} 
                          alt={enrollment.course?.title || 'Course thumbnail'} 
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
                          {enrollment.course?.title || 'Untitled Course'}
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
                            navigate(`/course/${enrollment.course?._id}`);
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
              
              {enrollments.length > 2 && (
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  textAlign="center"
                  mt={6}
                >
                  <Button
                    variant="outline"
                    colorScheme="teal"
                    size="lg"
                    onClick={() => setShowAllCourses(!showAllCourses)}
                    leftIcon={showAllCourses ? <FaEye /> : <FaEye />}
                  >
                    {showAllCourses ? 'Show Less' : `View All ${enrollments.length} Courses`}
                  </Button>
                </MotionBox>
              )}
            </>
          )}



          {/* Payment History Toggle */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <HStack justify="space-between" mb={4}>
              <Heading size="lg" color="brand.text" fontWeight="extrabold" letterSpacing="wide">
                Payment History
              </Heading>
              <Button variant="outline" colorScheme="teal" onClick={() => setShowPayments(!showPayments)}>
                {showPayments ? 'Hide' : 'View'} Payment History
              </Button>
            </HStack>
          </MotionBox>

          {showPayments && (
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
                              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((p.amount || 0) / 100)}
                            </Text>
                          </VStack>
                        </HStack>
                      </Card>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default UserDashboard; 