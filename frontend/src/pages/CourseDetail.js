"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Image,
  VStack,
  HStack,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Progress,
  useToast,
  Spinner,
  Center,
  Divider,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaPlay, FaBook, FaUser, FaClock, FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { api } from '../utils/api';

const CourseDetail = () => {

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    }
    script.onerror = () =>{
      reject(false);
    }
    document.head.appendChild(script);
  });
}

const onPayment = async (price, itemName) => {
  try {
    const options = {
      courseId: id,
      price: price * 100, // Convert to paise
    }
    
    const data = await api.post("/api/payments/create-order", options);
    console.log(data);

    if (!data.success) {
      toast({ title: 'Error', description: 'Failed to create order', status: 'error' });
      return;
    }

    const paymentObject = new window.Razorpay({
      key: "rzp_test_EoPLr7rKx3ViOB",
      order_id: data.order.id,
      amount: data.order.amount,
      currency: data.order.currency,
      name: "LMS Platform",
      description: `Payment for ${itemName}`,
      handler: function(response){
        console.log(response);
        
        const options2 = {
          order_id: response.razorpay_order_id,
          payment_id: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        }

        api.post('/api/payments/verify-payment', options2).then(async (res) => {
          console.log(res);
          if(res.success){
            toast({ title: 'Success', description: 'Payment Successful!', status: 'success' });
            // Record payment and enroll user as paid
            try {
              // Save payment record to MongoDB
              await api.post('/api/payment/payments', {
                type: 'one_time',
                amount: data.order.amount,
                currency: data.order.currency,
                description: `Course purchase: ${itemName}`,
                paymentMethod: 'razorpay',
                status: 'completed',
                metadata: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  courseId: id,
                  courseTitle: itemName
                }
              });
              
              // Enroll user in course as paid
              await handleEnroll(true);
              
              toast({ title: 'Success', description: 'Payment recorded and enrollment completed!', status: 'success' });
            } catch (e) {
              console.error('Failed to save payment/enrollment', e);
              toast({ title: 'Warning', description: 'Payment successful but failed to save record. Please contact support.', status: 'warning' });
            }
          } else {
            toast({ title: 'Error', description: 'Payment verification failed', status: 'error' });
          }
        }).catch((err)=>{
          console.log(err);
          toast({ title: 'Error', description: 'Payment verification failed', status: 'error' });
        })
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
      },
      theme: {
        color: "#10B981"
      }
    });
    
    paymentObject.open();
    
  } catch (error){
    console.log(error);
    toast({ title: 'Error', description: 'Failed to create payment order', status: 'error' });
  }
}

useEffect(()=>{
  loadScript("https://checkout.razorpay.com/v1/checkout.js");
},[]);

  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const toast = useToast();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchCourse();
    if (user) {
      checkEnrollment();
    }
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      const data = await api.get(`/api/courses/${id}`);
      setCourse(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch course', status: 'error' });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const data = await api.get(`/api/enrollments/check/${id}`);
      setEnrolled(data.enrolled);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnroll = async (isPaid = false) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setEnrolling(true);
    try {
      await api.post('/api/enrollments', { courseId: id, isPaid });
      setEnrolled(true);
      toast({ title: 'Success', description: 'Successfully enrolled in course!', status: 'success' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to enroll in course', status: 'error' });
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    if (enrolled) {
      navigate(`/course/${id}/learn`);
    } else {
      handleEnroll();
    }
  };

  if (loading) {
    return (
      <Box bg={bg} minH="100vh">
        <Navbar />
        <Center h="50vh">
          <Spinner size="xl" />
        </Center>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box bg={bg} minH="100vh">
        <Navbar />
        <Center h="50vh">
          <Text>Course not found</Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box bg={bg} minH="100vh">
      <Navbar />
      <Container maxW="6xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Course Header */}
          <Card bg={cardBg} shadow="lg">
            <CardBody>
              <HStack spacing={8} align="start">
                <Image
                  src={course.thumbnail || 'https://via.placeholder.com/400x250'}
                  alt={course.title}
                  rounded="lg"
                  w="400px"
                  h="250px"
                  objectFit="cover"
                />
                <VStack align="start" spacing={4} flex={1}>
                  <Heading size="lg">{course.title}</Heading>
                  <Text color="gray.600" fontSize="lg">
                    {course.description}
                  </Text>
                  
                  <HStack spacing={4}>
                    <Badge colorScheme="teal" fontSize="md" px={3} py={1}>
                      {course.price ? `₹${course.price}` : 'Free'}
                    </Badge>
                    <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                      {course.lectures?.length || 0} Lectures
                    </Badge>
                  </HStack>

                  <HStack spacing={6} color="gray.500">
                    <HStack>
                      <Icon as={FaUser} />
                      <Text>{course.createdBy?.name || 'Admin'}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaClock} />
                      <Text>Updated recently</Text>
                    </HStack>
                  </HStack>

                  <HStack spacing={4}>
                    <Button
                      size="lg"
                      colorScheme="teal"
                      leftIcon={enrolled ? <FaPlay /> : <FaBook />}
                      onClick={enrolled ? handleStartLearning : () => onPayment(course.price, course.title)}
                      isLoading={enrolling}
                      loadingText={enrolled ? "Starting..." : "Enrolling..."}
                      w="200px"
                    >
                      {enrolled ? 'Start Learning' : 'Enroll Now'}
                    </Button>
                    {enrolled && (
                      <Button
                        size="lg"
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => navigate(`/course/${id}/quizzes`)}
                      >
                        Quizzes
                      </Button>
                    )}
                    {enrolled && (
                      <Button
                        size="lg"
                        colorScheme="purple"
                        variant="outline"
                        onClick={() => navigate(`/course/${id}/assignments`)}
                      >
                        Assignments
                      </Button>
                    )}
                    {enrolled && (
                      <Button
                        size="lg"
                        colorScheme="orange"
                        variant="outline"
                        onClick={() => navigate(`/course/${id}/forums`)}
                      >
                        Forums
                      </Button>
                    )}
                  </HStack>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          {/* Course Content */}
          <Card bg={cardBg} shadow="lg">
            <CardHeader>
              <Heading size="md">Course Content</Heading>
            </CardHeader>
            <CardBody>
              {course.lectures && course.lectures.length > 0 ? (
                <VStack spacing={4} align="stretch">
                  {course.lectures.map((lecture, index) => (
                    <HStack
                      key={lecture._id}
                      p={4}
                      border="1px"
                      borderColor="gray.200"
                      rounded="md"
                      justify="space-between"
                      _hover={{ bg: 'gray.50' }}
                    >
                      <HStack>
                        <Icon as={FaPlay} color="teal.500" />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">Lecture {index + 1}: {lecture.title}</Text>
                          <Text fontSize="sm" color="gray.500">Video • 15 min</Text>
                        </VStack>
                      </HStack>
                      {enrolled && (
                        <Button size="sm" colorScheme="teal" variant="outline">
                          Watch
                        </Button>
                      )}
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <Text color="gray.500">No lectures available yet.</Text>
              )}
            </CardBody>
          </Card>

          {/* Course Syllabus */}
          {course.syllabus && (
            <Card bg={cardBg} shadow="lg">
              <CardHeader>
                <Heading size="md">Syllabus</Heading>
              </CardHeader>
              <CardBody>
                <Text whiteSpace="pre-wrap">{course.syllabus}</Text>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default CourseDetail; 