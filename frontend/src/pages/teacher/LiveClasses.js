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
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
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
        
        // Fetch enrollment count for each course
        const coursesWithEnrollments = await Promise.all(data.map(async (course) => {
          try {
            const enrollmentRes = await fetch(`${apiBaseUrl}/api/enrollments?courseId=${course._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (enrollmentRes.ok) {
              const enrollments = await enrollmentRes.json();
              return { ...course, enrollmentCount: enrollments.length };
            }
          } catch (error) {
            console.error(`Error fetching enrollments for course ${course._id}:`, error);
          }
          return { ...course, enrollmentCount: 0 };
        }));
        
        setCourses(coursesWithEnrollments);
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
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save live class');
      }

      const result = await res.json();
      
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
        zegoRoomId: '',
        meetingUrl: ''
      });
      fetchLiveClasses();
      
      return result;
    } catch (error) {
      console.error('Error saving live class:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save live class',
        status: 'error'
      });
    }
  };

  const handleEdit = (liveClass) => {
    setSelectedClass(liveClass);
    setFormData({
      title: liveClass.title,
      description: liveClass.description,
      courseId: liveClass.course._id || liveClass.courseId,
      scheduledDate: liveClass.scheduledAt ? new Date(liveClass.scheduledAt).toISOString().split('T')[0] : '',
      scheduledTime: liveClass.scheduledAt ? new Date(liveClass.scheduledAt).toTimeString().slice(0, 5) : '',
      duration: liveClass.duration,
      maxStudents: liveClass.maxParticipants || liveClass.maxStudents,
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
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete live class');
      }

      toast({
        title: 'Success',
        description: 'Live class deleted successfully',
        status: 'success'
      });

      fetchLiveClasses();
    } catch (error) {
      console.error('Error deleting live class:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete live class',
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
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to start live stream');
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
      console.error('Error starting live stream:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start live stream',
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
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to end live stream');
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
      console.error('Error ending live stream:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to end live stream',
        status: 'error'
      });
    }
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c._id === courseId);
    return course ? course.title : 'Unknown Course';
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

  const formatDateTime = (date) => {
    if (!date) return 'Not scheduled';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'Invalid date';
      
      return dateObj.toLocaleString();
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
                  onClick={() => {
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
                    setIsModalOpen(true);
                  }}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)' }}
                  transition="all 0.2s ease"
                  size={{ base: "md", md: "lg" }}
                  borderRadius="full"
                  px={{ base: 4, md: 6 }}
                  display={{ base: 'flex', md: 'flex' }}
                  position={{ base: 'fixed', md: 'static' }}
                  bottom={{ base: 4, md: 'auto' }}
                  right={{ base: 4, md: 'auto' }}
                  zIndex={{ base: 1000, md: 'auto' }}
                  boxShadow={{ base: '0 4px 12px rgba(0, 0, 0, 0.15)', md: 'none' }}
                >
                  <Text display={{ base: 'none', md: 'block' }}>Schedule Class</Text>
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
                    onClick={() => {
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
                      setIsModalOpen(true);
                    }}
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
                  >
                    <CardHeader>
                      <VStack spacing={3} align="start">
                        <HStack justify="space-between" w="full">
                          <Icon as={FaVideo} color="teal.300" boxSize={6} />
                          <Badge colorScheme={getStatusColor(liveClass.status)} variant="solid">
                            {liveClass.status}
                          </Badge>
                        </HStack>
                        <VStack align="start" spacing={1}>
                          <Heading size="md" color="gray.800">
                            {liveClass.title || 'Untitled Class'}
                          </Heading>
                          <Text color="gray.600" fontSize="sm">
                            {getCourseName(liveClass.course._id || liveClass.courseId)}
                          </Text>
                          <Text color="gray.500" fontSize="xs">
                            {formatDateTime(liveClass.scheduledAt)}
                          </Text>
                        </VStack>
                      </VStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Text color="gray.600" fontSize="sm" noOfLines={3}>
                          {liveClass.description || 'No description available'}
                        </Text>
                        
                        <HStack justify="space-between" fontSize="sm" color="gray.500">
                          <HStack spacing={1}>
                            <Icon as={FaClock} boxSize={3} />
                            <Text>{liveClass.duration} min</Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Icon as={FaUsers} boxSize={3} />
                            <Text>{liveClass.enrolledStudents?.length || 0}/{liveClass.maxParticipants || liveClass.maxStudents} students</Text>
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
                  <FormLabel>Select Course</FormLabel>
                  <Select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    placeholder="Select course"
                  >
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title} ({course.enrollmentCount || 0} students enrolled)
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <HStack spacing={4}>
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
                </HStack>

                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <NumberInput
                      value={formData.duration}
                      onChange={(value) => setFormData({ ...formData, duration: value })}
                      min={1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Student Limit</FormLabel>
                    <NumberInput
                      value={formData.maxStudents}
                      onChange={(value) => setFormData({ ...formData, maxStudents: value })}
                      min={1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>

                <FormControl isRequired>
                  <FormLabel>Streaming Platform</FormLabel>
                  <Select
                    value={formData.streamingPlatform}
                    onChange={(e) => setFormData({ ...formData, streamingPlatform: e.target.value })}
                  >
                    <option value="youtube">YouTube Streaming</option>
                    <option value="google_meet">Google Meet</option>
                    <option value="custom">Custom Link</option>
                  </Select>
                </FormControl>

                {formData.streamingPlatform === 'youtube' && (
                  <FormControl isRequired>
                    <FormLabel>YouTube Stream URL</FormLabel>
                    <Input
                      value={formData.youtubeStreamUrl}
                      onChange={(e) => setFormData({ ...formData, youtubeStreamUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=YOUR_STREAM_KEY"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Paste the YouTube live stream URL here
                    </Text>
                  </FormControl>
                )}

                {formData.streamingPlatform === 'google_meet' && (
                  <FormControl isRequired>
                    <FormLabel>Google Meet Link</FormLabel>
                    <Input
                      value={formData.meetingUrl}
                      onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                      placeholder="https://meet.google.com/abc-defg-hij"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Paste the full Google Meet URL students should join
                    </Text>
                  </FormControl>
                )}

                {formData.streamingPlatform === 'custom' && (
                  <FormControl isRequired>
                    <FormLabel>Custom Meeting Link</FormLabel>
                    <Input
                      value={formData.meetingUrl}
                      onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                      placeholder="https://your-stream-url.com/session"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Paste the full meeting URL students should join
                    </Text>
                  </FormControl>
                )}

                <FormControl>
                  <FormLabel>Course Lecture Description</FormLabel>
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