import React, { useState } from 'react';
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
  Icon,
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
  SimpleGrid,
  Badge,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
import { FaGraduationCap, FaChalkboardTeacher, FaCheck, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    expertise: '',
    experience: '',
    education: '',
    portfolio: '',
    motivation: ''
  });
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    if (role === 'student') {
      handleStudentRole();
    } else if (role === 'teacher') {
      setIsTeacherModalOpen(true);
    }
  };

  const handleStudentRole = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/update-role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'student' })
      });

      if (!res.ok) {
        throw new Error('Failed to update role');
      }

      toast({
        title: 'Welcome Student!',
        description: 'Your account has been set up successfully.',
        status: 'success'
      });

      navigate('/user/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherApplication = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/teacher-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...teacherForm,
          userId: user.id
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit application');
      }

      toast({
        title: 'Application Submitted!',
        description: 'Your teacher application has been submitted for review. You will be notified once approved.',
        status: 'success'
      });

      setIsTeacherModalOpen(false);
      navigate('/user/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const studentBenefits = [
    'Access to all courses and learning materials',
    'Interactive quizzes and assignments',
    'Live class participation',
    'Progress tracking and certificates',
    'Community forum access',
    'Personalized learning recommendations'
  ];

  const teacherBenefits = [
    'Create and publish your own courses',
    'Earn money from course sales',
    'Schedule and host live classes',
    'Access to student analytics',
    'Build your teaching portfolio',
    'Join our community of educators'
  ];

  return (
    <Box minH="100vh" bgGradient="linear(to-br, gray.900, teal.700)" py={12}>
      <Container maxW="6xl">
        <VStack spacing={12} align="stretch">
          {/* Header */}
          <Box textAlign="center" color="white">
            <Heading fontSize="4xl" fontWeight="extrabold" mb={4}>
              Welcome to Our Learning Platform!
            </Heading>
            <Text fontSize="xl" color="gray.200">
              Choose your role to get started with your learning journey
            </Text>
          </Box>

          {/* Role Selection Cards */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            {/* Student Card */}
            <Card
              bg="rgba(255, 255, 255, 0.15)"
              backdropFilter="blur(8px)"
              borderRadius="2xl"
              border="1px solid rgba(255, 255, 255, 0.18)"
              _hover={{ transform: 'translateY(-4px)', transition: 'all 0.3s' }}
              cursor="pointer"
              onClick={() => handleRoleSelection('student')}
            >
              <CardHeader textAlign="center">
                <VStack spacing={4}>
                  <Icon as={FaGraduationCap} color="teal.300" boxSize={16} />
                  <Heading size="lg" color="white">
                    I'm a Student
                  </Heading>
                  <Text color="gray.200">
                    I want to learn and grow my skills
                  </Text>
                </VStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <List spacing={3}>
                    {studentBenefits.map((benefit, index) => (
                      <ListItem key={index} color="gray.200" display="flex" alignItems="center">
                        <ListIcon as={FaCheck} color="teal.300" />
                        {benefit}
                      </ListItem>
                    ))}
                  </List>
                  <Button
                    colorScheme="teal"
                    size="lg"
                    onClick={() => handleRoleSelection('student')}
                    isLoading={loading && selectedRole === 'student'}
                    loadingText="Setting up..."
                  >
                    Continue as Student
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Teacher Card */}
            <Card
              bg="rgba(255, 255, 255, 0.15)"
              backdropFilter="blur(8px)"
              borderRadius="2xl"
              border="1px solid rgba(255, 255, 255, 0.18)"
              _hover={{ transform: 'translateY(-4px)', transition: 'all 0.3s' }}
              cursor="pointer"
              onClick={() => handleRoleSelection('teacher')}
            >
              <CardHeader textAlign="center">
                <VStack spacing={4}>
                  <Icon as={FaChalkboardTeacher} color="purple.300" boxSize={16} />
                  <Heading size="lg" color="white">
                    I'm a Teacher
                  </Heading>
                  <Text color="gray.200">
                    I want to share my knowledge and earn
                  </Text>
                  <Badge colorScheme="purple" variant="solid">
                    Application Required
                  </Badge>
                </VStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <List spacing={3}>
                    {teacherBenefits.map((benefit, index) => (
                      <ListItem key={index} color="gray.200" display="flex" alignItems="center">
                        <ListIcon as={FaStar} color="purple.300" />
                        {benefit}
                      </ListItem>
                    ))}
                  </List>
                  <Button
                    colorScheme="purple"
                    size="lg"
                    onClick={() => handleRoleSelection('teacher')}
                    isLoading={loading && selectedRole === 'teacher'}
                    loadingText="Opening form..."
                  >
                    Apply as Teacher
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Teacher Application Modal */}
      <Modal isOpen={isTeacherModalOpen} onClose={() => setIsTeacherModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Teacher Application Form</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleTeacherApplication}>
              <VStack spacing={6}>
                <Text color="gray.600" fontSize="sm">
                  Please fill out this form to apply for a teacher role. Our team will review your application and get back to you within 2-3 business days.
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Full Name</FormLabel>
                    <Input
                      value={teacherForm.fullName}
                      onChange={(e) => setTeacherForm({ ...teacherForm, fullName: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={teacherForm.email}
                      onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl isRequired>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    value={teacherForm.phone}
                    onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Bio</FormLabel>
                  <Textarea
                    value={teacherForm.bio}
                    onChange={(e) => setTeacherForm({ ...teacherForm, bio: e.target.value })}
                    placeholder="Tell us about yourself and your teaching experience"
                    rows={4}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Areas of Expertise</FormLabel>
                  <Input
                    value={teacherForm.expertise}
                    onChange={(e) => setTeacherForm({ ...teacherForm, expertise: e.target.value })}
                    placeholder="e.g., JavaScript, React, Python, Data Science"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Years of Experience</FormLabel>
                  <Select
                    value={teacherForm.experience}
                    onChange={(e) => setTeacherForm({ ...teacherForm, experience: e.target.value })}
                  >
                    <option value="">Select experience level</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Education Background</FormLabel>
                  <Textarea
                    value={teacherForm.education}
                    onChange={(e) => setTeacherForm({ ...teacherForm, education: e.target.value })}
                    placeholder="Your educational background and certifications"
                    rows={3}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Portfolio/Website</FormLabel>
                  <Input
                    value={teacherForm.portfolio}
                    onChange={(e) => setTeacherForm({ ...teacherForm, portfolio: e.target.value })}
                    placeholder="Your portfolio website or GitHub profile"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Why do you want to teach?</FormLabel>
                  <Textarea
                    value={teacherForm.motivation}
                    onChange={(e) => setTeacherForm({ ...teacherForm, motivation: e.target.value })}
                    placeholder="Tell us why you want to become a teacher on our platform"
                    rows={4}
                  />
                </FormControl>

                <HStack spacing={4} w="full" pt={4}>
                  <Button
                    type="submit"
                    colorScheme="purple"
                    flex={1}
                    isLoading={loading}
                    loadingText="Submitting..."
                  >
                    Submit Application
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsTeacherModalOpen(false)}
                    flex={1}
                  >
                    Cancel
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

export default RoleSelection; 