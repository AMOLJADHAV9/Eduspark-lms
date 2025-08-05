import React, { useState, useEffect } from 'react';
import {
  Box, Container, Heading, Text, VStack, HStack, Button, Table, Thead, Tbody, Tr, Th, Td, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, Textarea, Select, NumberInput, NumberInputField, Badge, IconButton, Alert, AlertIcon
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import AdminSidebar from '../../components/admin/AdminSidebar';

const Quizzes = () => {
  const { token } = useAuth();
  const toast = useToast();
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    course: '',
    timeLimit: 30,
    passingScore: 0,
    isPublished: false
  });

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/quizzes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch quizzes');
      const data = await res.json();
      setQuizzes(data);
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingQuiz ? `/api/quizzes/${editingQuiz._id}` : '/api/quizzes';
      const method = editingQuiz ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      
      if (!res.ok) throw new Error('Failed to save quiz');
      
      toast({ title: 'Success', description: `Quiz ${editingQuiz ? 'updated' : 'created'} successfully!`, status: 'success' });
      setIsModalOpen(false);
      setEditingQuiz(null);
      resetForm();
      fetchQuizzes();
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error' });
    }
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setForm({
      title: quiz.title,
      description: quiz.description || '',
      course: quiz.course,
      timeLimit: quiz.timeLimit || 30,
      passingScore: quiz.passingScore || 0,
      isPublished: quiz.isPublished || false
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete quiz');
      
      toast({ title: 'Success', description: 'Quiz deleted successfully!', status: 'success' });
      fetchQuizzes();
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error' });
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      course: '',
      timeLimit: 30,
      passingScore: 0,
      isPublished: false
    });
  };

  const openCreateModal = () => {
    setEditingQuiz(null);
    resetForm();
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <Box bg="gray.50" minH="100vh">
        <Navbar />
        <Container maxW="6xl" py={8}>
          <Text>Loading quizzes...</Text>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="gray.50" minH="100vh">
      <Navbar />
      <Container maxW="6xl" py={8}>
        <HStack align="start" spacing={8}>
          <AdminSidebar />
          <VStack spacing={6} align="stretch" flex={1}>
            <HStack justify="space-between">
              <Heading color="teal.600">Quiz Management</Heading>
              <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={openCreateModal}>
                Create Quiz
              </Button>
            </HStack>

            {quizzes.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                No quizzes found. Create your first quiz to get started!
              </Alert>
            ) : (
              <Box bg="white" rounded="md" shadow="sm" overflow="hidden">
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Title</Th>
                      <Th>Course</Th>
                      <Th>Questions</Th>
                      <Th>Time Limit</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {quizzes.map((quiz) => (
                      <Tr key={quiz._id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{quiz.title}</Text>
                            {quiz.description && (
                              <Text fontSize="sm" color="gray.600" noOfLines={1}>
                                {quiz.description}
                              </Text>
                            )}
                          </VStack>
                        </Td>
                        <Td>
                          <Text>{courses.find(c => c._id === quiz.course)?.title || 'Unknown'}</Text>
                        </Td>
                        <Td>
                          <Text>{quiz.questions?.length || 0}</Text>
                        </Td>
                        <Td>
                          <Text>{quiz.timeLimit || 'No limit'} min</Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={quiz.isPublished ? 'green' : 'yellow'}>
                            {quiz.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              size="sm"
                              icon={<FaEdit />}
                              onClick={() => handleEdit(quiz)}
                              colorScheme="blue"
                              variant="ghost"
                            />
                            <IconButton
                              size="sm"
                              icon={<FaTrash />}
                              onClick={() => handleDelete(quiz._id)}
                              colorScheme="red"
                              variant="ghost"
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </VStack>
        </HStack>
      </Container>

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingQuiz ? 'Edit Quiz' : 'Create Quiz'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Course</FormLabel>
                  <Select
                    value={form.course}
                    onChange={(e) => setForm(f => ({ ...f, course: e.target.value }))}
                  >
                    <option value="">Select course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Time Limit (minutes)</FormLabel>
                    <NumberInput
                      min={1}
                      max={180}
                      value={form.timeLimit}
                      onChange={(value) => setForm(f => ({ ...f, timeLimit: value }))}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Passing Score</FormLabel>
                    <NumberInput
                      min={0}
                      value={form.passingScore}
                      onChange={(value) => setForm(f => ({ ...f, passingScore: value }))}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={form.isPublished ? 'true' : 'false'}
                    onChange={(e) => setForm(f => ({ ...f, isPublished: e.target.value === 'true' }))}
                  >
                    <option value="false">Draft</option>
                    <option value="true">Published</option>
                  </Select>
                </FormControl>

                <HStack spacing={4} justify="flex-end">
                  <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" colorScheme="teal">
                    {editingQuiz ? 'Update' : 'Create'}
                  </Button>
                </HStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Quizzes; 