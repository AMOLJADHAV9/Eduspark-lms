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
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react';
import {
  FaComments,
  FaPlus,
  FaUsers,
  FaClock,
  FaEdit,
  FaTrash
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';

const TeacherQuizzes = () => {
  const { token, apiBaseUrl } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    duration: 30,
    maxAttempts: 1,
    passingScore: 70,
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch teacher's quizzes
      const quizzesRes = await fetch(`${apiBaseUrl}/api/quizzes/teacher`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (quizzesRes.ok) {
        const quizzesData = await quizzesRes.json();
        setQuizzes(quizzesData);
      }

      // Fetch teacher's courses
      const coursesRes = await fetch(`${apiBaseUrl}/api/courses/teacher`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error loading data',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = modalMode === 'add' 
        ? `${apiBaseUrl}/api/quizzes` 
        : `${apiBaseUrl}/api/quizzes/${editingQuiz._id}`;
      
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to save quiz');
      }

      toast({
        title: `Quiz ${modalMode === 'add' ? 'created' : 'updated'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast({
        title: 'Error saving quiz',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to delete quiz');
      }

      toast({
        title: 'Quiz deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast({
        title: 'Error deleting quiz',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openModal = (mode, quiz = null) => {
    setModalMode(mode);
    if (mode === 'edit' && quiz) {
      setEditingQuiz(quiz);
      setFormData({
        title: quiz.title,
        description: quiz.description,
        course: quiz.course._id,
        duration: quiz.duration,
        maxAttempts: quiz.maxAttempts,
        passingScore: quiz.passingScore,
        isActive: quiz.isActive
      });
    } else {
      setEditingQuiz(null);
      resetForm();
    }
    onOpen();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      course: '',
      duration: 30,
      maxAttempts: 1,
      passingScore: 70,
      isActive: true
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Flex minH="100vh" bgGradient="linear(to-br, gray.900, teal.700)">
          <TeacherSidebar />
          <Box flex={1} p={8}>
            <Center h="50vh">
              <Spinner size="xl" color="teal.300" />
            </Center>
          </Box>
        </Flex>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Flex minH="100vh" bgGradient="linear(to-br, gray.900, teal.700)">
        <TeacherSidebar />
        <Box flex={1} p={8}>
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <Box
              bg="rgba(255, 255, 255, 0.15)"
              boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
              backdropFilter="blur(8px)"
              borderRadius="2xl"
              border="1px solid rgba(255, 255, 255, 0.18)"
              p={8}
            >
              <HStack justify="space-between">
                <VStack align="start" spacing={2}>
                  <Heading color="teal.300" fontSize="3xl" fontWeight="extrabold">
                    Quizzes
                  </Heading>
                  <Text color="gray.100" fontSize="lg">
                    Create and manage course quizzes
                  </Text>
                </VStack>
                <Button
                  colorScheme="teal"
                  leftIcon={<FaPlus />}
                  onClick={() => openModal('add')}
                >
                  Create Quiz
                </Button>
              </HStack>
            </Box>

            {/* Quizzes Grid */}
            {quizzes.length === 0 ? (
              <Box
                bg="rgba(255, 255, 255, 0.15)"
                backdropFilter="blur(8px)"
                borderRadius="2xl"
                border="1px solid rgba(255, 255, 255, 0.18)"
                p={8}
                textAlign="center"
              >
                <VStack spacing={4}>
                  <Icon as={FaComments} boxSize={12} color="gray.400" />
                  <Heading size="md" color="gray.200">
                    No Quizzes Yet
                  </Heading>
                  <Text color="gray.300">
                    Start by creating your first quiz for students.
                  </Text>
                  <Button
                    colorScheme="teal"
                    leftIcon={<FaPlus />}
                    onClick={() => openModal('add')}
                  >
                    Create First Quiz
                  </Button>
                </VStack>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {quizzes.map((quiz) => (
                  <Card
                    key={quiz._id}
                    bg="rgba(255, 255, 255, 0.15)"
                    backdropFilter="blur(8px)"
                    borderRadius="xl"
                    border="1px solid rgba(255, 255, 255, 0.18)"
                  >
                    <CardHeader>
                      <VStack spacing={3} align="start">
                        <HStack justify="space-between" w="full">
                          <Icon as={FaComments} color="teal.300" boxSize={6} />
                          <Badge colorScheme={typeof quiz.isActive === 'boolean' && quiz.isActive ? "green" : "gray"} variant="solid">
                            {typeof quiz.isActive === 'boolean' && quiz.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </HStack>
                        <VStack align="start" spacing={1}>
                          <Heading size="md" color="white">
                            {typeof quiz.title === 'string' ? quiz.title : 'Untitled Quiz'}
                          </Heading>
                          <Text color="gray.300" fontSize="sm">
                            {typeof quiz.course === 'object' && quiz.course?.title ? quiz.course.title : 'Unknown Course'}
                          </Text>
                        </VStack>
                      </VStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Text color="gray.200" fontSize="sm" noOfLines={3}>
                          {typeof quiz.description === 'string' ? quiz.description : 'No description available'}
                        </Text>
                        
                        <HStack justify="space-between" fontSize="sm" color="gray.400">
                          <HStack spacing={1}>
                            <Icon as={FaClock} boxSize={3} />
                            <Text>{typeof quiz.duration === 'number' ? quiz.duration : 0} min</Text>
                          </HStack>
                          <Text>Pass: {typeof quiz.passingScore === 'number' ? quiz.passingScore : 0}%</Text>
                        </HStack>

                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            leftIcon={<FaEdit />}
                            variant="outline"
                            colorScheme="teal"
                            onClick={() => openModal('edit', quiz)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            leftIcon={<FaTrash />}
                            variant="outline"
                            colorScheme="red"
                            onClick={() => handleDelete(quiz._id)}
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

      {/* Create/Edit Quiz Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>
            {modalMode === 'add' ? 'Create New Quiz' : 'Edit Quiz'}
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Quiz Title</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter quiz title"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter quiz description"
                    rows={3}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Course</FormLabel>
                  <Select
                    value={formData.course}
                    onChange={(e) => setFormData({...formData, course: e.target.value})}
                    placeholder="Select a course"
                  >
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <HStack spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <NumberInput
                      value={formData.duration}
                      onChange={(value) => setFormData({...formData, duration: parseInt(value)})}
                      min={1}
                      max={180}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Max Attempts</FormLabel>
                    <NumberInput
                      value={formData.maxAttempts}
                      onChange={(value) => setFormData({...formData, maxAttempts: parseInt(value)})}
                      min={1}
                      max={10}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Passing Score (%)</FormLabel>
                    <NumberInput
                      value={formData.passingScore}
                      onChange={(value) => setFormData({...formData, passingScore: parseInt(value)})}
                      min={1}
                      max={100}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="teal" type="submit">
                {modalMode === 'add' ? 'Create Quiz' : 'Update Quiz'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TeacherQuizzes; 