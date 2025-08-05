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
  Card,
  CardBody,
  CardHeader,
  Badge,
  useToast,
  SimpleGrid,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Progress,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea
} from '@chakra-ui/react';
import { FaDownload, FaEye, FaPlus, FaTrophy, FaGraduationCap } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user's certificates
      const certificatesRes = await fetch('/api/certificates/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (certificatesRes.ok) {
        const certificatesData = await certificatesRes.json();
        setCertificates(certificatesData);
      }

      // Fetch enrolled courses
      const enrollmentsRes = await fetch('/api/enrollments/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json();
        setEnrolledCourses(enrollmentsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error loading certificates',
        description: error.message,
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async () => {
    if (!selectedCourse) return;

    setGenerating(true);
    try {
      const res = await fetch(`/api/certificates/generate/${selectedCourse._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ customMessage })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to generate certificate');
      }

      const certificate = await res.json();
      
      toast({
        title: 'Certificate generated successfully!',
        status: 'success',
        duration: 3000
      });

      setIsGenerateModalOpen(false);
      setSelectedCourse(null);
      setCustomMessage('');
      fetchData(); // Refresh the list
      
      // Navigate to the new certificate
      navigate(`/certificate/${certificate._id}`);
    } catch (error) {
      toast({
        title: 'Error generating certificate',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setGenerating(false);
    }
  };

  const openGenerateModal = (course) => {
    setSelectedCourse(course);
    setIsGenerateModalOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'green',
      'A': 'green',
      'B+': 'blue',
      'B': 'blue',
      'C+': 'yellow',
      'C': 'yellow',
      'D': 'orange',
      'F': 'red'
    };
    return colors[grade] || 'gray';
  };

  const getCourseProgress = (courseId) => {
    const certificate = certificates.find(cert => cert.course._id === courseId);
    if (certificate) {
      return {
        hasCertificate: true,
        grade: certificate.grade,
        percentage: certificate.percentage,
        issuedAt: certificate.issuedAt
      };
    }
    return { hasCertificate: false };
  };

  if (loading) {
    return (
      <Box>
        <Navbar />
        <Container maxW="container.xl" py={8}>
          <Center h="50vh">
            <Spinner size="xl" />
          </Center>
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
              <Heading>My Certificates</Heading>
              <Text color="gray.600">View and manage your course completion certificates</Text>
            </VStack>
            <HStack spacing={4}>
              <Button
                leftIcon={<FaTrophy />}
                colorScheme="gold"
                variant="outline"
                onClick={() => navigate('/certificate/verify')}
              >
                Verify Certificate
              </Button>
            </HStack>
          </HStack>

          {/* Certificates Section */}
          {certificates.length > 0 && (
            <Box>
              <Heading size="md" mb={4}>Your Certificates</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {certificates.map(certificate => (
                  <Card key={certificate._id} variant="outline">
                    <CardHeader>
                      <VStack align="start" spacing={2}>
                        <HStack justify="space-between" w="full">
                          <Badge colorScheme={getGradeColor(certificate.grade)}>
                            {certificate.grade}
                          </Badge>
                          <Text fontSize="sm" color="gray.500">
                            {certificate.percentage}%
                          </Text>
                        </HStack>
                        <Heading size="md">{certificate.courseTitle}</Heading>
                        <Text fontSize="sm" color="gray.600">
                          Issued: {formatDate(certificate.issuedAt)}
                        </Text>
                      </VStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Text noOfLines={2} color="gray.600">
                          {certificate.course.description}
                        </Text>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.500">
                            {certificate.certificateNumber}
                          </Text>
                        </HStack>

                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            leftIcon={<FaEye />}
                            onClick={() => navigate(`/certificate/${certificate._id}`)}
                            colorScheme="blue"
                            variant="outline"
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            leftIcon={<FaDownload />}
                            onClick={() => navigate(`/certificate/${certificate._id}`)}
                            colorScheme="green"
                            variant="outline"
                          >
                            Download
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </Box>
          )}

          {/* Available Courses for Certificate Generation */}
          {enrolledCourses.length > 0 && (
            <Box>
              <Heading size="md" mb={4}>Available for Certificate Generation</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {enrolledCourses.map(course => {
                  const progress = getCourseProgress(course._id);
                  
                  if (progress.hasCertificate) {
                    return null; // Skip if already has certificate
                  }

                  return (
                    <Card key={course._id} variant="outline">
                      <CardHeader>
                        <VStack align="start" spacing={2}>
                          <Heading size="md">{course.title}</Heading>
                          <Text fontSize="sm" color="gray.600">
                            Enrolled: {formatDate(course.enrolledAt)}
                          </Text>
                        </VStack>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          <Text noOfLines={3} color="gray.600">
                            {course.description}
                          </Text>
                          
                          <Box>
                            <Text fontSize="sm" fontWeight="bold" mb={2}>
                              Course Progress
                            </Text>
                            <Progress 
                              value={course.progress || 0} 
                              colorScheme="blue" 
                              size="sm"
                              mb={2}
                            />
                            <Text fontSize="sm" color="gray.600">
                              {course.progress || 0}% Complete
                            </Text>
                          </Box>

                          <Button
                            leftIcon={<FaGraduationCap />}
                            onClick={() => openGenerateModal(course)}
                            colorScheme="gold"
                            isDisabled={!course.progress || course.progress < 70}
                          >
                            {course.progress >= 70 ? 'Generate Certificate' : 'Complete Course First'}
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Box>
          )}

          {certificates.length === 0 && enrolledCourses.length === 0 && (
            <Alert status="info">
              <AlertIcon />
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">No certificates yet</Text>
                <Text>Enroll in courses and complete them to earn certificates!</Text>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => navigate('/courses')}
                >
                  Browse Courses
                </Button>
              </VStack>
            </Alert>
          )}
        </VStack>
      </Container>

      {/* Generate Certificate Modal */}
      <Modal isOpen={isGenerateModalOpen} onClose={() => setIsGenerateModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Generate Certificate - {selectedCourse?.title}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <Alert status="info">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">Certificate Requirements</Text>
                  <Text fontSize="sm">• Minimum 70% course completion required</Text>
                  <Text fontSize="sm">• All quizzes and assignments must be completed</Text>
                  <Text fontSize="sm">• Certificate will include your grade and achievements</Text>
                </VStack>
              </Alert>

              <FormControl>
                <FormLabel>Custom Message (Optional)</FormLabel>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add a personal message to your certificate..."
                  rows={3}
                />
              </FormControl>

              <HStack justify="flex-end" w="full">
                <Button
                  onClick={generateCertificate}
                  isLoading={generating}
                  loadingText="Generating"
                  colorScheme="gold"
                  leftIcon={<FaGraduationCap />}
                >
                  Generate Certificate
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Footer />
    </Box>
  );
};

export default Certificates; 