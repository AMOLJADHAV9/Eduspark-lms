import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Button,
  useColorModeValue,
  Spinner,
  Center,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  FaVideo, 
  FaClock, 
  FaUser, 
  FaCalendar, 
  FaPlay, 
  FaStop,
  FaUsers,
  FaComments,
  FaEdit,
  FaPlus
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CreateLiveClassModal from '../components/CreateLiveClassModal';
import { liveClassApi } from '../utils/api';

const MotionBox = motion(Box);

const LiveClasses = () => {
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const toast = useToast();
  
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      const data = await liveClassApi.getAll();
      setLiveClasses(data);
    } catch (error) {
      console.error('Error fetching live classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (liveClass) => {
    try {
      const response = await fetch(`/api/live-classes/${liveClass._id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Joined live class successfully!',
          status: 'success',
        });
        
        // Navigate to live class room
        navigate(`/live-class/${liveClass._id}`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join live class',
        status: 'error',
      });
    }
  };

  const handleStartClass = async (liveClass) => {
    try {
      const response = await fetch(`/api/live-classes/${liveClass._id}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Live class started!',
          status: 'success',
        });
        fetchLiveClasses(); // Refresh the list
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start live class',
        status: 'error',
      });
    }
  };

  const handleEndClass = async (liveClass) => {
    try {
      const response = await fetch(`/api/live-classes/${liveClass._id}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Live class ended!',
          status: 'success',
        });
        fetchLiveClasses(); // Refresh the list
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end live class',
        status: 'error',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'blue';
      case 'live': return 'green';
      case 'ended': return 'gray';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isInstructor = (liveClass) => {
    return user && liveClass.instructor._id === user.id;
  };

  const isEnrolled = (liveClass) => {
    return user && liveClass.enrolledStudents.some(student => student._id === user.id);
  };

  const upcomingClasses = liveClasses.filter(c => 
    c.status === 'scheduled' || c.status === 'live'
  );
  const pastClasses = liveClasses.filter(c => c.status === 'ended');
  const myClasses = liveClasses.filter(c => isInstructor(c));

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

  return (
    <Box bg={bg} minH="100vh">
      <Navbar />
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="2xl" mb={2} color="teal.600">
                Live Classes
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Join real-time learning sessions with expert instructors
              </Text>
            </Box>
            {user && (
              <Button
                leftIcon={<FaPlus />}
                colorScheme="teal"
                size="lg"
                onClick={() => setShowCreateModal(true)}
              >
                Create Live Class
              </Button>
            )}
          </Flex>

          {/* Tabs */}
          <Tabs value={activeTab} onChange={setActiveTab} colorScheme="teal">
            <TabList>
              <Tab>Upcoming Classes</Tab>
              <Tab>Past Classes</Tab>
              {user && <Tab>My Classes</Tab>}
            </TabList>

            <TabPanels>
              {/* Upcoming Classes */}
              <TabPanel>
                {upcomingClasses.length === 0 ? (
                  <Center py={12}>
                    <VStack spacing={4}>
                      <Icon as={FaVideo} boxSize={12} color="gray.400" />
                      <Text fontSize="xl" color="gray.500">No upcoming live classes</Text>
                      <Text color="gray.400">Check back later for new sessions</Text>
                    </VStack>
                  </Center>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {upcomingClasses.map(liveClass => (
                      <MotionBox
                        key={liveClass._id}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        bg={cardBg}
                        rounded="xl"
                        shadow="lg"
                        overflow="hidden"
                        _hover={{ shadow: 'xl' }}
                      >
                        <Card>
                          <CardHeader pb={2}>
                            <VStack align="start" spacing={2}>
                              <HStack justify="space-between" w="full">
                                <Badge colorScheme={getStatusColor(liveClass.status)}>
                                  {liveClass.status.toUpperCase()}
                                </Badge>
                                <Text fontSize="sm" color="gray.500">
                                  {liveClass.duration} min
                                </Text>
                              </HStack>
                              <Heading size="md" noOfLines={2}>
                                {liveClass.title}
                              </Heading>
                              <Text color="gray.600" fontSize="sm" noOfLines={2}>
                                {liveClass.description}
                              </Text>
                            </VStack>
                          </CardHeader>

                          <CardBody pt={0}>
                            <VStack spacing={4} align="stretch">
                              <HStack spacing={4} fontSize="sm" color="gray.500">
                                <HStack>
                                  <FaUser />
                                  <Text>{liveClass.instructor.name}</Text>
                                </HStack>
                                <HStack>
                                  <FaUsers />
                                  <Text>{liveClass.enrolledStudents.length} enrolled</Text>
                                </HStack>
                              </HStack>

                              <HStack spacing={4} fontSize="sm" color="gray.500">
                                <HStack>
                                  <FaCalendar />
                                  <Text>{formatDateTime(liveClass.scheduledAt)}</Text>
                                </HStack>
                              </HStack>

                              <HStack justify="space-between">
                                <Text fontSize="sm" fontWeight="medium" color="teal.600">
                                  {liveClass.course.title}
                                </Text>
                                {liveClass.allowChat && (
                                  <Icon as={FaComments} color="teal.500" />
                                )}
                              </HStack>

                              {/* Action Buttons */}
                              <HStack spacing={2}>
                                {isInstructor(liveClass) ? (
                                  <>
                                    {liveClass.status === 'scheduled' && (
                                      <Button
                                        size="sm"
                                        colorScheme="green"
                                        leftIcon={<FaPlay />}
                                        onClick={() => handleStartClass(liveClass)}
                                        flex={1}
                                      >
                                        Start Class
                                      </Button>
                                    )}
                                    {liveClass.status === 'live' && (
                                      <Button
                                        size="sm"
                                        colorScheme="red"
                                        leftIcon={<FaStop />}
                                        onClick={() => handleEndClass(liveClass)}
                                        flex={1}
                                      >
                                        End Class
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => navigate(`/live-class/${liveClass._id}`)}
                                      flex={1}
                                    >
                                      Manage
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      colorScheme="teal"
                                      leftIcon={<FaVideo />}
                                      onClick={() => handleJoinClass(liveClass)}
                                      flex={1}
                                      isDisabled={!user}
                                    >
                                      {isEnrolled(liveClass) ? 'Join Class' : 'Enroll'}
                                    </Button>
                                    {liveClass.status === 'live' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => navigate(`/live-class/${liveClass._id}`)}
                                        flex={1}
                                      >
                                        Join Now
                                      </Button>
                                    )}
                                  </>
                                )}
                              </HStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      </MotionBox>
                    ))}
                  </SimpleGrid>
                )}
              </TabPanel>

              {/* Past Classes */}
              <TabPanel>
                {pastClasses.length === 0 ? (
                  <Center py={12}>
                    <VStack spacing={4}>
                      <Icon as={FaClock} boxSize={12} color="gray.400" />
                      <Text fontSize="xl" color="gray.500">No past live classes</Text>
                      <Text color="gray.400">Completed sessions will appear here</Text>
                    </VStack>
                  </Center>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {pastClasses.map(liveClass => (
                      <MotionBox
                        key={liveClass._id}
                        bg={cardBg}
                        rounded="xl"
                        shadow="md"
                        overflow="hidden"
                      >
                        <Card>
                          <CardHeader pb={2}>
                            <VStack align="start" spacing={2}>
                              <HStack justify="space-between" w="full">
                                <Badge colorScheme="gray">ENDED</Badge>
                                <Text fontSize="sm" color="gray.500">
                                  {liveClass.duration} min
                                </Text>
                              </HStack>
                              <Heading size="md" noOfLines={2}>
                                {liveClass.title}
                              </Heading>
                              <Text color="gray.600" fontSize="sm" noOfLines={2}>
                                {liveClass.description}
                              </Text>
                            </VStack>
                          </CardHeader>

                          <CardBody pt={0}>
                            <VStack spacing={4} align="stretch">
                              <HStack spacing={4} fontSize="sm" color="gray.500">
                                <HStack>
                                  <FaUser />
                                  <Text>{liveClass.instructor.name}</Text>
                                </HStack>
                                <HStack>
                                  <FaUsers />
                                  <Text>{liveClass.attendanceCount || 0} attended</Text>
                                </HStack>
                              </HStack>

                              <HStack spacing={4} fontSize="sm" color="gray.500">
                                <HStack>
                                  <FaCalendar />
                                  <Text>{formatDateTime(liveClass.scheduledAt)}</Text>
                                </HStack>
                              </HStack>

                              <HStack justify="space-between">
                                <Text fontSize="sm" fontWeight="medium" color="teal.600">
                                  {liveClass.course.title}
                                </Text>
                                {liveClass.isRecorded && (
                                  <Badge colorScheme="purple" size="sm">Recorded</Badge>
                                )}
                              </HStack>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/live-class/${liveClass._id}`)}
                              >
                                View Details
                              </Button>
                            </VStack>
                          </CardBody>
                        </Card>
                      </MotionBox>
                    ))}
                  </SimpleGrid>
                )}
              </TabPanel>

              {/* My Classes */}
              {user && (
                <TabPanel>
                  {myClasses.length === 0 ? (
                    <Center py={12}>
                      <VStack spacing={4}>
                        <Icon as={FaEdit} boxSize={12} color="gray.400" />
                        <Text fontSize="xl" color="gray.500">No classes created yet</Text>
                        <Text color="gray.400">Create your first live class to get started</Text>
                        <Button
                          colorScheme="teal"
                          onClick={() => setShowCreateModal(true)}
                        >
                          Create Live Class
                        </Button>
                      </VStack>
                    </Center>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {myClasses.map(liveClass => (
                        <MotionBox
                          key={liveClass._id}
                          bg={cardBg}
                          rounded="xl"
                          shadow="lg"
                          overflow="hidden"
                        >
                          <Card>
                            <CardHeader pb={2}>
                              <VStack align="start" spacing={2}>
                                <HStack justify="space-between" w="full">
                                  <Badge colorScheme={getStatusColor(liveClass.status)}>
                                    {liveClass.status.toUpperCase()}
                                  </Badge>
                                  <Text fontSize="sm" color="gray.500">
                                    {liveClass.duration} min
                                  </Text>
                                </HStack>
                                <Heading size="md" noOfLines={2}>
                                  {liveClass.title}
                                </Heading>
                                <Text color="gray.600" fontSize="sm" noOfLines={2}>
                                  {liveClass.description}
                                </Text>
                              </VStack>
                            </CardHeader>

                            <CardBody pt={0}>
                              <VStack spacing={4} align="stretch">
                                <HStack spacing={4} fontSize="sm" color="gray.500">
                                  <HStack>
                                    <FaUsers />
                                    <Text>{liveClass.enrolledStudents.length} enrolled</Text>
                                  </HStack>
                                  <HStack>
                                    <FaCalendar />
                                    <Text>{formatDateTime(liveClass.scheduledAt)}</Text>
                                  </HStack>
                                </HStack>

                                <HStack justify="space-between">
                                  <Text fontSize="sm" fontWeight="medium" color="teal.600">
                                    {liveClass.course.title}
                                  </Text>
                                </HStack>

                                <HStack spacing={2}>
                                  {liveClass.status === 'scheduled' && (
                                    <Button
                                      size="sm"
                                      colorScheme="green"
                                      leftIcon={<FaPlay />}
                                      onClick={() => handleStartClass(liveClass)}
                                      flex={1}
                                    >
                                      Start Class
                                    </Button>
                                  )}
                                  {liveClass.status === 'live' && (
                                    <Button
                                      size="sm"
                                      colorScheme="red"
                                      leftIcon={<FaStop />}
                                      onClick={() => handleEndClass(liveClass)}
                                      flex={1}
                                    >
                                      End Class
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/live-class/${liveClass._id}`)}
                                    flex={1}
                                  >
                                    Manage
                                  </Button>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        </MotionBox>
                      ))}
                    </SimpleGrid>
                  )}
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
      <Footer />

      {/* Create Live Class Modal */}
      {showCreateModal && (
        <CreateLiveClassModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchLiveClasses();
          }}
        />
      )}
    </Box>
  );
};

export default LiveClasses; 