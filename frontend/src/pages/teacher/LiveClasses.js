import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Badge,
  useToast,
  Spinner,
  Center,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Icon,
  Divider
} from '@chakra-ui/react';
import {
  FaVideo,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaPlay,
  FaEdit,
  FaTrash,
  FaPlus,
  FaPause
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';

const TeacherLiveClasses = () => {
  const { token, apiBaseUrl } = useAuth();
  const [liveClasses, setLiveClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: '',
    maxStudents: '',
    streamingPlatform: 'youtube',
    youtubeStreamUrl: '',
    zegoRoomId: '',
    meetingUrl: ''
  });
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLiveClasses();
    fetchCourses();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/live-classes/teacher`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch live classes');
      }
      
      const data = await res.json();
      setLiveClasses(data);
    } catch (error) {
      console.error('Error fetching live classes:', error);
      toast({
        title: 'Error loading live classes',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/courses/teacher`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedClass 
        ? `${apiBaseUrl}/api/live-classes/teacher/${selectedClass._id}`
        : `${apiBaseUrl}/api/live-classes/teacher`;
      
      const method = selectedClass ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Failed to save live class');
      }

      toast({
        title: 'Success',
        description: `Live class ${selectedClass ? 'updated' : 'created'} successfully`,
        status: 'success'
      });

      setIsModalOpen(false);
      setSelectedClass(null);
      setFormData({
        title: '',
        description: '',
        courseId: '',
        scheduledDate: '',
        scheduledTime: '',
        duration: '',
        maxStudents: '',
        streamingPlatform: 'youtube',
        youtubeStreamUrl: '',
        zegoRoomId: ''
      });
      fetchLiveClasses();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error'
      });
    }
  };

  const handleEdit = (liveClass) => {
    setSelectedClass(liveClass);
    setFormData({
      title: liveClass.title,
      description: liveClass.description,
      courseId: liveClass.courseId,
      scheduledDate: liveClass.scheduledDate?.split('T')[0] || '',
      scheduledTime: liveClass.scheduledTime || '',
      duration: liveClass.duration,
      maxStudents: liveClass.maxStudents,
      streamingPlatform: liveClass.streamingPlatform || 'youtube',
      youtubeStreamUrl: liveClass.youtubeStreamUrl || '',
      zegoRoomId: liveClass.zegoRoomId || '',
      meetingUrl: liveClass.meetingUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this live class?')) {
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/live-classes/teacher/${classId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to delete live class');
      }

      toast({
        title: 'Success',
        description: 'Live class deleted successfully',
        status: 'success'
      });

      fetchLiveClasses();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error'
      });
    }
  };

  const handleJoinLive = (liveClass) => {
    navigate(`/live-class/${liveClass._id}`);
  };

  const handleStartLiveStream = async (liveClass) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/live-classes/${liveClass._id}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to start live stream');
      }

      toast({
        title: 'Live Stream Started!',
        description: 'Your live class is now live and students can join.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh the live classes list
      fetchLiveClasses();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error'
      });
    }
  };

  const handleEndLiveStream = async (liveClass) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/live-classes/${liveClass._id}/end`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to end live stream');
      }

      toast({
        title: 'Live Stream Ended',
        description: 'Your live class has been ended.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      // Refresh the live classes list
      fetchLiveClasses();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error'
      });
    }
  };

  const getCourseName = (courseId) => {
    // Handle case where courseId might be an object
    const actualCourseId = typeof courseId === 'object' ? courseId._id : courseId;
    const course = courses.find(c => c._id === actualCourseId);
    return course ? course.title : 'Unknown Course';
  };

  const getStatusColor = (status) => {
    // Handle case where status might be an object
    const actualStatus = typeof status === 'object' && status !== null ? status.toString() : status;
    
    switch (actualStatus) {
      case 'scheduled': return 'blue';
      case 'live': return 'green';
      case 'completed': return 'gray';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const formatDateTime = (date, time) => {
    if (!date) return 'Not scheduled';
    
    // Handle case where date might be an object
    const actualDate = typeof date === 'object' && date !== null ? date.toString() : date;
    const actualTime = typeof time === 'object' && time !== null ? time.toString() : time;
    
    try {
      const dateObj = new Date(actualDate);
      if (isNaN(dateObj.getTime())) return 'Invalid date';
      
      const formattedDate = dateObj.toLocaleDateString();
      return actualTime ? `${formattedDate} at ${actualTime}` : formattedDate;
    } catch (error) {
      return 'Invalid date';
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
              <Spinner size="xl" color="green.500" />
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
              <HStack justify="space-between">
                <VStack align="start" spacing={2}>
                  <Heading color="green.600" fontSize="3xl" fontWeight="extrabold">
                    Live Classes
                  </Heading>
                  <Text color="gray.600" fontSize="lg">
                    Schedule and manage your live teaching sessions
                  </Text>
                </VStack>
                <Button
                  colorScheme="green"
                  leftIcon={<FaPlus />}
                  onClick={() => setIsModalOpen(true)}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)' }}
                  transition="all 0.2s ease"
                >
                  Schedule Class
                </Button>
              </HStack>
            </Box>

            {/* Live Classes Grid */}
            {liveClasses.length === 0 ? (
              <Box
                bg="white"
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.200"
                p={8}
                textAlign="center"
              >
                <VStack spacing={4}>
                  <Icon as={FaVideo} boxSize={12} color="gray.400" />
                  <Heading size="md" color="gray.800">
                    No Live Classes Yet
                  </Heading>
                  <Text color="gray.600">
                    Start by scheduling your first live class to interact with students.
                  </Text>
                  <Button
                    colorScheme="green"
                    leftIcon={<FaPlus />}
                    onClick={() => setIsModalOpen(true)}
                    _hover={{ transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)' }}
                    transition="all 0.2s ease"
                  >
                    Schedule First Class
                  </Button>
                </VStack>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {liveClasses.map((liveClass) => (
                  <Card
                    key={liveClass._id}
                    bg="white"
                    boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.200"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)' }}
                    transition="all 0.3s ease"
                    border="1px solid rgba(255, 255, 255, 0.18)"
                  >
                    <CardHeader>
                      <VStack spacing={3} align="start">
                        <HStack justify="space-between" w="full">
                          <Icon as={FaVideo} color="teal.300" boxSize={6} />
                          <Badge colorScheme={getStatusColor(liveClass.status)} variant="solid">
                            {typeof liveClass.status === 'string' ? liveClass.status : 'unknown'}
                          </Badge>
                        </HStack>
                        <VStack align="start" spacing={1}>
                          <Heading size="md" color="white">
                            {liveClass.title || 'Untitled Class'}
                          </Heading>
                          <Text color="gray.300" fontSize="sm">
                            {getCourseName(liveClass.courseId)}
                          </Text>
                          <Text color="gray.400" fontSize="xs">
                            {formatDateTime(liveClass.scheduledDate, liveClass.scheduledTime)}
                          </Text>
                        </VStack>
                      </VStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Text color="gray.200" fontSize="sm" noOfLines={3}>
                          {typeof liveClass.description === 'string' ? liveClass.description : 'No description available'}
                        </Text>
                        
                        <HStack justify="space-between" fontSize="sm" color="gray.400">
                          <HStack spacing={1}>
                            <Icon as={FaClock} boxSize={3} />
                            <Text>{typeof liveClass.duration === 'number' ? liveClass.duration : 0} min</Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Icon as={FaUsers} boxSize={3} />
                            <Text>{typeof liveClass.enrolledStudents === 'number' ? liveClass.enrolledStudents : 0}/{typeof liveClass.maxStudents === 'number' ? liveClass.maxStudents : 0} students</Text>
                          </HStack>
                        </HStack>
                        
                        <HStack spacing={2}>
                          {liveClass.status === 'scheduled' && (
                            <Button
                              size="sm"
                              colorScheme="green"
                              leftIcon={<FaPlay />}
                              onClick={() => handleStartLiveStream(liveClass)}
                            >
                              Start Live
                            </Button>
                          )}
                          {liveClass.status === 'live' && (
                            <>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                leftIcon={<FaPlay />}
                                onClick={() => handleJoinLive(liveClass)}
                              >
                                Join Live
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                leftIcon={<FaPause />}
                                onClick={() => handleEndLiveStream(liveClass)}
                              >
                                End Live
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            colorScheme="yellow"
                            variant="outline"
                            leftIcon={<FaEdit />}
                            onClick={() => handleEdit(liveClass)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            leftIcon={<FaTrash />}
                            onClick={() => handleDelete(liveClass._id)}
                          >
                            Delete
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </VStack>
        </Box>
      </Flex>

      {/* Live Class Modal */}
      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setSelectedClass(null);
        setFormData({
          title: '',
          description: '',
          courseId: '',
          scheduledDate: '',
          scheduledTime: '',
          duration: '',
          maxStudents: '',
          streamingPlatform: 'youtube',
          youtubeStreamUrl: '',
          zegoRoomId: '',
          meetingUrl: ''
        });
      }} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedClass ? 'Edit Live Class' : 'Schedule New Live Class'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Class Title</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter class title"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Course</FormLabel>
                  <Select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    placeholder="Select course"
                  >
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Time</FormLabel>
                  <Input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Enter duration in minutes"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Maximum Students</FormLabel>
                  <Input
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                    placeholder="Enter maximum number of students"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Streaming Platform</FormLabel>
                  <Select
                    value={formData.streamingPlatform}
                    onChange={(e) => setFormData({ ...formData, streamingPlatform: e.target.value })}
                    placeholder="Select streaming platform"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="google_meet">Google Meet</option>
                    <option value="custom">Custom URL</option>
                    <option value="zego">ZEGOCLOUD</option>
                    {/* Add other platforms here as needed */}
                  </Select>
                </FormControl>

                {formData.streamingPlatform === 'youtube' && (
                  <>
                    <FormControl>
                      <FormLabel>YouTube Stream URL</FormLabel>
                      <Input
                        value={formData.youtubeStreamUrl}
                        onChange={(e) => setFormData({ ...formData, youtubeStreamUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=YOUR_STREAM_KEY"
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Paste the YouTube live stream URL here. This is the URL you get when you start a live stream on YouTube.
                      </Text>
                    </FormControl>
                    
                    <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                      <Text fontSize="sm" fontWeight="semibold" color="blue.800" mb={2}>
                        How to get your YouTube Stream URL:
                      </Text>
                      <VStack align="start" spacing={1} fontSize="xs" color="blue.700">
                        <Text>1. Go to YouTube Studio</Text>
                        <Text>2. Click "Go Live" or "Create" → "Go Live"</Text>
                        <Text>3. Set up your stream details</Text>
                        <Text>4. Copy the stream URL (looks like: https://www.youtube.com/watch?v=STREAM_KEY)</Text>
                        <Text>5. Paste it in the field above</Text>
                      </VStack>
                    </Box>
                    
                    <Box p={4} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                      <Text fontSize="sm" fontWeight="semibold" color="green.800" mb={2}>
                        How to start your live class:
                      </Text>
                      <VStack align="start" spacing={1} fontSize="xs" color="green.700">
                        <Text>1. Start your YouTube live stream first</Text>
                        <Text>2. Copy the public YouTube URL</Text>
                        <Text>3. Paste it in the field above</Text>
                        <Text>4. Save the live class</Text>
                        <Text>5. Click "Start Live" button when ready to let students join</Text>
                      </VStack>
                    </Box>
                  </>
                )}

                {formData.streamingPlatform === 'zego' && (
                  <>
                    <FormControl>
                      <FormLabel>Zego Room ID</FormLabel>
                      <Input
                        value={formData.zegoRoomId}
                        onChange={(e) => setFormData({ ...formData, zegoRoomId: e.target.value })}
                        placeholder="Enter a unique room ID (e.g., course123-lecture1)"
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Students will join this room using embedded video. Token is generated securely on the server.
                      </Text>
                    </FormControl>
                  </>
                )}

                {(formData.streamingPlatform === 'google_meet' || formData.streamingPlatform === 'custom') && (
                  <>
                    <FormControl isRequired>
                      <FormLabel>{formData.streamingPlatform === 'google_meet' ? 'Google Meet Link' : 'Meeting URL'}</FormLabel>
                      <Input
                        value={formData.meetingUrl}
                        onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                        placeholder={formData.streamingPlatform === 'google_meet' ? 'https://meet.google.com/abc-defg-hij' : 'https://your-stream-url.com/session'}
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Paste the full meeting URL students should join.
                      </Text>
                    </FormControl>
                  </>
                )}

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter class description"
                    rows={4}
                  />
                </FormControl>

                <HStack spacing={4}>
                  <Button colorScheme="teal" type="submit" flex={1}>
                    {selectedClass ? 'Update Class' : 'Schedule Class'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsModalOpen(false);
                    setSelectedClass(null);
                    setFormData({
                      title: '',
                      description: '',
                      courseId: '',
                      scheduledDate: '',
                      scheduledTime: '',
                      duration: '',
                      maxStudents: '',
                      streamingPlatform: 'youtube',
                      youtubeStreamUrl: '',
                      zegoRoomId: '',
                      meetingUrl: ''
                    });
                  }} flex={1}>
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TeacherLiveClasses; 