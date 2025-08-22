import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
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
  NumberInput,
  NumberInputField,
  Badge,
  IconButton,
  Alert,
  AlertIcon,
  Switch,
  FormHelperText
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import AdminSidebar from '../../components/admin/AdminSidebar';

const AdminAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    course: '',
    dueDate: '',
    maxScore: 100,
    instructions: '',
    allowLateSubmission: false,
    latePenalty: 0,
    isPublished: false
  });
  const [submitting, setSubmitting] = useState(false);
  
  const { token, apiBaseUrl } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch assignments
      const assignmentsRes = await fetch(`${apiBaseUrl}/api/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json();
        setAssignments(assignmentsData);
      }

      // Fetch courses
      const coursesRes = await fetch(`${apiBaseUrl}/api/courses`);
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
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

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const openCreateModal = () => {
    setEditingAssignment(null);
    setForm({
      title: '',
      description: '',
      course: '',
      dueDate: '',
      maxScore: 100,
      instructions: '',
      allowLateSubmission: false,
      latePenalty: 0,
      isPublished: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (assignment) => {
    setEditingAssignment(assignment);
    setForm({
      title: assignment.title,
      description: assignment.description,
      course: assignment.course?._id || '',
      dueDate: assignment.dueDate.split('T')[0] + 'T' + assignment.dueDate.split('T')[1].substring(0, 5),
      maxScore: assignment.maxScore,
      instructions: assignment.instructions || '',
      allowLateSubmission: assignment.allowLateSubmission,
      latePenalty: assignment.latePenalty,
      isPublished: assignment.isPublished
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const url = editingAssignment 
        ? `${apiBaseUrl}/api/assignments/${editingAssignment._id}`
        : `${apiBaseUrl}/api/assignments`;
      
      const method = editingAssignment ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to save assignment');
      }

      toast({
        title: `Assignment ${editingAssignment ? 'updated' : 'created'} successfully!`,
        status: 'success',
        duration: 3000
      });

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: 'Error saving assignment',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete assignment');
      }

      toast({
        title: 'Assignment deleted successfully!',
        status: 'success',
        duration: 3000
      });

      fetchData();
    } catch (error) {
      toast({
        title: 'Error deleting assignment',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (assignment) => {
    if (!assignment.isPublished) {
      return <Badge colorScheme="gray">Draft</Badge>;
    }
    
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (now > dueDate) {
      return <Badge colorScheme="red">Overdue</Badge>;
    }
    
    return <Badge colorScheme="green">Active</Badge>;
  };

  if (loading) {
    return (
      <Box>
        <Navbar />
        <Container maxW="container.xl" py={8}>
          <Text>Loading assignments...</Text>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <HStack align="start" spacing={0}>
        <AdminSidebar />
        <Box flex={1} p={8}>
          <VStack spacing={8} align="stretch">
            <Box bg="white" p={6} rounded="2xl" shadow="0 4px 20px rgba(0, 0, 0, 0.1)" border="1px solid" borderColor="gray.200" mb={6}>
              <HStack justify="space-between">
                <Heading color="yellow.600" fontSize="3xl" fontWeight="extrabold">Assignment Management</Heading>
                <Button
                  leftIcon={<FaPlus />}
                  colorScheme="yellow"
                  size="lg"
                  onClick={openCreateModal}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(234, 179, 8, 0.4)' }}
                  transition="all 0.2s ease"
                >
                  Create Assignment
                </Button>
              </HStack>
            </Box>
            <Box bg="white" p={6} rounded="2xl" shadow="0 4px 20px rgba(0, 0, 0, 0.1)" border="1px solid" borderColor="gray.200">

            {assignments.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                No assignments created yet.
              </Alert>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Title</Th>
                    <Th>Course</Th>
                    <Th>Due Date</Th>
                    <Th>Max Score</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {assignments.map(assignment => (
                    <Tr key={assignment._id}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold">{assignment.title}</Text>
                          <Text fontSize="sm" color="gray.600" noOfLines={2}>
                            {assignment.description}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>{assignment.course?.title || 'N/A'}</Td>
                      <Td>{formatDate(assignment.dueDate)}</Td>
                      <Td>{assignment.maxScore} points</Td>
                      <Td>{getStatusBadge(assignment)}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            size="sm"
                            icon={<FaEdit />}
                            onClick={() => openEditModal(assignment)}
                            colorScheme="green"
                            variant="ghost"
                            _hover={{ transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)' }}
                            transition="all 0.2s ease"
                          />
                          <IconButton
                            size="sm"
                            icon={<FaTrash />}
                            onClick={() => handleDelete(assignment._id)}
                            colorScheme="red"
                            variant="ghost"
                            _hover={{ transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)' }}
                            transition="all 0.2s ease"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>
        </VStack>
        </Box>
      </HStack>

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Assignment Title</FormLabel>
                  <Input
                    value={form.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter assignment title"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={form.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the assignment"
                    rows={4}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Course</FormLabel>
                  <Select
                    value={form.course}
                    onChange={(e) => handleInputChange('course', e.target.value)}
                    placeholder="Select a course"
                  >
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Due Date</FormLabel>
                  <Input
                    type="datetime-local"
                    value={form.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Maximum Score</FormLabel>
                  <NumberInput
                    value={form.maxScore}
                    onChange={(value) => handleInputChange('maxScore', parseInt(value))}
                    min={1}
                    max={1000}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Instructions</FormLabel>
                  <Textarea
                    value={form.instructions}
                    onChange={(e) => handleInputChange('instructions', e.target.value)}
                    placeholder="Provide detailed instructions for students"
                    rows={4}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Allow Late Submissions</FormLabel>
                  <Switch
                    isChecked={form.allowLateSubmission}
                    onChange={(e) => handleInputChange('allowLateSubmission', e.target.checked)}
                  />
                </FormControl>

                {form.allowLateSubmission && (
                  <FormControl>
                    <FormLabel>Late Penalty (%)</FormLabel>
                    <NumberInput
                      value={form.latePenalty}
                      onChange={(value) => handleInputChange('latePenalty', parseInt(value))}
                      min={0}
                      max={100}
                    >
                      <NumberInputField />
                    </NumberInput>
                    <FormHelperText>
                      Percentage deduction for late submissions
                    </FormHelperText>
                  </FormControl>
                )}

                <FormControl>
                  <FormLabel>Publish Assignment</FormLabel>
                  <Switch
                    isChecked={form.isPublished}
                    onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                  />
                  <FormHelperText>
                    Published assignments are visible to enrolled students
                  </FormHelperText>
                </FormControl>

                <HStack justify="flex-end" pt={4}>
                  <Button
                    type="submit"
                    colorScheme="yellow"
                    isLoading={submitting}
                    loadingText={editingAssignment ? 'Updating' : 'Creating'}
                    _hover={{ transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(234, 179, 8, 0.4)' }}
                    transition="all 0.2s ease"
                  >
                    {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
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

export default AdminAssignments; 