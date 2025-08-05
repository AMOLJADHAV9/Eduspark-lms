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
  Icon
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

const TeacherAssignments = () => {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/assignments/teacher', {
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

  if (loading) {
    return (
      <>
        <Navbar />
        <Flex minH="100vh" bgGradient="linear(to-br, gray.900, teal.700)">
          <TeacherSidebar />
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
        <TeacherSidebar />
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
                  onClick={() => window.location.href = '/assignment/create'}
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
                    onClick={() => window.location.href = '/assignment/create'}
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
                            {assignment.status}
                          </Badge>
                        </HStack>
                        <VStack align="start" spacing={1}>
                          <Heading size="md" color="white">
                            {assignment.title}
                          </Heading>
                          <Text color="gray.300" fontSize="sm">
                            {assignment.course?.title || 'Unknown Course'}
                          </Text>
                        </VStack>
                      </VStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Text color="gray.200" fontSize="sm" noOfLines={3}>
                          {assignment.description}
                        </Text>
                        
                        <HStack justify="space-between" fontSize="sm" color="gray.400">
                          <HStack spacing={1}>
                            <Icon as={FaUsers} boxSize={3} />
                            <Text>{assignment.submissions?.length || 0} submissions</Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Icon as={FaClock} boxSize={3} />
                            <Text>Due: {new Date(assignment.dueDate).toLocaleDateString()}</Text>
                          </HStack>
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
    </>
  );
};

export default TeacherAssignments; 