import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Progress,
  Badge,
  useToast,
  Spinner,
  Center,
  Icon,
  Button,
  useDisclosure,
  color
} from '@chakra-ui/react';
import {
  FaBook,
  FaUsers,
  FaDollarSign,
  FaStar,
  FaPlay,
  FaVideo,
  FaClipboardList,
  FaGraduationCap,
  FaFileAlt,
  FaComments,
  FaPlus
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import Navbar from '../../components/Navbar';

const StatCard = ({ label, value, icon: IconComponent }) => {
  if (!label || !IconComponent) return null;
  return (
    <Card bg="white" boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)" borderRadius="xl" border="1px solid" borderColor="gray.200" _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)' }} transition="all 0.3s ease">
      <CardBody>
        <HStack spacing={4}>
          <Box p={3} bg="teal.500" borderRadius="lg" color="white" boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"><IconComponent size={24} /></Box>
          <VStack align="start" spacing={1}>
            <Stat>
              <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">{label}</StatLabel>
              <StatNumber color="gray.800" fontSize="2xl" fontWeight="bold">{value || 0}</StatNumber>
            </Stat>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
};

const TeacherDashboard = () => {
  const { user, token, apiBaseUrl } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isOpen, onToggle, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/teacher/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await res.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching teacher dashboard data:', error);
      // Set mock data for development
      setDashboardData({
        stats: {
          totalCourses: 3,
          totalStudents: 45,
          totalEarnings: 1250,
          averageRating: 4.8,
          activeCourses: 2,
          totalLectures: 24,
          upcomingLiveClasses: 1,
          totalAssignments: 12
        },
        recentCourses: [
          {
            id: 1,
            title: 'Advanced Mathematics',
            students: 25,
            rating: 4.9,
            progress: 85
          },
          {
            id: 2,
            title: 'Physics Fundamentals',
            students: 18,
            rating: 4.7,
            progress: 72
          }
        ]
      });
    } finally {
      setLoading(false);
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
    <Box bg="white" minH="100vh">
      <Navbar />
      {/* <TeacherSidebar isOpen={isOpen} onToggle={onToggle} onClose={onClose}  style={{ marginTop: '62px',marginLeft: '-10px',backgroundColor: '#1d127d',color: 'white' }}/> */}
      <Flex minH="calc(100vh - 80px)" bg="gray.50">
      <TeacherSidebar isOpen={isOpen} onToggle={onToggle} onClose={onClose}/>
        <Box flex={1} p={{ base: 4, md: 8 }} overflowX="auto">
          <Box
            bg="white"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.200"
            p={{ base: 4, md: 8 }}
            mt={4}
            mx="auto"
            maxW="5xl"
          >
            <Heading color="teal.600" mb={8} textAlign="center" fontWeight="extrabold" letterSpacing="wide" fontSize={{ base: '2xl', md: '3xl' }}>
              Teacher Dashboard
            </Heading>
            
            {/* Stats Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
              <StatCard label="Total Courses" value={dashboardData?.stats?.totalCourses} icon={FaBook} />
              <StatCard label="Total Students" value={dashboardData?.stats?.totalStudents} icon={FaUsers} />
              <StatCard label="Total Earnings" value={`$${dashboardData?.stats?.totalEarnings}`} icon={FaDollarSign} />
              <StatCard label="Average Rating" value={dashboardData?.stats?.averageRating} icon={FaStar} />
            </SimpleGrid>

            {/* Additional Stats */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
              <StatCard label="Active Courses" value={dashboardData?.stats?.activeCourses} icon={FaPlay} />
              <StatCard label="Total Lectures" value={dashboardData?.stats?.totalLectures} icon={FaVideo} />
              <StatCard label="Upcoming Live Classes" value={dashboardData?.stats?.upcomingLiveClasses} icon={FaClipboardList} />
              <StatCard label="Total Assignments" value={dashboardData?.stats?.totalAssignments} icon={FaFileAlt} />
            </SimpleGrid>

            {/* Recent Courses */}
            {dashboardData?.recentCourses && dashboardData.recentCourses.length > 0 && (
              <Box>
                <Heading size="lg" mb={6} color="gray.700">Recent Courses</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {dashboardData.recentCourses.map((course) => (
                    <Card key={course.id} bg="white" boxShadow="0 2px 10px rgba(0, 0, 0, 0.1)" borderRadius="xl" border="1px solid" borderColor="gray.200">
                      <CardBody>
                        <VStack align="start" spacing={4}>
                          <Heading size="md" color="gray.800">{course.title}</Heading>
                          <HStack spacing={6} w="full">
                            <Stat>
                              <StatLabel color="gray.600" fontSize="sm">Students</StatLabel>
                              <StatNumber color="gray.800" fontSize="lg">{course.students}</StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel color="gray.600" fontSize="sm">Rating</StatLabel>
                              <StatNumber color="gray.800" fontSize="lg">{course.rating}</StatNumber>
                            </Stat>
                          </HStack>
                          <Box w="full">
                            <Text fontSize="sm" color="gray.600" mb={2}>Progress</Text>
                            <Progress value={course.progress} colorScheme="teal" borderRadius="full" size="lg" />
                            <Text fontSize="sm" color="gray.500" mt={1}>{course.progress}%</Text>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </Box>
            )}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default TeacherDashboard; 