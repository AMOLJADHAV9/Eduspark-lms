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
  Input,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  IconButton,
  SimpleGrid,
  Progress,
  FormHelperText
} from '@chakra-ui/react';
import { FaDownload, FaTrash, FaUpload, FaClock, FaFile } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../utils/api';

const AssignmentSubmit = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const { token } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const data = await api.get(`/api/assignments/${id}`);
      setAssignment(data);
      // Check if user has already submitted
      const submissions = await api.get(`/api/assignments/user/submissions?assignment=${id}`);
      if (submissions.length > 0) {
        setSubmission(submissions[0]);
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast({
        title: 'Error loading assignment',
        description: error.message,
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Send multipart form data to support file uploads
      const formData = new FormData();
      formData.append('comments', comments);
      attachments.forEach((a) => {
        if (a.file) formData.append('attachments', a.file, a.originalName || a.filename);
      });

      const res = await fetch(`/api/assignments/${id}/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to submit assignment');
      }

      const submissionData = await res.json();
      setSubmission(submissionData);

      toast({
        title: 'Assignment submitted successfully!',
        status: 'success',
        duration: 3000
      });

      navigate(`/course/${assignment.course._id}/assignments`);
    } catch (error) {
      toast({
        title: 'Error submitting assignment',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const isOverdue = () => {
    if (!assignment) return false;
    return new Date() > new Date(assignment.dueDate);
  };

  const getTimeRemaining = () => {
    if (!assignment) return '';
    const now = new Date();
    const due = new Date(assignment.dueDate);
    const diff = due - now;
    
    if (diff <= 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <Box>
        <Navbar />
        <Container maxW="container.xl" py={8}>
          <Text>Loading assignment...</Text>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (!assignment) {
    return (
      <Box>
        <Navbar />
        <Container maxW="container.xl" py={8}>
          <Alert status="error">
            <AlertIcon />
            Assignment not found
          </Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (submission) {
    return (
      <Box>
        <Navbar />
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Heading>Assignment Submitted</Heading>
            
            <Card>
              <CardHeader>
                <VStack align="start" spacing={2}>
                  <Heading size="md">{assignment.title}</Heading>
                  <HStack spacing={4}>
                    <Badge colorScheme="green">Submitted</Badge>
                    <Text fontSize="sm">
                      Submitted on: {formatDate(submission.submittedAt)}
                    </Text>
                  </HStack>
                </VStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {submission.status === 'graded' && (
                    <Alert status="info">
                      <AlertIcon />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">Grade: {submission.score}/{submission.maxScore} ({submission.percentage}%)</Text>
                        {submission.feedback && (
                          <Text>Feedback: {submission.feedback}</Text>
                        )}
                      </VStack>
                    </Alert>
                  )}
                  
                  {submission.attachments.length > 0 && (
                    <Box>
                      <Text fontWeight="bold" mb={2}>Submitted Files:</Text>
                      <VStack spacing={2} align="stretch">
                        {submission.attachments.map((file, index) => (
                          <HStack key={index} p={2} bg="gray.50" borderRadius="md">
                            <FaFile />
                            <Text>{file.originalName}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {formatFileSize(file.size)}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}
                  
                  {submission.comments && (
                    <Box>
                      <Text fontWeight="bold" mb={2}>Your Comments:</Text>
                      <Text>{submission.comments}</Text>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
            
            <Button
              onClick={() => navigate(`/course/${assignment.course._id}/assignments`)}
              colorScheme="blue"
            >
              Back to Assignments
            </Button>
          </VStack>
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
          <Heading>Submit Assignment</Heading>
          
          {/* Assignment Details */}
          <Card>
            <CardHeader>
              <VStack align="start" spacing={2}>
                <Heading size="md">{assignment.title}</Heading>
                <HStack spacing={4}>
                  <Badge colorScheme={isOverdue() ? 'red' : 'blue'}>
                    {isOverdue() ? 'Overdue' : 'Due Soon'}
                  </Badge>
                  <Text fontSize="sm">
                    Due: {formatDate(assignment.dueDate)}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {getTimeRemaining()}
                  </Text>
                </HStack>
              </VStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" mb={2}>Description:</Text>
                  <Text>{assignment.description}</Text>
                </Box>
                
                {assignment.instructions && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Instructions:</Text>
                    <Text>{assignment.instructions}</Text>
                  </Box>
                )}
                
                <Box>
                  <Text fontWeight="bold" mb={2}>Maximum Score: {assignment.maxScore} points</Text>
                </Box>
                
                {assignment.attachments.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Assignment Files:</Text>
                    <VStack spacing={2} align="stretch">
                      {assignment.attachments.map((file, index) => (
                        <HStack key={index} p={2} bg="gray.50" borderRadius="md">
                          <FaFile />
                          <Text>{file.originalName}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {formatFileSize(file.size)}
                          </Text>
                          <IconButton
                            size="sm"
                            icon={<FaDownload />}
                            onClick={() => window.open(file.path, '_blank')}
                            colorScheme="blue"
                            variant="ghost"
                          />
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
                
                {assignment.rubric && assignment.rubric.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Grading Rubric:</Text>
                    <VStack spacing={2} align="stretch">
                      {assignment.rubric.map((item, index) => (
                        <Card key={index} variant="outline">
                          <CardBody>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold">{item.criterion} ({item.maxPoints} points)</Text>
                              <Text fontSize="sm">{item.description}</Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Submission Form */}
          <Card>
            <CardHeader>
              <Heading size="md">Your Submission</Heading>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <FormLabel>Upload Files</FormLabel>
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip,.rar"
                    />
                    <FormHelperText>
                      Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, ZIP, RAR
                    </FormHelperText>
                  </FormControl>

                  {attachments.length > 0 && (
                    <Box>
                      <Text fontWeight="bold" mb={2}>Selected Files:</Text>
                      <VStack spacing={2} align="stretch">
                        {attachments.map((attachment, index) => (
                          <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                            <HStack>
                              <FaFile />
                              <Text>{attachment.originalName}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {formatFileSize(attachment.size)}
                              </Text>
                            </HStack>
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
                    </Box>
                  )}

                  <FormControl>
                    <FormLabel>Comments (Optional)</FormLabel>
                    <Textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Add any comments about your submission..."
                      rows={4}
                    />
                  </FormControl>

                  <HStack justify="center" pt={4}>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      isLoading={submitting}
                      loadingText="Submitting Assignment"
                      leftIcon={<FaUpload />}
                      isDisabled={attachments.length === 0}
                    >
                      Submit Assignment
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
};

export default AssignmentSubmit; 