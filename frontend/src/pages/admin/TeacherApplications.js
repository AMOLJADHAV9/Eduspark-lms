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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Icon,
  Divider
} from '@chakra-ui/react';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaStar,
  FaCheck,
  FaTimes,
  FaEye,
  FaCalendarAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Navbar from '../../components/Navbar';

const TeacherApplications = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/teacher-applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch applications: ${res.status}`);
      }
      
      const data = await res.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error loading applications',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId, action) => {
    try {
      const res = await fetch(`/api/admin/teacher-applications/${applicationId}/review`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected',
          adminNotes: `Application ${action}ed by admin`
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${action} application`);
      }

      toast({
        title: 'Success',
        description: `Application ${action}ed successfully`,
        status: 'success'
      });

      fetchApplications();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Flex minH="100vh" bgGradient="linear(to-br, gray.900, teal.700)">
          <AdminSidebar />
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
        <AdminSidebar />
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
              <VStack spacing={4} align="start">
                <Heading color="teal.300" fontSize="3xl" fontWeight="extrabold">
                  Teacher Applications
                </Heading>
                <Text color="gray.100" fontSize="lg">
                  Review and manage teacher applications
                </Text>
              </VStack>
            </Box>

            {/* Applications Grid */}
            {applications.length === 0 ? (
              <Box
                bg="rgba(255, 255, 255, 0.15)"
                backdropFilter="blur(8px)"
                borderRadius="2xl"
                border="1px solid rgba(255, 255, 255, 0.18)"
                p={8}
                textAlign="center"
              >
                <VStack spacing={4}>
                  <Icon as={FaUser} boxSize={12} color="gray.400" />
                  <Heading size="md" color="gray.200">
                    No Teacher Applications
                  </Heading>
                  <Text color="gray.300">
                    There are currently no teacher applications to review.
                  </Text>
                </VStack>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {applications.map((application) => (
                                 <Card
                   key={application._id}
                  bg="rgba(255, 255, 255, 0.15)"
                  backdropFilter="blur(8px)"
                  borderRadius="xl"
                  border="1px solid rgba(255, 255, 255, 0.18)"
                >
                  <CardHeader>
                    <VStack spacing={3} align="start">
                      <HStack justify="space-between" w="full">
                        <Avatar name={application.fullName} size="md" />
                        <Badge
                          colorScheme={getStatusColor(application.status)}
                          variant="solid"
                        >
                          {application.status}
                        </Badge>
                      </HStack>
                      <VStack align="start" spacing={1}>
                        <Heading size="md" color="white">
                          {application.fullName}
                        </Heading>
                        <Text color="gray.300" fontSize="sm">
                          {application.expertise}
                        </Text>
                        <Text color="gray.400" fontSize="xs">
                          Applied {formatDate(application.createdAt)}
                        </Text>
                      </VStack>
                    </VStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Text color="gray.200" fontSize="sm" noOfLines={3}>
                        {application.bio}
                      </Text>
                      
                      <HStack justify="space-between" fontSize="sm" color="gray.400">
                        <HStack spacing={1}>
                          <Icon as={FaGraduationCap} boxSize={3} />
                          <Text>{application.experience} years</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Icon as={FaEnvelope} boxSize={3} />
                          <Text>{application.email}</Text>
                        </HStack>
                      </HStack>

                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          leftIcon={<FaEye />}
                          onClick={() => {
                            setSelectedApplication(application);
                            setIsModalOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                        
                        {application.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              colorScheme="green"
                              leftIcon={<FaCheck />}
                                                             onClick={() => handleApplicationAction(application._id, 'approve')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              leftIcon={<FaTimes />}
                                                             onClick={() => handleApplicationAction(application._id, 'reject')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
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

      {/* Application Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Application Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedApplication && (
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Heading size="md">{selectedApplication.fullName}</Heading>
                    <Text color="gray.600">{selectedApplication.email}</Text>
                    <Badge colorScheme={getStatusColor(selectedApplication.status)}>
                      {selectedApplication.status}
                    </Badge>
                  </VStack>
                  <Avatar name={selectedApplication.fullName} size="lg" />
                </HStack>

                <Divider />

                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="bold" mb={2}>Contact Information</Text>
                    <HStack spacing={4} fontSize="sm" color="gray.600">
                      <HStack spacing={1}>
                        <Icon as={FaPhone} boxSize={3} />
                        <Text>{selectedApplication.phone}</Text>
                      </HStack>
                      <HStack spacing={1}>
                        <Icon as={FaEnvelope} boxSize={3} />
                        <Text>{selectedApplication.email}</Text>
                      </HStack>
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={2}>Bio</Text>
                    <Text color="gray.600">{selectedApplication.bio}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={2}>Areas of Expertise</Text>
                    <Text color="gray.600">{selectedApplication.expertise}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={2}>Experience</Text>
                    <Text color="gray.600">{selectedApplication.experience} years</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={2}>Education</Text>
                    <Text color="gray.600">{selectedApplication.education}</Text>
                  </Box>

                  {selectedApplication.portfolio && (
                    <Box>
                      <Text fontWeight="bold" mb={2}>Portfolio</Text>
                      <Text color="blue.500" as="a" href={selectedApplication.portfolio} target="_blank">
                        {selectedApplication.portfolio}
                      </Text>
                    </Box>
                  )}

                  <Box>
                    <Text fontWeight="bold" mb={2}>Motivation</Text>
                    <Text color="gray.600">{selectedApplication.motivation}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={2}>Applied On</Text>
                    <Text color="gray.600">{formatDate(selectedApplication.createdAt)}</Text>
                  </Box>
                </VStack>

                {selectedApplication.status === 'pending' && (
                  <HStack spacing={4} pt={4}>
                    <Button
                      colorScheme="green"
                      leftIcon={<FaCheck />}
                      onClick={() => {
                                                 handleApplicationAction(selectedApplication._id, 'approve');
                        setIsModalOpen(false);
                      }}
                    >
                      Approve Application
                    </Button>
                    <Button
                      colorScheme="red"
                      leftIcon={<FaTimes />}
                      onClick={() => {
                                                 handleApplicationAction(selectedApplication._id, 'reject');
                        setIsModalOpen(false);
                      }}
                    >
                      Reject Application
                    </Button>
                  </HStack>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TeacherApplications; 