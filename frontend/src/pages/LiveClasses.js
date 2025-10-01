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
  Image,
  Divider,
  Avatar,
  AvatarGroup,
  Progress,
  IconButton,
  Tooltip,
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
  FaPlus,
  FaRocket,
  FaStar,
  FaGraduationCap,
  FaMicrophone,
  FaEye,
  FaHeart,
  FaShare,
  FaBookmark,
  FaCrown,
  FaTrophy,
  FaMedal,
  FaFire,
  FaSparkles,
  FaMagic,
  FaSpinner
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CreateLiveClassModal from '../components/CreateLiveClassModal';
import { liveClassApi } from '../utils/api';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const LiveClasses = () => {
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const { user, token, apiBaseUrl } = useAuth();
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
      const response = await fetch(`${apiBaseUrl}/api/live-classes/${liveClass._id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: 'Joined live class successfully!',
          status: 'success',
        });

        // If server provided a meetingUrl (e.g., Google Meet), open it directly
        if (data?.meetingUrl) {
          window.open(data.meetingUrl, '_blank', 'noopener,noreferrer');
          return;
        }

        // Fallback: navigate to in-app live classroom
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
      const response = await fetch(`${apiBaseUrl}/api/live-classes/${liveClass._id}/start`, {
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
      const response = await fetch(`${apiBaseUrl}/api/live-classes/${liveClass._id}/end`, {
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

  const getStatusGradient = (status) => {
    switch (status) {
      case 'scheduled': return 'gradients.primary';
      case 'live': return 'gradients.success';
      case 'ended': return 'gradients.dark';
      case 'cancelled': return 'gradients.danger';
      default: return 'gradients.dark';
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
    return Boolean(user && liveClass?.instructor?._id === user.id);
  };

  const isEnrolled = (liveClass) => {
    return Boolean(
      user && Array.isArray(liveClass?.enrolledStudents) &&
      liveClass.enrolledStudents.some((student) => student?._id === user.id)
    );
  };

  const upcomingClasses = liveClasses.filter(c => 
    c.status === 'scheduled' || c.status === 'live'
  );
  const pastClasses = liveClasses.filter(c => c.status === 'ended');
  const myClasses = liveClasses.filter(c => isInstructor(c));

  if (loading) {
    return (
      <Box bg="white" minH="100vh">
        <Navbar />
        <Center h="50vh">
          <VStack spacing={6}>
            <Spinner size="xl" color="teal.500" thickness="4px" />
            <Text fontSize="xl" fontWeight="bold" color="brand.text">
              Loading Live Classes...
            </Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box bg="white" minH="100vh" position="relative" overflow="hidden">
      <Navbar />
      <Container maxW="7xl" py={8} position="relative" zIndex={1}>
        <VStack spacing={12} align="stretch">
          {/* Enhanced Header */}
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Flex justify="space-between" align="center" mb={8}>
              <VStack align="start" spacing={4}>
                <HStack spacing={4}>
                  <Box
                    w="60px"
                    h="60px"
                    bg="teal.500"
                    borderRadius="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="neon-blue"
                  >
                    <Icon as={FaVideo} boxSize={6} color="white" />
                  </Box>
                  <Box>
                    <Heading size="xl" color="brand.text" fontWeight="extrabold" letterSpacing="wide">
                      Live Classes
                    </Heading>
                    <Text fontSize="xl" color="gray.700" opacity={1} fontWeight="medium">
                      Join real-time learning sessions with expert instructors
                    </Text>
                  </Box>
                </HStack>
                <HStack spacing={6} color="gray.600">
                  <HStack>
                    <Icon as={FaRocket} />
                    <Text>Interactive Learning</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaStar} />
                    <Text>Expert Instructors</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaGraduationCap} />
                    <Text>Real-time Q&A</Text>
                  </HStack>
                </HStack>
              </VStack>

            </Flex>
          </MotionBox>

          {/* Enhanced Tabs */}
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card p={6}>
              <Tabs value={activeTab} onChange={setActiveTab} colorScheme="teal">
                <TabList bg="transparent" border="none">
                  <Tab 
                    _selected={{ 
                      bg: "teal.500", 
                      color: "white",
                      transform: "translateY(-2px)"
                    }}
                    borderRadius="xl"
                    fontWeight="semibold"
                    transition="all 0.3s"
                  >
                    <HStack spacing={2}>
                      <Icon as={FaRocket} />
                      <Text color="white">Upcoming Classes</Text>
                    </HStack>
                  </Tab>
                  <Tab 
                    _selected={{ 
                      bg: "gray.800", 
                      color: "white",
                      transform: "translateY(-2px)"
                    }}
                    borderRadius="xl"
                    fontWeight="semibold"
                    transition="all 0.3s"
                  >
                    <HStack spacing={2}>
                      <Icon as={FaClock} />
                      <Text color="white">Past Classes</Text>
                    </HStack>
                  </Tab>
                  {user && (
                    <Tab 
                      _selected={{ 
                        bg: "green.500", 
                        color: "white",
                        transform: "translateY(-2px)"
                      }}
                      borderRadius="xl"
                      fontWeight="semibold"
                      transition="all 0.3s"
                    >
                      <HStack spacing={2}>
                        <Icon as={FaCrown} />
                        <Text>My Classes</Text>
                      </HStack>
                    </Tab>
                  )}
                </TabList>

                <TabPanels>
                  {/* Upcoming Classes */}
                  <TabPanel>
                    {upcomingClasses.length === 0 ? (
                      <Center py={16}>
                        <VStack spacing={6}>
                          <VStack spacing={2}>
                            <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                              No upcoming live classes
                            </Text>
                            <Text color="gray.500" textAlign="center">
                              Check back later for new interactive learning sessions
                            </Text>
                          </VStack>
                        </VStack>
                      </Center>
                    ) : (
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} pt={6}>
                        {upcomingClasses.map((liveClass, index) => (
                          <MotionBox
                            key={liveClass._id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1, type: 'spring', stiffness: 300 }}
                            whileHover={{ 
                              scale: 1.03,
                              rotateY: 5,
                              rotateX: 5
                            }}
                          >
                            <Card variant="3d" h="full">
                              {/* Status Header */}
                              <Box
                                bg={getStatusGradient(liveClass.status)}
                                p={4}
                                position="relative"
                                overflow="hidden"
                              >
                                <Box
                                  position="absolute"
                                  top="-50%"
                                  right="-50%"
                                  w="100px"
                                  h="100px"
                                  bg="white"
                                  opacity="0.1"
                                  borderRadius="full"
                                />
                                <HStack justify="space-between" align="center">
                                  <Badge variant="neon" fontSize="sm">
                                    {liveClass.status === 'live' && <Icon as={FaFire} mr={1} />}
                                    {liveClass.status.toUpperCase()}
                                  </Badge>
                                  <HStack spacing={2}>
                                    <Icon as={FaClock} color="white" />
                                    <Text color="white" fontWeight="semibold">
                                      {liveClass.duration} min
                                    </Text>
                                  </HStack>
                                </HStack>
                              </Box>

                              <CardBody p={6}>
                                <VStack spacing={4} align="stretch">
                                  {/* Title and Description */}
                                  <Box>
                                    <Heading size="md" mb={2} noOfLines={2} color="gray.800">
                                      {liveClass.title}
                                    </Heading>
                                    <Text color="gray.600" fontSize="sm" noOfLines={3}>
                                      {liveClass.description}
                                    </Text>
                                  </Box>

                                  <Divider />

                                  {/* Instructor and Students */}
                                  <VStack spacing={3} align="stretch">
                                    <HStack justify="space-between">
                                      <HStack>
                                        <Avatar size="sm" name={liveClass.instructor?.name || 'Unknown Instructor'} />
                                        <VStack align="start" spacing={0}>
                                          <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                                            {liveClass.instructor?.name || 'Unknown Instructor'}
                                          </Text>
                                          <Text fontSize="xs" color="gray.500">
                                            Instructor
                                          </Text>
                                        </VStack>
                                      </HStack>
                                      <HStack>
                                        <Icon as={FaUsers} color="neon.blue" />
                                        <Text fontSize="sm" color="gray.600">
                                          {liveClass.enrolledStudents?.length || 0} enrolled
                                        </Text>
                                      </HStack>
                                    </HStack>

                                    {/* Schedule */}
                                    <HStack justify="space-between" p={3} bg="gray.50" borderRadius="lg">
                                      <HStack>
                                        <Icon as={FaCalendar} color="neon.purple" />
                                        <Text fontSize="sm" color="gray.700">
                                          {formatDateTime(liveClass.scheduledAt || 'N/A')}
                                        </Text>
                                      </HStack>
                                      {liveClass.allowChat && (
                                        <Tooltip label="Chat enabled">
                                          <Icon as={FaComments} color="neon.green" />
                                        </Tooltip>
                                      )}
                                    </HStack>
                                  </VStack>

                                  <Divider />

                                  {/* Course Info */}
                                  <HStack justify="space-between">
                                    <Text fontSize="sm" fontWeight="medium" color="neon.blue">
                                      {liveClass.course?.title || 'N/A'}
                                    </Text>
                                    {liveClass.status === 'live' && (
                                      <Box
                                        w="8px"
                                        h="8px"
                                        bg="neon.green"
                                        borderRadius="full"
                                        animation="pulse 2s infinite"
                                      />
                                    )}
                                  </HStack>

                                  {/* Action Buttons */}
                                  <VStack spacing={3}>
                                    {isInstructor(liveClass) ? (
                                      <HStack spacing={3} w="full">
                                        {liveClass.status === 'scheduled' && (
                                          <Button
                                            size="sm"
                                            colorScheme="teal"
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
                                          colorScheme="teal"
                                          onClick={() => navigate(`/live-class/${liveClass._id}`)}
                                          flex={1}
                                        >
                                          Manage
                                        </Button>
                                      </HStack>
                                    ) : (
                                      <HStack spacing={3} w="full">
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
                                            colorScheme="teal"
                                            onClick={() => handleJoinClass(liveClass)}
                                            flex={1}
                                          >
                                            Join Now
                                          </Button>
                                        )}
                                      </HStack>
                                    )}
                                  </VStack>
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
                      <Center py={16}>
                        <VStack spacing={6}>
                          <Box
                            w="120px"
                            h="120px"
                            bg="gradients.dark"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            boxShadow="neon-purple"
                          >
                            <Icon as={FaClock} boxSize={12} color="white" />
                          </Box>
                          <VStack spacing={2}>
                            <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                              No past live classes
                            </Text>
                            <Text color="gray.500" textAlign="center">
                              Completed sessions will appear here
                            </Text>
                          </VStack>
                        </VStack>
                      </Center>
                    ) : (
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} pt={6}>
                        {pastClasses.map((liveClass, index) => (
                          <MotionBox
                            key={liveClass._id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <Card variant="3d" h="full" opacity={0.8}>
                              {/* Status Header */}
                              <Box
                                bg="gradients.dark"
                                p={4}
                                position="relative"
                                overflow="hidden"
                              >
                                <HStack justify="space-between" align="center">
                                  <Badge variant="3d" colorScheme="gray" fontSize="sm">
                                    <Icon as={FaTrophy} mr={1} />
                                    ENDED
                                  </Badge>
                                  <HStack spacing={2}>
                                    <Icon as={FaClock} color="white" />
                                    <Text color="white" fontWeight="semibold">
                                      {liveClass.duration} min
                                    </Text>
                                  </HStack>
                                </HStack>
                              </Box>

                              <CardBody p={6}>
                                <VStack spacing={4} align="stretch">
                                  {/* Title and Description */}
                                  <Box>
                                    <Heading size="md" mb={2} noOfLines={2} color="gray.800">
                                      {liveClass.title}
                                    </Heading>
                                    <Text color="gray.600" fontSize="sm" noOfLines={3}>
                                      {liveClass.description}
                                    </Text>
                                  </Box>

                                  <Divider />

                                  {/* Instructor and Attendance */}
                                  <VStack spacing={3} align="stretch">
                                    <HStack justify="space-between">
                                      <HStack>
                                        <Avatar size="sm" name={liveClass.instructor?.name || 'Unknown Instructor'} />
                                        <VStack align="start" spacing={0}>
                                          <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                                            {liveClass.instructor?.name || 'Unknown Instructor'}
                                          </Text>
                                          <Text fontSize="xs" color="gray.500">
                                            Instructor
                                          </Text>
                                        </VStack>
                                      </HStack>
                                      <HStack>
                                        <Icon as={FaUsers} color="neon.blue" />
                                        <Text fontSize="sm" color="gray.600">
                                          {liveClass.attendanceCount || 0} attended
                                        </Text>
                                      </HStack>
                                    </HStack>

                                    {/* Schedule */}
                                    <HStack justify="space-between" p={3} bg="gray.50" borderRadius="lg">
                                      <HStack>
                                        <Icon as={FaCalendar} color="neon.purple" />
                                        <Text fontSize="sm" color="gray.700">
                                          {formatDateTime(liveClass.scheduledAt || 'N/A')}
                                        </Text>
                                      </HStack>
                                      {liveClass.isRecorded && (
                                        <Tooltip label="Recording available">
                                          <Icon as={FaEye} color="neon.green" />
                                        </Tooltip>
                                      )}
                                    </HStack>
                                  </VStack>

                                  <Divider />

                                  {/* Course Info */}
                                  <HStack justify="space-between">
                                    <Text fontSize="sm" fontWeight="medium" color="neon.blue">
                                      {liveClass.course?.title || 'N/A'}
                                    </Text>
                                    {liveClass.isRecorded && (
                                      <Badge variant="neon" colorScheme="purple" size="sm">
                                        Recorded
                                      </Badge>
                                    )}
                                  </HStack>

                                  {/* Action Button */}
                                  <Button
                                    size="sm"
                                    variant="glass"
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
                        <Center py={16}>
                          <VStack spacing={6}>
                            <Box
                              w="120px"
                              h="120px"
                              bg="gradients.success"
                              borderRadius="full"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              boxShadow="neon-green"
                            >
                              <Icon as={FaCrown} boxSize={12} color="white" />
                            </Box>
                            <VStack spacing={2}>
                              <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                                No classes created yet
                              </Text>
                              <Text color="gray.500" textAlign="center">
                                Create your first live class to get started
                              </Text>
                            </VStack>
                            <Button
                              variant="3d-primary"
                              onClick={() => setShowCreateModal(true)}
                              boxShadow="neon-green"
                              _hover={{
                                boxShadow: "neon-green",
                                transform: "translateY(-2px)",
                              }}
                            >
                              Create Live Class
                            </Button>
                          </VStack>
                        </Center>
                      ) : (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} pt={6}>
                          {myClasses.map((liveClass, index) => (
                            <MotionBox
                              key={liveClass._id}
                              initial={{ opacity: 0, y: 50 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6, delay: index * 0.1 }}
                              whileHover={{ scale: 1.03 }}
                            >
                              <Card variant="gradient" h="full">
                                {/* Status Header */}
                                <Box
                                  bg={getStatusGradient(liveClass.status)}
                                  p={4}
                                  position="relative"
                                  overflow="hidden"
                                >
                                  <Box
                                    position="absolute"
                                    top="-50%"
                                    right="-50%"
                                    w="100px"
                                    h="100px"
                                    bg="white"
                                    opacity="0.1"
                                    borderRadius="full"
                                  />
                                  <HStack justify="space-between" align="center">
                                    <Badge variant="neon" fontSize="sm">
                                      {liveClass.status === 'live' && <Icon as={FaFire} mr={1} />}
                                      {liveClass.status.toUpperCase()}
                                    </Badge>
                                    <HStack spacing={2}>
                                      <Icon as={FaClock} color="white" />
                                      <Text color="white" fontWeight="semibold">
                                        {liveClass.duration} min
                                      </Text>
                                    </HStack>
                                  </HStack>
                                </Box>

                                <CardBody p={6}>
                                  <VStack spacing={4} align="stretch">
                                    {/* Title and Description */}
                                    <Box>
                                      <Heading size="md" mb={2} noOfLines={2} color="white">
                                        {liveClass.title}
                                      </Heading>
                                      <Text color="white" opacity={0.9} fontSize="sm" noOfLines={3}>
                                        {liveClass.description}
                                      </Text>
                                    </Box>

                                    <Divider borderColor="white" opacity={0.2} />

                                    {/* Students and Schedule */}
                                    <VStack spacing={3} align="stretch">
                                      <HStack justify="space-between">
                                        <HStack>
                                          <Icon as={FaUsers} color="white" />
                                          <Text fontSize="sm" color="white">
                                            {liveClass.enrolledStudents?.length || 0} enrolled
                                          </Text>
                                        </HStack>
                                        <HStack>
                                          <Icon as={FaCalendar} color="white" />
                                          <Text fontSize="sm" color="white">
                                            {formatDateTime(liveClass.scheduledAt || 'N/A')}
                                          </Text>
                                        </HStack>
                                      </HStack>
                                    </VStack>

                                    <Divider borderColor="white" opacity={0.2} />

                                    {/* Course Info */}
                                    <Text fontSize="sm" fontWeight="medium" color="white" opacity={0.9}>
                                      {liveClass.course?.title || 'N/A'}
                                    </Text>

                                    {/* Action Buttons */}
                                    <HStack spacing={3}>
                                      {liveClass.status === 'scheduled' && (
                                        <Button
                                          size="sm"
                                          variant="3d"
                                          leftIcon={<FaPlay />}
                                          onClick={() => handleStartClass(liveClass)}
                                          flex={1}
                                          bg="white"
                                          color="gray.800"
                                          _hover={{
                                            transform: "translateY(-2px)",
                                          }}
                                        >
                                          Start Class
                                        </Button>
                                      )}
                                      {liveClass.status === 'live' && (
                                        <Button
                                          size="sm"
                                          variant="3d"
                                          leftIcon={<FaStop />}
                                          onClick={() => handleEndClass(liveClass)}
                                          flex={1}
                                          bg="white"
                                          color="red.600"
                                          _hover={{
                                            transform: "translateY(-2px)",
                                          }}
                                        >
                                          End Class
                                        </Button>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="glass"
                                        onClick={() => navigate(`/live-class/${liveClass._id}`)}
                                        flex={1}
                                        bg="white"
                                        color="gray.800"
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
            </Card>
          </MotionBox>
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