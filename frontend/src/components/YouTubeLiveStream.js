import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  Icon,
  Flex
} from '@chakra-ui/react';
import { FaPlay, FaPause, FaExpand, FaUsers, FaClock, FaCalendar } from 'react-icons/fa';

const YouTubeLiveStream = ({ liveClass, onJoin }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [streamStatus, setStreamStatus] = useState('loading');
  const [viewerCount, setViewerCount] = useState(0);
  const toast = useToast();

  useEffect(() => {
    if (liveClass && liveClass.youtubeStreamUrl) {
      setIsLoading(false);
      setStreamStatus('live');
      // Simulate viewer count - in real implementation, you'd get this from YouTube API
      setViewerCount(Math.floor(Math.random() * 100) + 10);
    }
  }, [liveClass]);

  const extractVideoId = (url) => {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/live\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  const getEmbedUrl = (url, fallbackVideoId) => {
    const videoIdFromUrl = extractVideoId(url);
    const finalId = videoIdFromUrl || fallbackVideoId;
    if (!finalId) return null;
    return `https://www.youtube.com/embed/${finalId}?autoplay=1&rel=0&modestbranding=1`;
  };

  const handleJoinStream = () => {
    if (onJoin) {
      onJoin(liveClass);
    }
    
    toast({
      title: 'Joined Live Stream',
      description: `You're now watching ${liveClass.title}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'red';
      case 'scheduled': return 'blue';
      case 'ended': return 'gray';
      default: return 'gray';
    }
  };

  if (!liveClass) {
    return (
      <Center p={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>No Live Class Found!</AlertTitle>
          <AlertDescription>
            The live class you're looking for doesn't exist or has been removed.
          </AlertDescription>
        </Alert>
      </Center>
    );
  }

  const embedUrl = getEmbedUrl(liveClass.youtubeStreamUrl, liveClass.youtubeVideoId);

  // Check if we have a valid YouTube URL or stored video id
  const hasValidYouTubeUrl = !!embedUrl;

  return (
    <Box maxW="1200px" mx="auto" p={4}>
      <VStack spacing={6} align="stretch">
        {/* Live Class Info */}
        <Card>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={2}>
                <Heading size="md">{liveClass.title}</Heading>
                <HStack spacing={4}>
                  <Badge colorScheme={getStatusColor(liveClass.status)}>
                    {liveClass.status.toUpperCase()}
                  </Badge>
                  {liveClass.status === 'live' && (
                    <Badge colorScheme="red" variant="solid">
                      LIVE NOW
                    </Badge>
                  )}
                </HStack>
              </VStack>
              <HStack spacing={4}>
                <HStack>
                  <Icon as={FaUsers} />
                  <Text>{viewerCount} watching</Text>
                </HStack>
                <HStack>
                  <Icon as={FaClock} />
                  <Text>{liveClass.duration} min</Text>
                </HStack>
              </HStack>
            </Flex>
          </CardHeader>
          <CardBody>
            <Text color="gray.600" mb={4}>
              {liveClass.description}
            </Text>
            <HStack spacing={4} color="gray.500" fontSize="sm">
              <HStack>
                <Icon as={FaCalendar} />
                <Text>{formatDateTime(liveClass.scheduledAt)}</Text>
              </HStack>
            </HStack>
          </CardBody>
        </Card>

        {/* YouTube Live Stream */}
        {liveClass.status === 'live' && hasValidYouTubeUrl ? (
          <Card>
            <CardBody p={0}>
              <Box position="relative" width="100%" height="0" pb="56.25%">
                {isLoading ? (
                  <Center position="absolute" top="0" left="0" right="0" bottom="0">
                    <VStack>
                      <Spinner size="xl" color="red.500" />
                      <Text>Loading live stream...</Text>
                    </VStack>
                  </Center>
                ) : (
                  <iframe
                    src={embedUrl}
                    title={liveClass.title}
                    width="100%"
                    height="100%"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      border: 'none',
                      borderRadius: '8px'
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => setIsLoading(false)}
                  />
                )}
              </Box>
            </CardBody>
          </Card>
        ) : liveClass.status === 'live' && !hasValidYouTubeUrl ? (
          <Card>
            <CardBody>
              <Center p={8}>
                <VStack spacing={4}>
                  <Icon as={FaPlay} size="4xl" color="orange.500" />
                  <Heading size="md">Live Stream Not Available</Heading>
                  <Text textAlign="center" color="gray.600">
                    The live stream URL is not properly configured or is invalid.
                    <br />
                    Please contact the instructor for the correct stream link.
                  </Text>
                  {liveClass.youtubeStreamUrl && (
                    <Text fontSize="sm" color="gray.500">
                      Provided URL: {liveClass.youtubeStreamUrl}
                    </Text>
                  )}
                </VStack>
              </Center>
            </CardBody>
          </Card>
        ) : liveClass.status === 'scheduled' ? (
          <Card>
            <CardBody>
              <Center p={8}>
                <VStack spacing={4}>
                  <Icon as={FaClock} size="4xl" color="blue.500" />
                  <Heading size="md">Live Class Scheduled</Heading>
                  <Text textAlign="center" color="gray.600">
                    This live class is scheduled to start at {formatDateTime(liveClass.scheduledAt)}.
                    <br />
                    Please check back later or wait for a notification.
                  </Text>
                  <Button
                    colorScheme="blue"
                    leftIcon={<FaPlay />}
                    onClick={handleJoinStream}
                    isDisabled
                  >
                    Join When Live
                  </Button>
                </VStack>
              </Center>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody>
              <Center p={8}>
                <VStack spacing={4}>
                  <Icon as={FaPause} size="4xl" color="gray.500" />
                  <Heading size="md">Live Class Ended</Heading>
                  <Text textAlign="center" color="gray.600">
                    This live class has ended. Check back for future sessions or view the recording if available.
                  </Text>
                </VStack>
              </Center>
            </CardBody>
          </Card>
        )}

        {/* Join Button for Live Classes */}
        {liveClass.status === 'live' && hasValidYouTubeUrl && (
          <Card>
            <CardBody>
              <VStack spacing={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Join the Live Discussion
                </Text>
                <Text textAlign="center" color="gray.600">
                  The live stream is now active. Click below to join and participate in the discussion.
                </Text>
                <Button
                  colorScheme="red"
                  size="lg"
                  leftIcon={<FaPlay />}
                  onClick={handleJoinStream}
                >
                  Join Live Stream
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Join Button for Live Classes without valid URL */}
        {liveClass.status === 'live' && !hasValidYouTubeUrl && (
          <Card>
            <CardBody>
              <VStack spacing={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Live Stream Active
                </Text>
                <Text textAlign="center" color="gray.600">
                  The live class is active but the stream URL is not properly configured.
                  <br />
                  Please contact your instructor for the correct stream link.
                </Text>
                <Button
                  colorScheme="blue"
                  size="lg"
                  leftIcon={<FaPlay />}
                  onClick={handleJoinStream}
                  isDisabled
                >
                  Stream Not Available
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default YouTubeLiveStream;
