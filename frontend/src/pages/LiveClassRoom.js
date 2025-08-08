import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Button,
  Text,
  Heading,
  useToast,
  Flex,
  IconButton,
  Badge,
  Input,
  Avatar,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  List,
  ListItem,
  Spinner,
  Center,
  Icon
} from '@chakra-ui/react';
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaComments,
  FaUsers,
  FaSignOutAlt,
  FaHandPaper,
  FaDesktop
} from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import io from 'socket.io-client';

const LiveClassRoom = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user, token, apiBaseUrl } = useAuth();
  const toast = useToast();
  
  // Refs for video elements
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const screenShareRef = useRef();
  const socketRef = useRef();
  
  // State management
  const [liveClass, setLiveClass] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Media controls
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  
  // UI state
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  
  // WebRTC state
  const [peerConnection, setPeerConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    initializeClass();
    return () => {
      cleanupMedia();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [classId]);

  const initializeClass = async () => {
    try {
      // Fetch live class details
      const response = await fetch(`${apiBaseUrl}/api/live-classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch live class');
      }
      
      const classData = await response.json();
      setLiveClass(classData);
      setIsTeacher(classData.instructor._id === user.id);
      
      // Initialize Socket.IO connection
      initializeSocket();
      
      // Initialize media if teacher or if class is live
      if (isTeacher || classData.status === 'live') {
        await initializeMedia();
      }
      
      // Join the class
      await joinClass();
      
    } catch (error) {
      console.error('Error initializing class:', error);
      toast({
        title: 'Error',
        description: 'Failed to join live class',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      navigate('/live-classes');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSocket = () => {
    // Connect to Socket.IO server
    const socketUrl = apiBaseUrl.replace('http', 'ws');
    socketRef.current = io(socketUrl, {
      transports: ['websocket'],
      auth: {
        token: token
      }
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setIsConnected(true);
      
      // Join the live class room
      socketRef.current.emit('join-room', {
        liveClassId: classId,
        userId: user.id,
        userName: user.name
      });
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      setIsConnected(false);
    });

    // Handle user joined
    socketRef.current.on('user-joined', ({ userId, userName, socketId }) => {
      console.log('User joined:', userName);
      setParticipants(prev => [...prev, { id: userId, name: userName, socketId }]);
      addMessage({
        type: 'system',
        content: `${userName} joined the class`,
        timestamp: new Date()
      });
    });

    // Handle user left
    socketRef.current.on('user-left', ({ socketId }) => {
      console.log('User left:', socketId);
      setParticipants(prev => prev.filter(p => p.socketId !== socketId));
      addMessage({
        type: 'system',
        content: 'A participant left the class',
        timestamp: new Date()
      });
    });

    // Handle chat messages
    socketRef.current.on('chat-message', ({ message, user: sender }) => {
      addMessage({
        type: 'message',
        sender: sender.name,
        content: message,
        timestamp: new Date()
      });
    });

    // Handle WebRTC signaling
    socketRef.current.on('signal', ({ signal, from }) => {
      handleSignal(signal, from);
    });
  };

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Initialize WebRTC peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      setPeerConnection(pc);
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
      
      // Handle incoming streams
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
      
      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        setIsConnected(pc.connectionState === 'connected');
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('signal', {
            liveClassId: classId,
            signal: { type: 'ice-candidate', candidate: event.candidate },
            to: 'all'
          });
        }
      };
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: 'Media Access Error',
        description: 'Please allow camera and microphone access',
        status: 'warning',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleSignal = (signal, from) => {
    if (!peerConnection) return;

    if (signal.type === 'offer') {
      peerConnection.setRemoteDescription(new RTCSessionDescription(signal))
        .then(() => peerConnection.createAnswer())
        .then(answer => peerConnection.setLocalDescription(answer))
        .then(() => {
          socketRef.current.emit('signal', {
            liveClassId: classId,
            signal: { type: 'answer', sdp: peerConnection.localDescription },
            to: from
          });
        });
    } else if (signal.type === 'answer') {
      peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
    } else if (signal.type === 'ice-candidate') {
      peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
    }
  };

  const joinClass = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/live-classes/${classId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Joined live class successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Error joining class:', error);
    }
  };

  const cleanupMedia = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        setScreenStream(screenStream);
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        
        // Replace video track in peer connection
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
        
        screenStream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
      } else {
        stopScreenShare();
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      toast({
        title: 'Screen Share Error',
        description: 'Failed to start screen sharing',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    setIsScreenSharing(false);
    
    // Restore camera video
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack);
      }
    }
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    // Send hand raise event to other participants
    addMessage({
      type: 'system',
      content: `${user.name} ${isHandRaised ? 'lowered' : 'raised'} their hand`,
      timestamp: new Date()
    });
  };

  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      const message = {
        id: Date.now(),
        sender: user.name,
        content: newMessage,
        timestamp: new Date(),
        type: 'message'
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Send message to other participants via Socket.IO
      socketRef.current.emit('chat-message', {
        liveClassId: classId,
        message: newMessage,
        user: { id: user.id, name: user.name }
      });
    }
  };

  const addMessage = (message) => {
    setMessages(prev => [...prev, { ...message, id: Date.now() }]);
  };

  const leaveClass = async () => {
    try {
      cleanupMedia();
      
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      
      const response = await fetch(`${apiBaseUrl}/api/live-classes/${classId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      toast({
        title: 'Left Class',
        description: 'You have left the live class',
        status: 'info',
        duration: 3000,
        isClosable: true
      });
      
      navigate('/live-classes');
    } catch (error) {
      console.error('Error leaving class:', error);
    }
  };

  if (isLoading) {
    return (
      <Box bg={bgColor} minH="100vh">
        <Navbar />
        <Center h="50vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="teal.500" />
            <Text>Joining live class...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  if (!liveClass) {
    return (
      <Box bg={bgColor} minH="100vh">
        <Navbar />
        <Center h="50vh">
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Class Not Found!</AlertTitle>
            <AlertDescription>
              The live class you're looking for doesn't exist or you don't have access.
            </AlertDescription>
          </Alert>
        </Center>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh">
      <Navbar />
      
      {/* Header */}
      <Box bg={cardBg} borderBottom="1px" borderColor={borderColor} p={4}>
        <Container maxW="7xl">
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading size="md" color="teal.600">
                {liveClass.title}
              </Heading>
              <Text fontSize="sm" color="gray.500">
                {liveClass.instructor?.name || liveClass.instructor?.email || 'Unknown Instructor'} • {liveClass.course?.title || 'Unknown Course'}
              </Text>
            </VStack>
            
            <HStack spacing={2}>
              <Badge colorScheme={isConnected ? 'green' : 'red'}>
                {isConnected ? 'Connected' : 'Connecting...'}
              </Badge>
              <IconButton
                icon={<FaSignOutAlt />}
                colorScheme="red"
                variant="outline"
                onClick={leaveClass}
                aria-label="Leave class"
              />
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl" py={6}>
        <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={6} h="calc(100vh - 200px)">
          {/* Main Video Area */}
          <GridItem>
            <VStack spacing={4} h="full">
              {/* Remote Video (Teacher/Other Participants) */}
              <Box
                bg="black"
                borderRadius="lg"
                overflow="hidden"
                w="full"
                h="full"
                position="relative"
              >
                {remoteStream ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Center h="full">
                    <VStack spacing={4}>
                      <FaVideo size={48} color="gray" />
                      <Text color="gray.500">Waiting for teacher to start...</Text>
                    </VStack>
                  </Center>
                )}
                
                {/* Screen Share Overlay */}
                {isScreenSharing && (
                  <Box
                    position="absolute"
                    top={4}
                    right={4}
                    bg="rgba(0,0,0,0.7)"
                    color="white"
                    px={3}
                    py={1}
                    borderRadius="md"
                    fontSize="sm"
                  >
                    <HStack>
                      <FaDesktop />
                      <Text>Screen Sharing</Text>
                    </HStack>
                  </Box>
                )}
              </Box>

              {/* Local Video (Self) */}
              {localStream && (
                <Box
                  position="absolute"
                  bottom={4}
                  right={4}
                  w="200px"
                  h="150px"
                  bg="black"
                  borderRadius="lg"
                  overflow="hidden"
                  border="2px solid"
                  borderColor="teal.500"
                >
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              )}
            </VStack>
          </GridItem>

          {/* Sidebar */}
          <GridItem>
            <VStack spacing={4} h="full">
              {/* Controls */}
              <Card bg={cardBg} w="full">
                <CardBody>
                  <VStack spacing={3}>
                    <HStack spacing={2} w="full">
                      <IconButton
                        icon={isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
                        colorScheme={isVideoEnabled ? 'teal' : 'red'}
                        onClick={toggleVideo}
                        aria-label="Toggle video"
                        flex={1}
                      />
                      <IconButton
                        icon={isAudioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
                        colorScheme={isAudioEnabled ? 'teal' : 'red'}
                        onClick={toggleAudio}
                        aria-label="Toggle audio"
                        flex={1}
                      />
                      <IconButton
                        icon={<FaDesktop />}
                        colorScheme={isScreenSharing ? 'red' : 'teal'}
                        onClick={toggleScreenShare}
                        aria-label="Share screen"
                        flex={1}
                      />
                    </HStack>
                    
                    <HStack spacing={2} w="full">
                      <IconButton
                        icon={<FaHandPaper />}
                        colorScheme={isHandRaised ? 'orange' : 'gray'}
                        onClick={toggleHandRaise}
                        aria-label="Raise hand"
                        flex={1}
                      />
                      <IconButton
                        icon={<FaComments />}
                        colorScheme={showChat ? 'teal' : 'gray'}
                        onClick={() => setShowChat(!showChat)}
                        aria-label="Toggle chat"
                        flex={1}
                      />
                      <IconButton
                        icon={<FaUsers />}
                        colorScheme={showParticipants ? 'teal' : 'gray'}
                        onClick={() => setShowParticipants(!showParticipants)}
                        aria-label="Show participants"
                        flex={1}
                      />
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Chat */}
              {showChat && (
                <Card bg={cardBg} w="full" flex={1}>
                  <CardHeader pb={2}>
                    <Heading size="sm">Chat</Heading>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={3} h="full">
                      <Box
                        flex={1}
                        overflowY="auto"
                        w="full"
                        maxH="300px"
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="md"
                        p={3}
                      >
                        {messages.map((message) => (
                          <Box key={message.id} mb={2}>
                            {message.type === 'system' ? (
                              <Text fontSize="xs" color="gray.500" textAlign="center">
                                {message.content}
                              </Text>
                            ) : (
                              <Box>
                                <Text fontSize="xs" fontWeight="bold" color="teal.600">
                                  {message.sender}
                                </Text>
                                <Text fontSize="sm">{message.content}</Text>
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Box>
                      
                      <HStack w="full">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <Button size="sm" onClick={sendMessage}>
                          Send
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* Participants */}
              {showParticipants && (
                <Card bg={cardBg} w="full" flex={1}>
                  <CardHeader pb={2}>
                    <Heading size="sm">Participants ({participants.length + 1})</Heading>
                  </CardHeader>
                  <CardBody pt={0}>
                    <List spacing={2}>
                      <ListItem>
                        <HStack>
                          <Avatar size="sm" name={liveClass.instructor?.name || liveClass.instructor?.email || 'Unknown'} />
                          <Text fontSize="sm" fontWeight="bold">
                            {liveClass.instructor?.name || liveClass.instructor?.email || 'Unknown'} (Teacher)
                          </Text>
                        </HStack>
                      </ListItem>
                      {participants.map((participant) => (
                        <ListItem key={participant.id}>
                          <HStack>
                            <Avatar size="sm" name={participant.name} />
                            <Text fontSize="sm">{participant.name}</Text>
                            {participant.handRaised && (
                              <Icon as={FaHandPaper} color="orange.500" />
                            )}
                          </HStack>
                        </ListItem>
                      ))}
                    </List>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </GridItem>
        </Grid>
      </Container>

      {/* Hidden screen share video */}
      <video
        ref={screenShareRef}
        style={{ display: 'none' }}
        autoPlay
        playsInline
      />
    </Box>
  );
};

export default LiveClassRoom; 