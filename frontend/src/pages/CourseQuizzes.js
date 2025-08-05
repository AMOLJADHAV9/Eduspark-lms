import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Heading, Text, VStack, HStack, Button, Card, CardBody, CardHeader, Badge, useToast, SimpleGrid, Alert, AlertIcon, Tabs, TabList, TabPanels, Tab, TabPanel
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QuizAttempts from '../components/QuizAttempts';

const CourseQuizzes = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const toast = useToast();
  
  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseAndQuizzes();
  }, [courseId]);

  const fetchCourseAndQuizzes = async () => {
    try {
      // Fetch course details
      const courseRes = await fetch(`/api/courses/${courseId}`);
      if (!courseRes.ok) throw new Error('Course not found');
      const courseData = await courseRes.json();
      setCourse(courseData);

      // Fetch quizzes for this course
      const quizzesRes = await fetch(`/api/quizzes?course=${courseId}`);
      if (!quizzesRes.ok) throw new Error('Failed to fetch quizzes');
      const quizzesData = await quizzesRes.json();
      setQuizzes(quizzesData);
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error' });
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <Box bg="gray.50" minH="100vh">
        <Navbar />
        <Container maxW="6xl" py={8}>
          <Text>Loading...</Text>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box bg="gray.50" minH="100vh">
      <Navbar />
      <Container maxW="6xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading color="teal.600" mb={2}>{course.title} - Quizzes</Heading>
            <Text color="gray.600">{course.description}</Text>
          </Box>

          <Tabs variant="enclosed">
            <TabList>
              <Tab>Available Quizzes</Tab>
              <Tab>My Attempts</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {quizzes.length === 0 ? (
                  <Alert status="info">
                    <AlertIcon />
                    No quizzes available for this course yet.
                  </Alert>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {quizzes.map((quiz) => (
                      <Card key={quiz._id} shadow="md">
                        <CardHeader>
                          <HStack justify="space-between">
                            <Heading size="md">{quiz.title}</Heading>
                            <Badge colorScheme={quiz.isPublished ? 'green' : 'yellow'}>
                              {quiz.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                          </HStack>
                        </CardHeader>
                        <CardBody>
                          <VStack align="stretch" spacing={4}>
                            {quiz.description && (
                              <Text fontSize="sm" color="gray.600">
                                {quiz.description}
                              </Text>
                            )}
                            
                            <HStack justify="space-between" fontSize="sm">
                              <Text>Questions: {quiz.questions.length}</Text>
                              <Text>Time Limit: {quiz.timeLimit || 'No limit'} min</Text>
                            </HStack>
                            
                            <HStack justify="space-between" fontSize="sm">
                              <Text>Passing Score: {quiz.passingScore}</Text>
                              {quiz.lecture && <Text>Lecture Quiz</Text>}
                            </HStack>

                            <Button
                              colorScheme="teal"
                              onClick={() => handleTakeQuiz(quiz._id)}
                              isDisabled={!quiz.isPublished}
                            >
                              {quiz.isPublished ? 'Take Quiz' : 'Not Available'}
                            </Button>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </TabPanel>

              <TabPanel>
                <QuizAttempts courseId={courseId} />
              </TabPanel>
            </TabPanels>
          </Tabs>

          <HStack justify="space-between">
            <Button variant="outline" onClick={() => navigate(`/course/${courseId}`)}>
              Back to Course
            </Button>
            <Button variant="outline" onClick={() => navigate('/user/dashboard')}>
              Back to Dashboard
            </Button>
          </HStack>
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
};

export default CourseQuizzes; 