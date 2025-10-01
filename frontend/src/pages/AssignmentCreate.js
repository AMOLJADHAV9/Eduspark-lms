import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  FormControl,
  FormLabel,
  useToast,
  SimpleGrid,
  IconButton,
  Card,
  CardBody,
  CardHeader,
  Switch,
  FormHelperText,
  Divider,
  Badge
} from '@chakra-ui/react';
import { FaPlus, FaTrash, FaUpload } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../utils/api';

const AssignmentCreate = () => {
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
  
  const [courses, setCourses] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [rubric, setRubric] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  
  const { token, user, isTeacher, isAdmin, apiBaseUrl } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await api.get('/api/courses');
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      filename: file.name,
      originalName: file.name,
      size: file.size,
      file: file
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const addRubricItem = () => {
    setRubric(prev => [...prev, {
      criterion: '',
      maxPoints: 0,
      description: ''
    }]);
  };

  const updateRubricItem = (index, field, value) => {
    setRubric(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeRubricItem = (index) => {
    setRubric(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let endpoint = '/api/assignments';
      let method = 'POST';
      let body;
      let headers = { Authorization: `Bearer ${token}` };
      if (isTeacher) {
        endpoint = '/api/assignments/teacher';
        // Teacher endpoint expects JSON, not FormData (unless backend expects files)
        body = JSON.stringify({
          courseId: form.course,
          title: form.title,
          description: form.description,
          dueDate: form.dueDate,
          maxScore: form.maxScore,
          instructions: form.instructions,
          // Add more fields if needed by backend
        });
        headers['Content-Type'] = 'application/json';
      } else {
        // Admin: keep using FormData for file uploads
        body = new FormData();
        body.append('title', form.title);
        body.append('description', form.description);
        body.append('course', form.course);
        body.append('dueDate', form.dueDate);
        body.append('maxScore', form.maxScore);
        body.append('instructions', form.instructions);
        body.append('allowLateSubmission', form.allowLateSubmission);
        body.append('latePenalty', form.latePenalty);
        body.append('isPublished', form.isPublished);
        body.append('rubric', JSON.stringify(rubric));
        attachments.forEach((attachment, index) => {
          body.append(`attachments`, attachment.file);
        });
      }
      const res = await fetch(endpoint, {
        method,
        headers,
        body,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create assignment');
      }
      toast({
        title: 'Assignment created successfully!',
        status: 'success',
        duration: 3000
      });
      if (isTeacher) {
        navigate('/teacher/assignments');
      } else {
        navigate('/admin/assignments');
      }
    } catch (error) {
      toast({
        title: 'Error creating assignment',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  if (coursesLoading) {
    return (
      <Box>
        <Navbar />
        <Container maxW="container.xl" py={8}>
          <Text>Loading courses...</Text>
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
          <Heading>Create New Assignment</Heading>
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <Heading size="md">Basic Information</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
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
                  </VStack>
                </CardBody>
              </Card>

              {/* Instructions */}
              <Card>
                <CardHeader>
                  <Heading size="md">Instructions</Heading>
                </CardHeader>
                <CardBody>
                  <FormControl>
                    <FormLabel>Assignment Instructions</FormLabel>
                    <Textarea
                      value={form.instructions}
                      onChange={(e) => handleInputChange('instructions', e.target.value)}
                      placeholder="Provide detailed instructions for students"
                      rows={6}
                    />
                  </FormControl>
                </CardBody>
              </Card>

              {/* Attachments */}
              <Card>
                <CardHeader>
                  <Heading size="md">Attachments</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Upload Files</FormLabel>
                      <Input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      />
                      <FormHelperText>
                        Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG
                      </FormHelperText>
                    </FormControl>

                    {attachments.length > 0 && (
                      <VStack spacing={2} align="stretch" w="full">
                        <Text fontWeight="bold">Uploaded Files:</Text>
                        {attachments.map((attachment, index) => (
                          <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                            <Text>{attachment.originalName}</Text>
                            <IconButton
                              size="sm"
                              icon={<FaTrash />}
                              onClick={() => removeAttachment(index)}
                              colorScheme="red"
                              variant="ghost"
                            />
                          </HStack>
                        ))}
                      </VStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Late Submission Settings */}
              <Card>
                <CardHeader>
                  <Heading size="md">Late Submission Settings</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
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
                  </VStack>
                </CardBody>
              </Card>

              {/* Rubric */}
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="md">Grading Rubric</Heading>
                    <Button
                      leftIcon={<FaPlus />}
                      onClick={addRubricItem}
                      size="sm"
                      colorScheme="blue"
                    >
                      Add Criterion
                    </Button>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    {rubric.length === 0 ? (
                      <Text color="gray.500">No rubric criteria added yet.</Text>
                    ) : (
                      rubric.map((item, index) => (
                        <Card key={index} variant="outline">
                          <CardBody>
                            <VStack spacing={3}>
                              <FormControl>
                                <FormLabel>Criterion {index + 1}</FormLabel>
                                <Input
                                  value={item.criterion}
                                  onChange={(e) => updateRubricItem(index, 'criterion', e.target.value)}
                                  placeholder="e.g., Content Quality"
                                />
                              </FormControl>

                              <FormControl>
                                <FormLabel>Maximum Points</FormLabel>
                                <NumberInput
                                  value={item.maxPoints}
                                  onChange={(value) => updateRubricItem(index, 'maxPoints', parseInt(value))}
                                  min={0}
                                >
                                  <NumberInputField />
                                </NumberInput>
                              </FormControl>

                              <FormControl>
                                <FormLabel>Description</FormLabel>
                                <Textarea
                                  value={item.description}
                                  onChange={(e) => updateRubricItem(index, 'description', e.target.value)}
                                  placeholder="Describe what students need to achieve"
                                  rows={2}
                                />
                              </FormControl>

                              <HStack justify="flex-end" w="full">
                                <IconButton
                                  size="sm"
                                  icon={<FaTrash />}
                                  onClick={() => removeRubricItem(index)}
                                  colorScheme="red"
                                  variant="ghost"
                                />
                              </HStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Publication Settings */}
              <Card>
                <CardHeader>
                  <Heading size="md">Publication Settings</Heading>
                </CardHeader>
                <CardBody>
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
                </CardBody>
              </Card>

              {/* Submit Button */}
              <HStack justify="center" pt={4}>
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  isLoading={loading}
                  loadingText="Creating Assignment"
                  leftIcon={<FaPlus />}
                >
                  Create Assignment
                </Button>
              </HStack>
            </VStack>
          </form>
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
};

export default AssignmentCreate; 