import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  useToast,
  Spinner,
  Center,
  Icon,
  useColorModeValue,
  Badge,
  AspectRatio,
  Flex,
  Divider,
} from '@chakra-ui/react';
import { FaPlay, FaVideo, FaFileAlt, FaClock, FaCheckCircle, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const CourseLearning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const toast = useToast();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      // Fetch course details
      const courseResponse = await fetch(`/api/courses/${id}`);
      if (!courseResponse.ok) {
        toast({ title: 'Error', description: 'Course not found', status: 'error' });
        navigate('/');
        return;
      }
      const courseData = await courseResponse.json();
      setCourse(courseData);

      // Check enrollment
      if (user) {
        const enrollmentResponse = await fetch(`/api/enrollments/check/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (enrollmentResponse.ok) {
          const enrollmentData = await enrollmentResponse.json();
          setEnrolled(enrollmentData.enrolled);
        }
      }

      // Fetch lectures
      const lecturesResponse = await fetch(`/api/lectures/course/${id}`);
      if (lecturesResponse.ok) {
        const lecturesData = await lecturesResponse.json();
        setLectures(lecturesData);
        if (lecturesData.length > 0) {
          setCurrentLecture(lecturesData[0]);
        }
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch course data', status: 'error' });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLectureSelect = (lecture) => {
    setCurrentLecture(lecture);
  };

  const markAsCompleted = async (lectureId) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: id,
          lectureId: lectureId,
        }),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Progress saved!', status: 'success' });
      }
    } catch (error) {
      console.error('Error marking as completed:', error);
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

  if (!enrolled) {
    return (
      <Box bg={bg} minH="100vh">
        <Navbar />
        <Center h="50vh">
          <VStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold">Access Denied</Text>
            <Text>You need to enroll in this course to access the lectures.</Text>
            <Button colorScheme="teal" onClick={() => navigate(`/course/${id}`)}>
              Go to Course
            </Button>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box bg={bg} minH="100vh">
      <Navbar />
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Course Header */}
          <Card bg={cardBg} shadow="lg">
            <CardBody>
              <VStack align="start" spacing={4}>
                <Heading size="lg">{course?.title}</Heading>
                <Text color="gray.600">{course?.description}</Text>
                <HStack spacing={4}>
                  <Badge colorScheme="teal">{lectures.length} Lectures</Badge>
                  <Badge colorScheme="blue">Enrolled</Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Main Content Area */}
          <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>
            {/* Video Player Section */}
            <Box flex={2}>
              <Card bg={cardBg} shadow="lg" h="fit-content">
                <CardHeader>
                  <Heading size="md">
                    {currentLecture ? currentLecture.title : 'No Lecture Selected'}
                  </Heading>
                </CardHeader>
                <CardBody>
                  {currentLecture ? (
                    <VStack spacing={4} align="stretch">
                      <AspectRatio ratio={16 / 9}>
                        <Box
                          bg="gray.800"
                          rounded="md"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                        >
                          {currentLecture.videoUrl ? (
                            <iframe
                              src={currentLecture.videoUrl}
                              title={currentLecture.title}
                              allowFullScreen
                              style={{ width: '100%', height: '100%' }}
                            />
                          ) : (
                            <VStack spacing={4}>
                              <Icon as={FaVideo} size="4xl" />
                              <Text>Video not available yet</Text>
                              <Text fontSize="sm" color="gray.400">
                                The instructor will upload the video soon
                              </Text>
                            </VStack>
                          )}
                        </Box>
                      </AspectRatio>
                      
                      <VStack align="start" spacing={3}>
                        <Heading size="sm">{currentLecture.title}</Heading>
                        <Text color="gray.600">{currentLecture.description || 'No description available'}</Text>
                        
                        {currentLecture.notesUrl && (
                          <Button
                            leftIcon={<FaFileAlt />}
                            colorScheme="teal"
                            variant="outline"
                            onClick={() => window.open(currentLecture.notesUrl, '_blank')}
                          >
                            Download Notes
                          </Button>
                        )}
                        
                        <Button
                          leftIcon={<FaCheckCircle />}
                          colorScheme="green"
                          onClick={() => markAsCompleted(currentLecture._id)}
                        >
                          Mark as Completed
                        </Button>
                      </VStack>
                    </VStack>
                  ) : (
                    <Center py={12}>
                      <VStack spacing={4}>
                        <Icon as={FaVideo} size="6xl" color="gray.400" />
                        <Heading size="md" color="gray.500">No Lectures Available</Heading>
                        <Text color="gray.500" textAlign="center">
                          The instructor hasn't uploaded any lectures yet.
                          <br />
                          Check back soon for new content!
                        </Text>
                      </VStack>
                    </Center>
                  )}
                </CardBody>
              </Card>
            </Box>

            {/* Lectures Sidebar */}
            <Box flex={1}>
              <Card bg={cardBg} shadow="lg">
                <CardHeader>
                  <Heading size="md">Course Lectures</Heading>
                </CardHeader>
                <CardBody>
                  {lectures.length > 0 ? (
                    <VStack spacing={3} align="stretch">
                      {lectures.map((lecture, index) => (
                        <Box
                          key={lecture._id}
                          p={4}
                          border="1px"
                          borderColor={currentLecture?._id === lecture._id ? 'teal.500' : 'gray.200'}
                          rounded="md"
                          cursor="pointer"
                          bg={currentLecture?._id === lecture._id ? 'teal.50' : 'transparent'}
                          _hover={{ bg: 'gray.50' }}
                          onClick={() => handleLectureSelect(lecture)}
                        >
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <HStack>
                                <Icon as={FaPlay} color="teal.500" />
                                <Text fontWeight="medium">
                                  Lecture {index + 1}: {lecture.title}
                                </Text>
                              </HStack>
                              <Text fontSize="sm" color="gray.500">
                                {lecture.duration || '15 min'}
                              </Text>
                            </VStack>
                            {lecture.videoUrl ? (
                              <Icon as={FaVideo} color="green.500" />
                            ) : (
                              <Icon as={FaLock} color="gray.400" />
                            )}
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <VStack spacing={4} py={8}>
                      <Icon as={FaVideo} size="4xl" color="gray.400" />
                      <Text color="gray.500" textAlign="center">
                        No lectures uploaded yet
                      </Text>
                      <Text fontSize="sm" color="gray.400" textAlign="center">
                        The instructor will add lectures soon
                      </Text>
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </Box>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default CourseLearning; 