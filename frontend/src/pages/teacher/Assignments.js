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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Divider,
  NumberInput,
  NumberInputField,
  Textarea,
  Image,
  FormControl,
  FormLabel,
  Input,
  Switch,
  FormHelperText
} from '@chakra-ui/react';
import {
  FaFileAlt,
  FaPlus,
  FaUsers,
  FaClock
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';

const TeacherAssignments = () => {
  const { token, apiBaseUrl } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isSubmissionViewOpen, setIsSubmissionViewOpen] = useState(false);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [grading, setGrading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxScore: 100,
    instructions: '',
    allowLateSubmission: false,
    latePenalty: 0,
    isPublished: true
  });
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/assignments/teacher`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch assignments');
      }
      
      const data = await res.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: 'Error loading assignments',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const openSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmissionsOpen(true);
    setSubmissionsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/assignments/${assignment._id}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch submissions');
      const data = await res.json();
      setSubmissions(data);
    } catch (error) {
      toast({ title: 'Error loading submissions', description: error.message, status: 'error' });
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const closeSubmissions = () => {
    setIsSubmissionsOpen(false);
    setSelectedAssignment(null);
    setSubmissions([]);
  };

  const openSubmissionView = (submission) => {
    setSelectedSubmission(submission);
    setGradeScore(typeof submission.score === 'number' ? String(submission.score) : '');
    setGradeFeedback(submission.feedback || '');
    setIsSubmissionViewOpen(true);
  };

  const closeSubmissionView = () => {
    setIsSubmissionViewOpen(false);
    setSelectedSubmission(null);
    setGradeScore('');
    setGradeFeedback('');
  };

  const submitGrade = async () => {
    if (!selectedSubmission) return;
    const scoreNum = Number(gradeScore);
    if (Number.isNaN(scoreNum)) {
      toast({ title: 'Invalid score', description: 'Please enter a valid number.', status: 'warning' });
      return;
    }
    if (selectedSubmission.maxScore && scoreNum > selectedSubmission.maxScore) {
      toast({ title: 'Score too high', description: `Max score is ${selectedSubmission.maxScore}.`, status: 'warning' });
      return;
    }
    setGrading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/assignments/submissions/${selectedSubmission._id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ score: scoreNum, feedback: gradeFeedback })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to grade submission');
      }
      const updated = await res.json();
      setSubmissions((prev) => prev.map((s) => (s._id === updated._id ? { ...s, ...updated } : s)));
      toast({ title: 'Submission graded', status: 'success' });
      closeSubmissionView();
    } catch (e) {
      toast({ title: 'Error grading submission', description: e.message, status: 'error' });
    } finally {
      setGrading(false);
    }
  };

  const joinUrl = (base, p) => {
    if (!p) return '#';
    if (p.startsWith('http://') || p.startsWith('https://')) return p;
    const baseTrim = (base || '').replace(/\/$/, '');
    const pathNorm = p.startsWith('/') ? p : `/${p}`;
    return `${baseTrim}${pathNorm}`;
  };
  const getFileUrl = (file) => (file?.path ? joinUrl(apiBaseUrl, file.path) : '#');
  const getExt = (name = '') => name.split('.').pop()?.toLowerCase() || '';
  const isImageExt = (ext) => ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  const isPdfExt = (ext) => ext === 'pdf';
  const openPreview = (file) => {
    if (!file) return;
    const url = getFileUrl(file);
    const name = file.originalName || file.filename || '';
    const ext = getExt(name);
    setPreviewFile({ url, name, ext });
    setIsPreviewOpen(true);
  };
  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };

  const openEdit = (assignment) => {
    setEditingAssignment(assignment);
    const due = assignment.dueDate ? new Date(assignment.dueDate) : null;
    const fmt = (d) => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` : '';
    setEditForm({
      title: assignment.title || '',
      description: assignment.description || '',
      dueDate: fmt(due),
      maxScore: assignment.maxScore || 100,
      instructions: assignment.instructions || '',
      allowLateSubmission: Boolean(assignment.allowLateSubmission),
      latePenalty: assignment.latePenalty || 0,
      isPublished: Boolean(assignment.isPublished)
    });
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditingAssignment(null);
  };

  const handleEditChange = (field, value) => setEditForm((prev) => ({ ...prev, [field]: value }));

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editingAssignment) return;
    setEditSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/assignments/teacher/${editingAssignment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update assignment');
      }
      toast({ title: 'Assignment updated', status: 'success' });
      closeEdit();
      fetchAssignments();
    } catch (error) {
      toast({ title: 'Error updating assignment', description: error.message, status: 'error' });
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Delete this assignment? This action cannot be undone.')) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/assignments/teacher/${assignmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete assignment');
      }
      toast({ title: 'Assignment deleted', status: 'success' });
      fetchAssignments();
    } catch (error) {
      toast({ title: 'Error deleting assignment', description: error.message, status: 'error' });
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Flex minH="100vh" bg="gray.50">
          <TeacherSidebar />
          <Box flex={1} p={8}>
            <Center h="50vh">
              <Spinner size="xl" color="yellow.500" />
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
                  <Heading color="teal.300" fontSize="3xl" fontWeight="extrabold">
                    Assignments
                  </Heading>
                  <Text color="gray.100" fontSize="lg">
                    Create and manage course assignments
                  </Text>
                </VStack>
                <Button
                  colorScheme="teal"
                  leftIcon={<FaPlus />}
                  onClick={() => navigate('/assignment/create')}
                >
                  Create Assignment
                </Button>
              </HStack>
            </Box>

            {/* Assignments Grid */}
            {assignments.length === 0 ? (
              <Box
                bg="rgba(255, 255, 255, 0.15)"
                backdropFilter="blur(8px)"
                borderRadius="2xl"
                border="1px solid rgba(255, 255, 255, 0.18)"
                p={8}
                textAlign="center"
              >
                <VStack spacing={4}>
                  <Icon as={FaFileAlt} boxSize={12} color="gray.400" />
                  <Heading size="md" color="gray.200">
                    No Assignments Yet
                  </Heading>
                  <Text color="gray.300">
                    Start by creating your first assignment for students.
                  </Text>
                  <Button
                    colorScheme="teal"
                    leftIcon={<FaPlus />}
                    onClick={() => navigate('/assignment/create')}
                  >
                    Create First Assignment
                  </Button>
                </VStack>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {assignments.map((assignment) => (
                  <Card
                    key={assignment._id}
                    bg="rgba(255, 255, 255, 0.15)"
                    backdropFilter="blur(8px)"
                    borderRadius="xl"
                    border="1px solid rgba(255, 255, 255, 0.18)"
                  >
                    <CardHeader>
                      <VStack spacing={3} align="start">
                        <HStack justify="space-between" w="full">
                          <Icon as={FaFileAlt} color="teal.300" boxSize={6} />
                          <Badge colorScheme="teal" variant="solid">
                            {typeof assignment.status === 'string' ? assignment.status : 'Unknown'}
                          </Badge>
                        </HStack>
                        <VStack align="start" spacing={1}>
                          <Heading size="md" color="white">
                            {typeof assignment.title === 'string' ? assignment.title : 'Untitled Assignment'}
                          </Heading>
                          <Text color="gray.300" fontSize="sm">
                            {typeof assignment.course === 'object' && assignment.course?.title ? assignment.course.title : 'Unknown Course'}
                          </Text>
                        </VStack>
                      </VStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Text color="gray.200" fontSize="sm" noOfLines={3}>
                          {typeof assignment.description === 'string' ? assignment.description : 'No description available'}
                        </Text>
                        
                        <HStack justify="space-between" fontSize="sm" color="gray.400">
                          <HStack spacing={1}>
                            <Icon as={FaUsers} boxSize={3} />
                            <Text>Submissions</Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Icon as={FaClock} boxSize={3} />
                            <Text>Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}</Text>
                          </HStack>
                        </HStack>

                        <HStack>
                          <Button size="sm" colorScheme="teal" variant="solid" onClick={() => openSubmissions(assignment)}>
                            View Submissions
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openEdit(assignment)}>
                            Edit
                          </Button>
                          <Button size="sm" colorScheme="red" variant="outline" onClick={() => handleDelete(assignment._id)}>
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

      {/* Submissions Modal */}
      <Modal isOpen={isSubmissionsOpen} onClose={closeSubmissions} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedAssignment ? `Submissions: ${selectedAssignment.title}` : 'Submissions'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {submissionsLoading ? (
              <Center py={8}><Spinner /></Center>
            ) : submissions.length === 0 ? (
              <Text color="gray.600">No submissions yet.</Text>
            ) : (
              <VStack align="stretch" spacing={3}>
                {submissions.map((s) => (
                  <Box key={s._id} p={4} borderWidth="1px" borderRadius="md">
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold">{s.user?.name || 'Student'}</Text>
                      <Badge colorScheme={s.status === 'graded' ? 'green' : s.status === 'late' ? 'red' : 'blue'}>{s.status}</Badge>
                    </HStack>
                    <HStack spacing={4} fontSize="sm" color="gray.600">
                      <Text>Submitted: {new Date(s.submittedAt).toLocaleString()}</Text>
                      {typeof s.score === 'number' && (
                        <Text>Score: {s.score}/{s.maxScore}</Text>
                      )}
                    </HStack>
                    {Array.isArray(s.attachments) && s.attachments.length > 0 && (
                      <VStack align="start" spacing={1} mt={2}>
                        <Text fontSize="sm" fontWeight="medium">Files:</Text>
                        {s.attachments.map((f, idx) => (
                          <HStack key={idx} spacing={3}>
                            <a href={getFileUrl(f)} target="_blank" rel="noreferrer">
                              <Text color="teal.600" _hover={{ textDecoration: 'underline' }}>{f.originalName || f.filename}</Text>
                            </a>
                            <Button size="xs" variant="ghost" onClick={() => openPreview(f)}>Preview</Button>
                          </HStack>
                        ))}
                      </VStack>
                    )}
                    {s.comments && (
                      <>
                        <Divider my={2} />
                        <Text fontSize="sm">Comments: {s.comments}</Text>
                      </>
                    )}
                    <HStack mt={3} justify="flex-end">
                      <Button size="sm" variant="outline" onClick={() => openSubmissionView(s)}>View</Button>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Assignment Modal */}
      <Modal isOpen={isEditOpen} onClose={closeEdit} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Assignment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={submitEdit}>
              <VStack spacing={5} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input value={editForm.title} onChange={(e) => handleEditChange('title', e.target.value)} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea value={editForm.description} onChange={(e) => handleEditChange('description', e.target.value)} rows={4} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Due Date</FormLabel>
                  <Input type="datetime-local" value={editForm.dueDate} onChange={(e) => handleEditChange('dueDate', e.target.value)} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Max Score</FormLabel>
                  <NumberInput value={editForm.maxScore} min={1} max={1000} onChange={(v) => handleEditChange('maxScore', parseInt(v))}>
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel>Instructions</FormLabel>
                  <Textarea value={editForm.instructions} onChange={(e) => handleEditChange('instructions', e.target.value)} rows={3} />
                </FormControl>
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb={0}>Allow Late Submissions</FormLabel>
                  <Switch isChecked={editForm.allowLateSubmission} onChange={(e) => handleEditChange('allowLateSubmission', e.target.checked)} />
                </FormControl>
                {editForm.allowLateSubmission && (
                  <FormControl>
                    <FormLabel>Late Penalty (%)</FormLabel>
                    <NumberInput value={editForm.latePenalty} min={0} max={100} onChange={(v) => handleEditChange('latePenalty', parseInt(v))}>
                      <NumberInputField />
                    </NumberInput>
                    <FormHelperText>Percentage deduction for late submissions</FormHelperText>
                  </FormControl>
                )}
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb={0}>Published</FormLabel>
                  <Switch isChecked={editForm.isPublished} onChange={(e) => handleEditChange('isPublished', e.target.checked)} />
                </FormControl>
                <HStack justify="flex-end" pt={2}>
                  <Button type="submit" colorScheme="teal" isLoading={editSubmitting}>Save Changes</Button>
                </HStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* File Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={closePreview} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{previewFile?.name || 'Preview'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {previewFile && (
              <Box>
                {isImageExt(previewFile.ext) ? (
                  <Image src={previewFile.url} alt={previewFile.name} maxH="70vh" objectFit="contain" w="100%" />
                ) : isPdfExt(previewFile.ext) ? (
                  <Box as="iframe" src={previewFile.url} width="100%" height="70vh" border="0" />
                ) : (
                  <VStack spacing={3} align="start">
                    <Text>This file type cannot be previewed. You can download it instead.</Text>
                    <Button as="a" href={previewFile.url} target="_blank" rel="noreferrer" colorScheme="teal">Open in New Tab</Button>
                  </VStack>
                )}
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      {/* Submission Detail / Grade Modal */}
      <Modal isOpen={isSubmissionViewOpen} onClose={closeSubmissionView} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Review Submission</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSubmission && (
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold">{selectedSubmission.user?.name || 'Student'}</Text>
                    <Text fontSize="sm" color="gray.600">Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}</Text>
                  </VStack>
                  <Badge colorScheme={selectedSubmission.status === 'graded' ? 'green' : selectedSubmission.status === 'late' ? 'red' : 'blue'}>
                    {selectedSubmission.status}
                  </Badge>
                </HStack>
                {Array.isArray(selectedSubmission.attachments) && selectedSubmission.attachments.length > 0 && (
                  <Box>
                    <Text fontWeight="medium" mb={1}>Files</Text>
                    <VStack align="start" spacing={2}>
                      {selectedSubmission.attachments.map((f, idx) => (
                        <HStack key={idx} spacing={3}>
                          <a href={getFileUrl(f)} target="_blank" rel="noreferrer">
                            <Text color="teal.600" _hover={{ textDecoration: 'underline' }}>{f.originalName || f.filename}</Text>
                          </a>
                          <Button size="xs" variant="outline" onClick={() => openPreview(f)}>Preview</Button>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
                {selectedSubmission.comments && (
                  <Box>
                    <Text fontWeight="medium" mb={1}>Student Comments</Text>
                    <Text fontSize="sm">{selectedSubmission.comments}</Text>
                  </Box>
                )}
                <Divider />
                <HStack align="start" spacing={4}>
                  <Box flex={1}>
                    <Text fontWeight="medium" mb={1}>Score</Text>
                    <HStack>
                      <NumberInput value={gradeScore} onChange={(v) => setGradeScore(v)} min={0} max={selectedSubmission.maxScore || 100}>
                        <NumberInputField />
                      </NumberInput>
                      <Text fontSize="sm" color="gray.600">/ {selectedSubmission.maxScore || 100}</Text>
                    </HStack>
                  </Box>
                </HStack>
                <Box>
                  <Text fontWeight="medium" mb={1}>Feedback</Text>
                  <Textarea value={gradeFeedback} onChange={(e) => setGradeFeedback(e.target.value)} rows={4} placeholder="Provide feedback..." />
                </Box>
                <HStack justify="flex-end">
                  <Button onClick={submitGrade} colorScheme="teal" isLoading={grading}>Save Grade</Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TeacherAssignments; 