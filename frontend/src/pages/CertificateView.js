import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Badge,
  Divider,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { FaDownload, FaShare, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import html2canvas from 'html2canvas';

const CertificateView = () => {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  
  const certificateRef = useRef();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchCertificate();
  }, [id]);

  const fetchCertificate = async () => {
    try {
      const res = await fetch(`/api/certificates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCertificate(data);
      } else {
        toast({
          title: 'Error loading certificate',
          description: 'Certificate not found or access denied',
          status: 'error'
        });
        navigate('/certificates');
      }
    } catch (error) {
      console.error('Error fetching certificate:', error);
      toast({
        title: 'Error loading certificate',
        description: error.message,
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `certificate-${certificate.certificateNumber}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      toast({
        title: 'Error downloading certificate',
        description: error.message,
        status: 'error'
      });
    }
  };

  const shareCertificate = () => {
    if (navigator.share) {
      navigator.share({
        title: `Certificate - ${certificate.courseTitle}`,
        text: `I completed ${certificate.courseTitle} with grade ${certificate.grade}!`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied to clipboard',
        status: 'success'
      });
    }
  };

  const verifyCertificate = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: 'Please enter verification code',
        status: 'warning'
      });
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(`/api/certificates/verify/${verificationCode}`);
      if (res.ok) {
        const data = await res.json();
        setVerificationResult(data);
      } else {
        setVerificationResult({ isValid: false, message: 'Invalid verification code' });
      }
    } catch (error) {
      setVerificationResult({ isValid: false, message: 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (!certificate) {
    return (
      <Box>
        <Navbar />
        <Container maxW="container.xl" py={8}>
          <Alert status="error">
            <AlertIcon />
            Certificate not found
          </Alert>
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
              <Heading>Certificate of Completion</Heading>
              <Text color="gray.600">{certificate.courseTitle}</Text>
            </VStack>
            <HStack spacing={4}>
              <Button
                leftIcon={<FaDownload />}
                colorScheme="blue"
                onClick={downloadCertificate}
              >
                Download
              </Button>
              <Button
                leftIcon={<FaShare />}
                variant="outline"
                onClick={shareCertificate}
              >
                Share
              </Button>
              <Button
                leftIcon={<FaSearch />}
                variant="outline"
                onClick={() => setIsVerificationModalOpen(true)}
              >
                Verify
              </Button>
            </HStack>
          </HStack>

          {/* Certificate Display */}
          <Box
            ref={certificateRef}
            bg="white"
            border="2px solid"
            borderColor="gold"
            borderRadius="lg"
            p={8}
            textAlign="center"
            position="relative"
            overflow="hidden"
            minH="600px"
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            {/* Background Pattern */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              opacity={0.05}
              backgroundImage="url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
            />

            {/* Certificate Content */}
            <VStack spacing={6} position="relative" zIndex={1}>
              {/* Header */}
              <VStack spacing={2}>
                <Text fontSize="4xl" fontWeight="bold" color="gold" textTransform="uppercase">
                  Certificate of Completion
                </Text>
                <Text fontSize="lg" color="gray.600">
                  This is to certify that
                </Text>
              </VStack>

              {/* Student Name */}
              <VStack spacing={2}>
                <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                  {certificate.studentName}
                </Text>
                <Text fontSize="lg" color="gray.600">
                  has successfully completed the course
                </Text>
              </VStack>

              {/* Course Title */}
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="teal.600" textAlign="center">
                  {certificate.courseTitle}
                </Text>
              </VStack>

              {/* Grade and Score */}
              <HStack spacing={8} justify="center">
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.600">Grade</Text>
                  <Badge
                    colorScheme={getGradeColor(certificate.grade)}
                    fontSize="lg"
                    px={4}
                    py={2}
                  >
                    {certificate.grade}
                  </Badge>
                </VStack>
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.600">Score</Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {certificate.percentage}%
                  </Text>
                </VStack>
              </HStack>

              {/* Completion Date */}
              <VStack spacing={2}>
                <Text fontSize="lg" color="gray.600">
                  Completed on {formatDate(certificate.completedAt)}
                </Text>
                <Text fontSize="lg" color="gray.600">
                  Certificate issued on {formatDate(certificate.issuedAt)}
                </Text>
              </VStack>

              {/* Instructor Signature */}
              <VStack spacing={2}>
                <Divider />
                <Text fontSize="lg" fontWeight="bold">
                  {certificate.instructorName}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Course Instructor
                </Text>
              </VStack>

              {/* Certificate Number */}
              <VStack spacing={1}>
                <Text fontSize="xs" color="gray.500">
                  Certificate Number: {certificate.certificateNumber}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Verification Code: {certificate.verificationCode}
                </Text>
              </VStack>
            </VStack>
          </Box>

          {/* Certificate Details */}
          <Box bg="gray.50" p={6} borderRadius="lg">
            <VStack spacing={4} align="stretch">
              <Heading size="md">Certificate Details</Heading>
              
              <HStack justify="space-between" wrap="wrap">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">Total Score</Text>
                  <Text>{certificate.totalScore}/{certificate.maxScore} points</Text>
                </VStack>
                
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">Course Progress</Text>
                  <Text>{certificate.metadata.completedLectures}/{certificate.metadata.totalLectures} lectures</Text>
                </VStack>
                
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">Quizzes Completed</Text>
                  <Text>{certificate.metadata.completedQuizzes}/{certificate.metadata.totalQuizzes}</Text>
                </VStack>
                
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">Assignments Completed</Text>
                  <Text>{certificate.metadata.completedAssignments}/{certificate.metadata.totalAssignments}</Text>
                </VStack>
              </HStack>

              {certificate.achievements && certificate.achievements.length > 0 && (
                <Box>
                  <Text fontWeight="bold" mb={2}>Achievements</Text>
                  <VStack spacing={2} align="stretch">
                    {certificate.achievements.map((achievement, index) => (
                      <HStack key={index} justify="space-between" p={2} bg="white" borderRadius="md">
                        <Text>{achievement.title}</Text>
                        <Badge colorScheme="green">
                          {achievement.score}/{achievement.maxScore}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </Box>
        </VStack>
      </Container>

      {/* Verification Modal */}
      <Modal isOpen={isVerificationModalOpen} onClose={() => setIsVerificationModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Verify Certificate</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Verification Code</FormLabel>
                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter verification code"
                />
              </FormControl>

              <Button
                onClick={verifyCertificate}
                isLoading={verifying}
                loadingText="Verifying"
                colorScheme="blue"
                w="full"
              >
                Verify Certificate
              </Button>

              {verificationResult && (
                <Alert status={verificationResult.isValid ? 'success' : 'error'}>
                  <AlertIcon as={verificationResult.isValid ? FaCheck : FaTimes} />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">
                      {verificationResult.isValid ? 'Certificate Verified!' : 'Verification Failed'}
                    </Text>
                    {verificationResult.certificate && (
                      <Text fontSize="sm">
                        {verificationResult.certificate.courseTitle} - {verificationResult.certificate.studentName}
                      </Text>
                    )}
                    {verificationResult.message && (
                      <Text fontSize="sm">{verificationResult.message}</Text>
                    )}
                  </VStack>
                </Alert>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Footer />
    </Box>
  );
};

export default CertificateView; 