import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Container,
  Heading,
  Badge,
  Icon,
  Flex
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUsers, FaClock, FaCalendar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import YouTubeLiveStream from '../components/YouTubeLiveStream';
import ZegoLiveStream from '../components/ZegoLiveStream';

const LiveClassRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, apiBaseUrl, user, isTeacher } = useAuth();
  const [liveClass, setLiveClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (id) {
      fetchLiveClass();
    }
  }, [id]);

  const fetchLiveClass = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/live-classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch live class');
      }
      
      const data = await response.json();
      setLiveClass(data);
    } catch (error) {
      console.error('Error fetching live class:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to load live class',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLiveClass = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/live-classes/${id}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to join live class');
      }

      toast({
        title: 'Success',
        description: 'Successfully joined live class',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error joining live class:', error);
      toast({
        title: 'Error',
        description: 'Failed to join live class',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBack = () => {
      navigate('/live-classes');
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Navbar />
        <Center h="calc(100vh - 200px)">
          <VStack spacing={4}>
            <Spinner size="xl" color="teal.500" />
            <Text>Loading live class...</Text>
          </VStack>
        </Center>
        <Footer />
      </Box>
    );
  }

  if (error || !liveClass) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Navbar />
        <Container maxW="container.md" py={8}>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>
              {error || 'Live class not found'}
            </AlertDescription>
          </Alert>
          <Button
            mt={4}
            leftIcon={<FaArrowLeft />}
            onClick={handleBack}
            colorScheme="teal"
          >
            Back to Live Classes
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
      {/* Header */}
          <Box>
            <Button
              leftIcon={<FaArrowLeft />}
              onClick={handleBack}
              variant="ghost"
              mb={4}
              colorScheme="teal"
            >
              Back to Live Classes
            </Button>
            
            <Flex justify="space-between" align="center" mb={4}>
              <VStack align="start" spacing={2}>
                <Heading size="lg">{liveClass.title}</Heading>
                <HStack spacing={4}>
                  <Badge colorScheme={liveClass.status === 'live' ? 'red' : 'blue'}>
                    {liveClass.status.toUpperCase()}
                  </Badge>
                  {liveClass.status === 'live' && (
                    <Badge colorScheme="red" variant="solid">
                      LIVE NOW
              </Badge>
                  )}
            </HStack>
                    </VStack>
              
              <HStack spacing={4} color="gray.600">
                <HStack>
                  <Icon as={FaUsers} />
                  <Text>{liveClass.enrolledStudents?.length || 0} enrolled</Text>
                </HStack>
                    <HStack>
                  <Icon as={FaClock} />
                  <Text>{liveClass.duration} min</Text>
                    </HStack>
                <HStack>
                  <Icon as={FaCalendar} />
                  <Text>{new Date(liveClass.scheduledAt).toLocaleDateString()}</Text>
                    </HStack>
                    </HStack>
            </Flex>
            
            <Text color="gray.600" fontSize="lg">
              {liveClass.description}
                                </Text>
                      </Box>
                      
          {/* Stream Component */}
          {liveClass.streamingPlatform === 'zego' ? (
            <ZegoLiveStream
              liveClass={liveClass}
              onJoin={handleJoinLiveClass}
              currentUserName={user?.name || 'Guest'}
              currentUserRole={
                user && (user._id === liveClass.instructor?._id) ? 'Host' : 'Audience'
              }
              currentUserId={user?._id}
            />
          ) : (
            <YouTubeLiveStream 
              liveClass={liveClass} 
              onJoin={handleJoinLiveClass}
            />
          )}
            </VStack>
      </Container>

      <Footer />
    </Box>
  );
};

export default LiveClassRoom; 