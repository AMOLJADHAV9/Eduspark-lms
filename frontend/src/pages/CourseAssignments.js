import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  useToast,
  SimpleGrid,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton
} from '@chakra-ui/react';
import { FaPlus, FaClock, FaFile, FaDownload } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AssignmentSubmissions from '../components/AssignmentSubmissions';

const CourseAssignments = () => {
  const { courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSubmissions, setUserSubmissions] = useState([]);
  
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      // Fetch course details
      const courseRes = await fetch(`/api/courses/${courseId}`);
      if (courseRes.ok) {
        const courseData = await courseRes.json();
        setCourse(courseData);
      }

      // Fetch assignments for this course
      const assignmentsRes = await fetch(`/api/assignments?course=${courseId}&published=true`);
      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json();
        setAssignments(assignmentsData);
      }

      // Fetch user's submissions for this course
      const submissionsRes = await fetch(`/api/assignments/user/submissions?course=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        setUserSubmissions(submissionsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error loading assignments',
        description: error.message,
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const submission = userSubmissions.find(sub => sub.assignment === assignment._id);
    
    if (submission) {
      if (submission.status === 'graded') {
        return <Badge colorScheme="green">Graded</Badge>;
      }
      return <Badge colorScheme="blue">Submitted</Badge>;
    }
    
    if (now > dueDate) {
      return <Badge colorScheme="red">Overdue</Badge>;
    }
    
    return <Badge colorScheme="yellow">Pending</Badge>;
  };

  const getSubmissionForAssignment = (assignmentId) => {
    return userSubmissions.find(sub => sub.assignment === assignmentId);
  };

  if (loading) {
    return (
      <Box>
        <Navbar />
        <Container maxW="container.xl" py={8}>
          <Text>Loading assignments...</Text>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between">
            <VStack align="start" spacing={2}>
              <Heading>Course Assignments</Heading>
              {course && <Text color="gray.600">{course.title}</Text>}
            </VStack>
            {user.isAdmin && (
              <Button
                leftIcon={<FaPlus />}
                colorScheme="blue"
                onClick={() => navigate('/assignment/create')}
              >
                Create Assignment
              </Button>
            )}
          </HStack>

          <Tabs variant="enclosed">
            <TabList>
              <Tab>Available Assignments</Tab>
              <Tab>My Submissions</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {assignments.length === 0 ? (
                  <Alert status="info">
                    <AlertIcon />
                    No assignments available for this course yet.
                  </Alert>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {assignments.map(assignment => {
                      const submission = getSubmissionForAssignment(assignment._id);
                      return (
                        <Card key={assignment._id} variant="outline">
                          <CardHeader>
                            <VStack align="start" spacing={2}>
                              <Heading size="md">{assignment.title}</Heading>
                              <HStack spacing={2}>
                                {getStatusBadge(assignment)}
                                <Badge colorScheme="purple">
                                  {assignment.maxScore} points
                                </Badge>
                              </HStack>
                            </VStack>
                          </CardHeader>
                          <CardBody>
                            <VStack spacing={4} align="stretch">
                              <Text noOfLines={3}>{assignment.description}</Text>
                              
                              <HStack justify="space-between">
                                <HStack>
                                  <FaClock />
                                  <Text fontSize="sm">
                                    Due: {formatDate(assignment.dueDate)}
                                  </Text>
                                </HStack>
                              </HStack>

                              {assignment.attachments.length > 0 && (
                                <Box>
                                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                                    Attachments ({assignment.attachments.length})
                                  </Text>
                                  <VStack spacing={1} align="stretch">
                                    {assignment.attachments.slice(0, 2).map((file, index) => (
                                      <HStack key={index} fontSize="sm">
                                        <FaFile />
                                        <Text noOfLines={1}>{file.originalName}</Text>
                                      </HStack>
                                    ))}
                                    {assignment.attachments.length > 2 && (
                                      <Text fontSize="sm" color="gray.500">
                                        +{assignment.attachments.length - 2} more files
                                      </Text>
                                    )}
                                  </VStack>
                                </Box>
                              )}

                              {submission ? (
                                <VStack spacing={2}>
                                  <Text fontSize="sm" color="gray.600">
                                    Submitted on: {formatDate(submission.submittedAt)}
                                  </Text>
                                  {submission.status === 'graded' && (
                                    <Text fontSize="sm" fontWeight="bold">
                                      Grade: {submission.score}/{submission.maxScore} ({submission.percentage}%)
                                    </Text>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/assignment/${assignment._id}/submit`)}
                                  >
                                    View Submission
                                  </Button>
                                </VStack>
                              ) : (
                                <Button
                                  colorScheme="blue"
                                  onClick={() => navigate(`/assignment/${assignment._id}/submit`)}
                                  isDisabled={new Date() > new Date(assignment.dueDate) && !assignment.allowLateSubmission}
                                >
                                  {new Date() > new Date(assignment.dueDate) ? 'Submit Late' : 'Submit Assignment'}
                                </Button>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </SimpleGrid>
                )}
              </TabPanel>
              
              <TabPanel>
                <AssignmentSubmissions courseId={courseId} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
};

export default CourseAssignments; 