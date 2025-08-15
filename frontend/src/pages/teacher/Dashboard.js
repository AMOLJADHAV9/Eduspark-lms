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
  Button
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
  FaComments
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import Navbar from '../../components/Navbar';

const StatCard = ({ label, value, icon: IconComponent, color, helpText }) => {
  // Safety check to ensure all props are valid
  if (!label || !IconComponent || !color) {
    return null;
  }

  return (
    <Card
      bg="white"
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.200"
      _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)' }}
      transition="all 0.3s ease"
    >
      <CardBody>
        <HStack spacing={4}>
          <Box
            p={3}
            bg={`${color}.500`}
            borderRadius="lg"
            color="white"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
          >
            <IconComponent size={24} />
          </Box>
          <VStack align="start" spacing={1}>
            <Stat>
              <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">{label}</StatLabel>
              <StatNumber color="gray.800" fontSize="2xl" fontWeight="bold">{value || 0}</StatNumber>
              {helpText && <StatHelpText color="gray.500" fontSize="xs">{helpText}</StatHelpText>}
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
            title: 'JavaScript Fundamentals',
            students: 25,
            progress: 85,
            rating: 4.9
          },
          {
            id: 2,
            title: 'React Development',
            students: 18,
            progress: 72,
            rating: 4.7
          },
          {
            id: 3,
            title: 'Node.js Backend',
            students: 12,
            progress: 60,
            rating: 4.6
          }
        ],
        recentStudents: [
          { id: 1, name: 'John Doe', course: 'JavaScript Fundamentals', progress: 85 },
          { id: 2, name: 'Jane Smith', course: 'React Development', progress: 72 },
          { id: 3, name: 'Mike Johnson', course: 'Node.js Backend', progress: 60 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Flex minH="100vh" bg="gray.50">
          <TeacherSidebar />
          <Box flex={1} p={8}>
            <Center h="50vh">
              <Spinner size="xl" color="blue.500" />
            </Center>
          </Box>
        </Flex>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Flex minH="100vh" bg="gray.50">
        <TeacherSidebar />
        <Box flex={1} p={8}>
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <Box
              bg="white"
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
              borderRadius="2xl"
              border="1px solid"
              borderColor="gray.200"
              p={8}
            >
              <VStack spacing={4} align="start">
                <Heading color="blue.600" fontSize="3xl" fontWeight="extrabold">
                  Welcome back, {user?.name}!
                </Heading>
                <Text color="gray.600" fontSize="lg">
                  Here's what's happening with your courses today
                </Text>
              </VStack>
            </Box>

            {/* Stats Grid */}
            {dashboardData && (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                <StatCard
                  label="Total Courses"
                  value={dashboardData?.stats?.totalCourses || 0}
                  icon={FaBook}
                  color="blue"
                  helpText="Active courses"
                />
                <StatCard
                  label="Total Students"
                  value={dashboardData?.stats?.totalStudents || 0}
                  icon={FaUsers}
                  color="green"
                  helpText="Enrolled students"
                />
                <StatCard
                  label="Total Earnings"
                  value={`$${dashboardData?.stats?.totalEarnings || 0}`}
                  icon={FaDollarSign}
                  color="purple"
                  helpText="This month"
                />
                <StatCard
                  label="Average Rating"
                  value={dashboardData?.stats?.averageRating || 0}
                  icon={FaStar}
                  color="yellow"
                  helpText="Student feedback"
                />
              </SimpleGrid>
            )}

            {/* Recent Courses */}
            <Card bg="white" boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)" borderRadius="xl" border="1px solid" borderColor="gray.200">
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md" color="gray.800">Recent Courses</Heading>
                  <Button size="sm" colorScheme="blue" variant="outline">
                    View All
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {dashboardData?.recentCourses?.map((course) => (
                    <Box
                      key={course.id}
                      p={4}
                      bg="gray.50"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{ bg: 'gray.100' }}
                      transition="all 0.2s ease"
                    >
                      <HStack justify="space-between" mb={3}>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold" color="gray.800">
                            {course.title}
                          </Text>
                          <HStack spacing={4}>
                            <Text fontSize="sm" color="gray.600">
                              {course.students} students
                            </Text>
                            <HStack spacing={1}>
                              <Icon as={FaStar} color="yellow.500" boxSize={3} />
                              <Text fontSize="sm" color="gray.600">
                                {course.rating}
                              </Text>
                            </HStack>
                          </HStack>
                        </VStack>
                        <Badge colorScheme="green" variant="solid">
                          {course.progress}% Complete
                        </Badge>
                      </HStack>
                      <Progress value={course.progress} colorScheme="blue" size="sm" />
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card bg="white" boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)" borderRadius="xl" border="1px solid" borderColor="gray.200">
                <CardHeader>
                  <Heading size="md" color="gray.800">Quick Actions</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Button leftIcon={<FaBook />} colorScheme="blue" variant="solid" size="lg" _hover={{ transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }} transition="all 0.2s ease">
                      Create New Course
                    </Button>
                    <Button leftIcon={<FaVideo />} colorScheme="green" variant="solid" size="lg" _hover={{ transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)' }} transition="all 0.2s ease">
                      Schedule Live Class
                    </Button>
                    <Button leftIcon={<FaFileAlt />} colorScheme="yellow" variant="solid" size="lg" _hover={{ transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(234, 179, 8, 0.4)' }} transition="all 0.2s ease">
                      Add Assignment
                    </Button>
                    <Button leftIcon={<FaComments />} colorScheme="red" variant="solid" size="lg" _hover={{ transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)' }} transition="all 0.2s ease">
                      Create Quiz
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="white" boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)" borderRadius="xl" border="1px solid" borderColor="gray.200">
                <CardHeader>
                  <Heading size="md" color="gray.800">Recent Students</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {dashboardData?.recentStudents?.map((student) => (
                      <HStack key={student.id} justify="space-between" p={3} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200" _hover={{ bg: 'gray.100' }} transition="all 0.2s ease">
                        <HStack spacing={3}>
                          <Avatar size="sm" name={student.name} />
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" color="gray.800" fontSize="sm">
                              {student.name}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {student.course}
                            </Text>
                          </VStack>
                        </HStack>
                        <Badge colorScheme="green" variant="solid">
                          {student.progress}%
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        </Box>
      </Flex>
    </>
  );
};

export default TeacherDashboard; 