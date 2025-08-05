import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Textarea,
  IconButton
} from '@chakra-ui/react';
import { FaDownload, FaFile, FaEdit } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const AssignmentSubmissions = ({ courseId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [gradingForm, setGradingForm] = useState({
    score: 0,
    feedback: '',
    rubricScores: []
  });
  const [gradingLoading, setGradingLoading] = useState(false);
  
  const { token, user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, [courseId]);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`/api/assignments/user/submissions?course=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error loading submissions',
        description: error.message,
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (submission) => {
    switch (submission.status) {
      case 'graded':
        return <Badge colorScheme="green">Graded</Badge>;
      case 'submitted':
        return <Badge colorScheme="blue">Submitted</Badge>;
      case 'late':
        return <Badge colorScheme="orange">Late</Badge>;
      case 'overdue':
        return <Badge colorScheme="red">Overdue</Badge>;
      default:
        return <Badge colorScheme="gray">Unknown</Badge>;
    }
  };

  const openGradingModal = (submission) => {
    setSelectedSubmission(submission);
    setGradingForm({
      score: submission.score || 0,
      feedback: submission.feedback || '',
      rubricScores: submission.rubricScores || []
    });
    setIsGradingModalOpen(true);
  };

  const handleGradeSubmission = async () => {
    setGradingLoading(true);
    try {
      const res = await fetch(`/api/assignments/submissions/${selectedSubmission._id}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(gradingForm)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to grade submission');
      }

      toast({
        title: 'Submission graded successfully!',
        status: 'success',
        duration: 3000
      });

      setIsGradingModalOpen(false);
      fetchSubmissions(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Error grading submission',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setGradingLoading(false);
    }
  };

  if (loading) {
    return <Text>Loading submissions...</Text>;
  }

  if (submissions.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        No submissions found for this course.
      </Alert>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>My Assignment Submissions</Heading>
      
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Assignment</Th>
            <Th>Status</Th>
            <Th>Submitted</Th>
            <Th>Score</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {submissions.map(submission => (
            <Tr key={submission._id}>
              <Td>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">{submission.assignment.title}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {submission.assignment.description}
                  </Text>
                </VStack>
              </Td>
              <Td>{getStatusBadge(submission)}</Td>
              <Td>{formatDate(submission.submittedAt)}</Td>
              <Td>
                {submission.status === 'graded' ? (
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">
                      {submission.score}/{submission.maxScore}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {submission.percentage}%
                    </Text>
                  </VStack>
                ) : (
                  <Text color="gray.500">Not graded</Text>
                )}
              </Td>
              <Td>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openGradingModal(submission)}
                  >
                    View Details
                  </Button>
                  {user.isAdmin && submission.status !== 'graded' && (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => openGradingModal(submission)}
                    >
                      Grade
                    </Button>
                  )}
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Grading Modal */}
      <Modal isOpen={isGradingModalOpen} onClose={() => setIsGradingModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedSubmission && `Grade: ${selectedSubmission.assignment.title}`}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSubmission && (
              <VStack spacing={6} align="stretch">
                {/* Submission Details */}
                <Box>
                  <Text fontWeight="bold" mb={2}>Submission Details:</Text>
                  <VStack align="start" spacing={2}>
                    <Text>Submitted: {formatDate(selectedSubmission.submittedAt)}</Text>
                    <Text>Status: {selectedSubmission.status}</Text>
                    {selectedSubmission.isLate && (
                      <Text color="orange.500">Late submission (Penalty: {selectedSubmission.latePenalty}%)</Text>
                    )}
                  </VStack>
                </Box>

                {/* Submitted Files */}
                {selectedSubmission.attachments.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Submitted Files:</Text>
                    <VStack spacing={2} align="stretch">
                      {selectedSubmission.attachments.map((file, index) => (
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

                {/* Comments */}
                {selectedSubmission.comments && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Student Comments:</Text>
                    <Text>{selectedSubmission.comments}</Text>
                  </Box>
                )}

                {/* Grading Form (Admin Only) */}
                {user.isAdmin && (
                  <Box>
                    <Text fontWeight="bold" mb={4}>Grade Submission:</Text>
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel>Score (out of {selectedSubmission.maxScore})</FormLabel>
                        <NumberInput
                          value={gradingForm.score}
                          onChange={(value) => setGradingForm(prev => ({ ...prev, score: parseInt(value) }))}
                          min={0}
                          max={selectedSubmission.maxScore}
                        >
                          <NumberInputField />
                        </NumberInput>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Feedback</FormLabel>
                        <Textarea
                          value={gradingForm.feedback}
                          onChange={(e) => setGradingForm(prev => ({ ...prev, feedback: e.target.value }))}
                          placeholder="Provide feedback to the student..."
                          rows={4}
                        />
                      </FormControl>

                      <HStack justify="flex-end" w="full">
                        <Button
                          onClick={handleGradeSubmission}
                          colorScheme="blue"
                          isLoading={gradingLoading}
                          loadingText="Grading"
                        >
                          Save Grade
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                )}

                {/* Current Grade (if graded) */}
                {selectedSubmission.status === 'graded' && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Current Grade:</Text>
                    <VStack align="start" spacing={1}>
                      <Text>Score: {selectedSubmission.score}/{selectedSubmission.maxScore} ({selectedSubmission.percentage}%)</Text>
                      {selectedSubmission.feedback && (
                        <Text>Feedback: {selectedSubmission.feedback}</Text>
                      )}
                      {selectedSubmission.gradedBy && (
                        <Text fontSize="sm" color="gray.600">
                          Graded by: {selectedSubmission.gradedBy.name} on {formatDate(selectedSubmission.gradedAt)}
                        </Text>
                      )}
                    </VStack>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AssignmentSubmissions; 