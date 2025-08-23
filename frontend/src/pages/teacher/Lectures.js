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
  FaUpload,
  FaEdit,
  FaTrash,
  FaPlay,
  FaClock,
  FaEye
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import Navbar from '../../components/Navbar';

const TeacherLectures = () => {
  const { token, apiBaseUrl } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    videoUrl: '',
    duration: '',
    order: ''
  });
  const toast = useToast();

  useEffect(() => {
    fetchLectures();
    fetchCourses();
  }, []);

  const fetchLectures = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/lectures/teacher`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch lectures');
      }
      
      const data = await res.json();
      setLectures(data);
    } catch (error) {
      console.error('Error fetching lectures:', error);
      toast({
        title: 'Error loading lectures',
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
      const url = selectedLecture 
        ? `/api/lectures/${selectedLecture._id}`
        : '/api/lectures';
      
      const method = selectedLecture ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Failed to save lecture');
      }

      toast({
        title: 'Success',
        description: `Lecture ${selectedLecture ? 'updated' : 'created'} successfully`,
        status: 'success'
      });

      setIsModalOpen(false);
      setSelectedLecture(null);
      setFormData({
        title: '',
        description: '',
        courseId: '',
        videoUrl: '',
        duration: '',
        order: ''
      });
      fetchLectures();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error'
      });
    }
  };

  const handleEdit = (lecture) => {
    setSelectedLecture(lecture);
    setFormData({
      title: lecture.title,
      description: lecture.description,
      courseId: lecture.courseId,
      videoUrl: lecture.videoUrl,
      duration: lecture.duration,
      order: lecture.order
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (lectureId) => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) {
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/lectures/${lectureId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to delete lecture');
      }

      toast({
        title: 'Success',
        description: 'Lecture deleted successfully',
        status: 'success'
      });

      fetchLectures();
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
    return course && typeof course.title === 'string' ? course.title : 'Unknown Course';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Flex minH="100vh" bg="gray.50">
          <TeacherSidebar />
          <Box flex={1} p={8}>
            <Center h="50vh">
              <Spinner size="xl" color="purple.500" />
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
                  <Heading color="purple.600" fontSize="3xl" fontWeight="extrabold">
                    My Lectures
                  </Heading>
                  <Text color="gray.600" fontSize="lg">
                    Upload and manage your course lectures
                  </Text>
                </VStack>
                <Button
                  colorScheme="purple"
                  leftIcon={<FaUpload />}
                  onClick={() => setIsModalOpen(true)}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(147, 51, 234, 0.4)' }}
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
                  <Text display={{ base: 'none', md: 'block' }}>Upload Lecture</Text>
                </Button>
              </HStack>
            </Box>

            {/* Lectures Grid */}
            {lectures.length === 0 ? (
              <Box
                bg="rgba(255, 255, 255, 0.15)"
                backdropFilter="blur(8px)"
                borderRadius="2xl"
                border="1px solid rgba(255, 255, 255, 0.18)"
                p={8}
                textAlign="center"
              >
                <VStack spacing={4}>
                  <Icon as={FaVideo} boxSize={12} color="gray.400" />
                  <Heading size="md" color="gray.200">
                    No Lectures Yet
                  </Heading>
                  <Text color="gray.300">
                    Start by uploading your first lecture to share with students.
                  </Text>
                  <Button
                    colorScheme="teal"
                    leftIcon={<FaUpload />}
                    onClick={() => setIsModalOpen(true)}
                  >
                    Upload First Lecture
                  </Button>
                </VStack>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {lectures.map((lecture) => (
                  <Card
                    key={lecture._id}
                    bg="rgba(255, 255, 255, 0.15)"
                    backdropFilter="blur(8px)"
                    borderRadius="xl"
                    border="1px solid rgba(255, 255, 255, 0.18)"
                  >
                    <CardHeader>
                      <VStack spacing={3} align="start">
                        <HStack justify="space-between" w="full">
                          <Icon as={FaVideo} color="teal.300" boxSize={6} />
                          <Badge colorScheme="teal" variant="solid">
                            Lecture {typeof lecture.order === 'number' ? lecture.order : 0}
                          </Badge>
                        </HStack>
                        <VStack align="start" spacing={1}>
                          <Heading size="md" color="white">
                            {typeof lecture.title === 'string' ? lecture.title : 'Untitled Lecture'}
                          </Heading>
                          <Text color="gray.300" fontSize="sm">
                            {getCourseName(lecture.courseId)}
                          </Text>
                          <Text color="gray.400" fontSize="xs">
                            Duration: {typeof lecture.duration === 'number' ? lecture.duration : 0} min
                          </Text>
                        </VStack>
                      </VStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Text color="gray.200" fontSize="sm" noOfLines={3}>
                          {typeof lecture.description === 'string' ? lecture.description : 'No description available'}
                        </Text>
                        
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            leftIcon={<FaPlay />}
                            onClick={() => window.open(lecture.videoUrl, '_blank')}
                          >
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="yellow"
                            variant="outline"
                            leftIcon={<FaEdit />}
                            onClick={() => handleEdit(lecture)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            leftIcon={<FaTrash />}
                            onClick={() => handleDelete(lecture._id)}
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

      {/* Lecture Modal */}
      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setSelectedLecture(null);
        setFormData({
          title: '',
          description: '',
          courseId: '',
          videoUrl: '',
          duration: '',
          order: ''
        });
      }} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedLecture ? 'Edit Lecture' : 'Upload New Lecture'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Lecture Title</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter lecture title"
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
                  <FormLabel>Video URL</FormLabel>
                  <Input
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="Enter video URL (YouTube, Vimeo, etc.)"
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
                  <FormLabel>Lecture Order</FormLabel>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    placeholder="Enter lecture order (1, 2, 3...)"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter lecture description"
                    rows={4}
                  />
                </FormControl>

                <HStack spacing={4}>
                  <Button colorScheme="teal" type="submit" flex={1}>
                    {selectedLecture ? 'Update Lecture' : 'Upload Lecture'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsModalOpen(false);
                    setSelectedLecture(null);
                    setFormData({
                      title: '',
                      description: '',
                      courseId: '',
                      videoUrl: '',
                      duration: '',
                      order: ''
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

export default TeacherLectures; 