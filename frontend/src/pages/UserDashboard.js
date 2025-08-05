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
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { FaPlay, FaBook, FaChartLine } from 'react-icons/fa';
import Navbar from '../components/Navbar';

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
      const response = await fetch('/api/enrollments/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('lms_token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Center h="50vh">
          <Spinner size="xl" />
        </Center>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box minH="100vh" py={8} bgGradient="linear(to-br, gray.900, teal.700)">
        <Container maxW="6xl">
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <Box textAlign="center" bg="rgba(255,255,255,0.15)" boxShadow="0 8px 32px 0 rgba(31,38,135,0.37)" backdropFilter="blur(8px)" borderRadius="2xl" border="1px solid rgba(255,255,255,0.18)" p={8}>
              <Heading size="lg" mb={2} color="teal.300" fontWeight="extrabold" letterSpacing="wide">
                Welcome back, {user?.name}!
              </Heading>
              <Text color="gray.100">
                Continue your learning journey
              </Text>
            </Box>

            {/* Stats */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <Card bg="rgba(255,255,255,0.25)" boxShadow="xl" backdropFilter="blur(6px)" borderRadius="xl" border="1px solid rgba(255,255,255,0.18)">
                <CardBody textAlign="center">
                  <FaBook size="2em" color="#3182CE" />
                  <Heading size="md" mt={2} color="teal.700">
                    {enrollments.length}
                  </Heading>
                  <Text color="gray.700">Enrolled Courses</Text>
                </CardBody>
              </Card>
              <Card bg="rgba(255,255,255,0.25)" boxShadow="xl" backdropFilter="blur(6px)" borderRadius="xl" border="1px solid rgba(255,255,255,0.18)">
                <CardBody textAlign="center">
                  <FaPlay size="2em" color="#38A169" />
                  <Heading size="md" mt={2} color="teal.700">
                    {enrollments.filter(e => e.progress > 0).length}
                  </Heading>
                  <Text color="gray.700">Active Courses</Text>
                </CardBody>
              </Card>
              <Card bg="rgba(255,255,255,0.25)" boxShadow="xl" backdropFilter="blur(6px)" borderRadius="xl" border="1px solid rgba(255,255,255,0.18)">
                <CardBody textAlign="center">
                  <FaChartLine size="2em" color="#D69E2E" />
                  <Heading size="md" mt={2} color="teal.700">
                    {enrollments.length > 0 
                      ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
                      : 0}%
                  </Heading>
                  <Text color="gray.700">Average Progress</Text>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Enrolled Courses */}
            <Box>
              <Heading size="md" mb={6} color="white">
                My Courses
              </Heading>
              {enrollments.length === 0 ? (
                <Card bg="rgba(255,255,255,0.25)" boxShadow="xl" backdropFilter="blur(6px)" borderRadius="xl" border="1px solid rgba(255,255,255,0.18)">
                  <CardBody textAlign="center" py={12}>
                    <Text color="gray.200" mb={4}>
                      You haven't enrolled in any courses yet.
                    </Text>
                    <Button colorScheme="blue" onClick={() => window.location.href = '/'}>
                      Browse Courses
                    </Button>
                  </CardBody>
                </Card>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {enrollments.map((enrollment) => (
                    <Card key={enrollment._id} bg="rgba(255,255,255,0.25)" boxShadow="xl" backdropFilter="blur(6px)" borderRadius="xl" border="1px solid rgba(255,255,255,0.18)">
                      <CardHeader>
                        <Heading size="md" color="teal.700">{enrollment.course?.title}</Heading>
                        <Badge colorScheme="blue" mt={2}>
                          {enrollment.course?.price ? `₹${enrollment.course.price}` : 'Free'}
                        </Badge>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          <Box>
                            <Text fontSize="sm" color="gray.700" mb={2}>
                              Progress
                            </Text>
                            <Progress 
                              value={enrollment.progress || 0} 
                              colorScheme="blue" 
                              size="lg"
                            />
                            <Text fontSize="sm" mt={1} color="gray.700">
                              {enrollment.progress || 0}% Complete
                            </Text>
                          </Box>
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.700">
                              Enrolled: {new Date(enrollment.createdAt).toLocaleDateString()}
                            </Text>
                            <Button 
                              size="sm" 
                              colorScheme="blue"
                              onClick={() => navigate(`/course/${enrollment.course._id}/learn`)}
                            >
                              Continue
                            </Button>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default UserDashboard; 