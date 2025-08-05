import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Badge,
  Icon,
  Flex,
  useColorModeValue,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  useToast,
  Divider,
  Avatar,
  AvatarGroup,
  Tooltip,
  SimpleGrid
} from '@chakra-ui/react';
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaDesktop,
  FaComments,
  FaEdit,
  FaUsers,
  FaClock,
  FaPlay,
  FaStop,
  FaShare,
  FaHandPaper,
  FaCog,
  FaSignOutAlt, FaThumbtack
} from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Whiteboard from '../components/Whiteboard';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const SOCKET_URL = window.location.origin.replace(/^http/, 'ws');

const LiveClassRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const toast = useToast();

  const [liveClass, setLiveClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [isInstructor, setIsInstructor] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  // WebRTC/Socket.IO
  const [peers, setPeers] = useState([]); // [{ peerId, peer, stream }]
  const socketRef = useRef();
  const peersRef = useRef([]);
  const localVideoRef = useRef();
  const [localStream, setLocalStream] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);

  // New state for pinning video
  const [pinnedPeerId, setPinnedPeerId] = useState(null);
  // New state for screen sharing
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  // New state for hand raise
  const [isHandRaised, setIsHandRaised] = useState(false);

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (id) {
      fetchLiveClass();
    }
  }, [id]);

  useEffect(() => {
    if (liveClass && liveClass.status === 'live' && user) {
      // Connect to socket and join room
      socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
      socketRef.current.emit('join-room', {
        liveClassId: id,
        userId: user.id,
        userName: user.name,
      });

      // Get user media
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setIsVideoOn(true);
          setIsAudioOn(true);

          // Listen for users joining
          socketRef.current.on('user-joined', ({ userId, userName, socketId }) => {
            const peer = createPeer(socketId, socketRef.current.id, stream);
            peersRef.current.push({ peerId: socketId, peer });
            setPeers(peers => [...peers, { peerId: socketId, peer, userName }]);
          });

          // Listen for signal
          socketRef.current.on('signal', ({ signal, from }) => {
            let item = peersRef.current.find(p => p.peerId === from);
            if (item) {
              item.peer.signal(signal);
            } else {
              // New peer
              const peer = addPeer(signal, from, stream);
              peersRef.current.push({ peerId: from, peer });
              setPeers(peers => [...peers, { peerId: from, peer }]);
            }
          });

          // Remove peer on disconnect
          socketRef.current.on('user-left', ({ socketId }) => {
            setPeers(peers => peers.filter(p => p.peerId !== socketId));
            peersRef.current = peersRef.current.filter(p => p.peerId !== socketId);
          });
        });

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
        if (localStream) localStream.getTracks().forEach(track => track.stop());
        setPeers([]);
        peersRef.current = [];
      };
    }
    // eslint-disable-next-line
  }, [liveClass, user]);

  function createPeer(userToSignal, callerId, stream) {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on('signal', signal => {
      socketRef.current.emit('signal', {
        liveClassId: id,
        signal,
        to: userToSignal,
      });
    });
    return peer;
  }

  function addPeer(incomingSignal, from, stream) {
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on('signal', signal => {
      socketRef.current.emit('signal', {
        liveClassId: id,
        signal,
        to: from,
      });
    });
    peer.signal(incomingSignal);
    return peer;
  }

  const fetchLiveClass = async () => {
    try {
      const response = await fetch(`/api/live-classes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setLiveClass(data);
        setChatMessages(data.chatMessages || []);
        setParticipants(data.enrolledStudents || []);
        setIsInstructor(user && data.instructor._id === user.id);
        setIsEnrolled(user && data.enrolledStudents.some(s => s._id === user.id));
      } else {
        toast({
          title: 'Error',
          description: 'Live class not found',
          status: 'error',
        });
        navigate('/live-classes');
      }
    } catch (error) {
      console.error('Error fetching live class:', error);
      toast({
        title: 'Error',
        description: 'Failed to load live class',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`/api/live-classes/${id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, data.chatMessage]);
        setNewMessage('');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
      });
    }
  };

  const handleStartClass = async () => {
    try {
      const response = await fetch(`/api/live-classes/${id}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Live class started!',
          status: 'success',
        });
        fetchLiveClass();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start class',
        status: 'error',
      });
    }
  };

  const handleEndClass = async () => {
    try {
      const response = await fetch(`/api/live-classes/${id}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Live class ended!',
          status: 'success',
        });
        navigate('/live-classes');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end class',
        status: 'error',
      });
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'blue';
      case 'live': return 'green';
      case 'ended': return 'gray';
      default: return 'gray';
    }
  };

  // Video controls
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => (track.enabled = isVideoOn));
      localStream.getAudioTracks().forEach(track => (track.enabled = isAudioOn));
    }
  }, [isVideoOn, isAudioOn, localStream]);

  // Leave class handler
  const handleLeaveClass = () => {
    if (socketRef.current) socketRef.current.disconnect();
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    setPeers([]);
    peersRef.current = [];
    navigate('/live-classes');
  };

  // Pin video handler
  const handlePinVideo = (peerId) => {
    setPinnedPeerId(peerId === pinnedPeerId ? null : peerId);
  };

  // Screen share handler
  const handleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        // Replace video track in localStream
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = localStream.getVideoTracks()[0];
        localStream.removeTrack(sender);
        localStream.addTrack(videoTrack);
        setIsScreenSharing(true);
        videoTrack.onended = () => {
          setIsScreenSharing(false);
        };
      } catch (error) {
        toast({ title: 'Error', description: 'Screen share failed', status: 'error' });
      }
    } else {
      // Stop screen sharing
      setIsScreenSharing(false);
      // (In a full implementation, restore camera video track)
    }
  };

  // Responsive video grid
  const renderVideoGrid = () => {
    // Pin logic: if a video is pinned, show it large, others small
    const allPeers = [
      { peerId: 'local', stream: localStream, userName: 'You', isLocal: true, isInstructor },
      ...peers.map(({ peerId, peer, userName }) => ({ peerId, peer, userName, isLocal: false, isInstructor: false })),
    ];
    let pinned = allPeers.find(p => p.peerId === pinnedPeerId);
    let others = allPeers.filter(p => p.peerId !== pinnedPeerId);
    if (!pinned && allPeers.length > 0) {
      pinned = allPeers[0];
      others = allPeers.slice(1);
    }
    return (
      <Box w="full" mb={4}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {pinned && (
            <VideoBox
              key={pinned.peerId}
              stream={pinned.stream}
              peer={pinned.peer}
              userName={pinned.userName}
              isLocal={pinned.isLocal}
              isInstructor={pinned.isInstructor}
              isPinned={true}
              onPin={() => handlePinVideo(pinned.peerId)}
              isVideoOn={isVideoOn}
              isAudioOn={isAudioOn}
            />
          )}
          {others.map(p => (
            <VideoBox
              key={p.peerId}
              stream={p.stream}
              peer={p.peer}
              userName={p.userName}
              isLocal={p.isLocal}
              isInstructor={p.isInstructor}
              isPinned={false}
              onPin={() => handlePinVideo(p.peerId)}
              isVideoOn={isVideoOn}
              isAudioOn={isAudioOn}
            />
          ))}
        </SimpleGrid>
      </Box>
    );
  };

  // VideoBox component
  function VideoBox({ stream, peer, userName, isLocal, isInstructor, isPinned, onPin, isVideoOn, isAudioOn }) {
    const ref = useRef();
    useEffect(() => {
      if (isLocal && ref.current && stream) {
        ref.current.srcObject = stream;
      } else if (!isLocal && peer) {
        peer.on('stream', remoteStream => {
          if (ref.current) ref.current.srcObject = remoteStream;
        });
      }
    }, [stream, peer, isLocal]);
    return (
      <Box position="relative" border={isPinned ? '2px solid #319795' : '1px solid #e2e8f0'} borderRadius="lg" overflow="hidden" bg="#222">
        <video
          ref={ref}
          autoPlay
          playsInline
          muted={isLocal}
          style={{ width: '100%', height: 180, objectFit: 'cover', background: '#222' }}
        />
        {/* Overlays */}
        {!isVideoOn && (
          <Center position="absolute" top={0} left={0} w="full" h="full" bg="rgba(0,0,0,0.6)">
            <Icon as={FaVideoSlash} color="white" boxSize={8} />
          </Center>
        )}
        {/* Name and controls */}
        <Flex position="absolute" bottom={0} left={0} w="full" p={2} align="center" bg="rgba(0,0,0,0.5)">
          <Text color="white" fontWeight="bold" fontSize="sm" flex={1}>
            {userName} {isInstructor && <Badge colorScheme="teal" ml={2}>Instructor</Badge>}
          </Text>
          <Tooltip label={isPinned ? 'Unpin' : 'Pin'}>
            <Button size="xs" variant="ghost" colorScheme="teal" onClick={onPin}>
              <FaThumbtack />
            </Button>
          </Tooltip>
        </Flex>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box bg={bg} minH="100vh">
        <Navbar />
        <Center h="50vh">
          <Spinner size="xl" />
        </Center>
      </Box>
    );
  }

  if (!liveClass) {
    return (
      <Box bg={bg} minH="100vh">
        <Navbar />
        <Center h="50vh">
          <Text>Live class not found</Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box bg={bg} minH="100vh">
      <Navbar />
      <Container maxW="full" p={0}>
        <Grid templateColumns="1fr 300px" h="calc(100vh - 80px)">
          {/* Main Content Area */}
          <GridItem p={6}>
            <VStack spacing={4} h="full">
              {/* Header */}
              <Flex justify="space-between" align="center" w="full">
                <Box>
                  <Heading size="lg" color="teal.600">
                    {liveClass.title}
                  </Heading>
                  <Text color="gray.600" fontSize="sm">
                    {liveClass.course.title} • {liveClass.instructor.name}
                  </Text>
                </Box>
                <HStack spacing={4}>
                  <Badge colorScheme={getStatusColor(liveClass.status)}>
                    {liveClass.status.toUpperCase()}
                  </Badge>
                  {isInstructor && liveClass.status === 'scheduled' && (
                    <Button
                      leftIcon={<FaPlay />}
                      colorScheme="green"
                      size="sm"
                      onClick={handleStartClass}
                    >
                      Start Class
                    </Button>
                  )}
                  {isInstructor && liveClass.status === 'live' && (
                    <Button
                      leftIcon={<FaStop />}
                      colorScheme="red"
                      size="sm"
                      onClick={handleEndClass}
                    >
                      End Class
                    </Button>
                  )}
                </HStack>
              </Flex>

              {/* Video Area */}
              {renderVideoGrid()}

              {/* Controls */}
              {liveClass.status === 'live' && (
                <HStack spacing={4} w="full" justify="center">
                  <Button
                    leftIcon={isVideoOn ? <FaVideo /> : <FaVideoSlash />}
                    variant={isVideoOn ? 'solid' : 'outline'}
                    colorScheme="teal"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                  >
                    {isVideoOn ? 'Video On' : 'Video Off'}
                  </Button>
                  <Button
                    leftIcon={isAudioOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    variant={isAudioOn ? 'solid' : 'outline'}
                    colorScheme="teal"
                    onClick={() => setIsAudioOn(!isAudioOn)}
                  >
                    {isAudioOn ? 'Audio On' : 'Audio Off'}
                  </Button>
                  <Button
                    leftIcon={<FaDesktop />}
                    variant={isScreenSharing ? 'solid' : 'outline'}
                    colorScheme="teal"
                    onClick={handleScreenShare}
                  >
                    {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                  </Button>
                  {liveClass.allowWhiteboard && isInstructor && (
                    <Button
                      leftIcon={<FaEdit />}
                      variant={showWhiteboard ? 'solid' : 'outline'}
                      colorScheme="teal"
                      onClick={() => setShowWhiteboard(!showWhiteboard)}
                    >
                      Whiteboard
                    </Button>
                  )}
                  <Button
                    leftIcon={<FaHandPaper />}
                    variant={isHandRaised ? 'solid' : 'outline'}
                    colorScheme="orange"
                    onClick={() => setIsHandRaised(!isHandRaised)}
                  >
                    {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
                  </Button>
                  <Button
                    leftIcon={<FaSignOutAlt />}
                    colorScheme="red"
                    size="sm"
                    onClick={handleLeaveClass}
                  >
                    Leave Class
                  </Button>
                </HStack>
              )}

              {/* Whiteboard */}
              {showWhiteboard && liveClass.allowWhiteboard && (
                <Box w="full" h="300px" border="1px" borderColor={borderColor} rounded="lg">
                  <Whiteboard liveClassId={id} isInstructor={isInstructor} />
                </Box>
              )}
            </VStack>
          </GridItem>

          {/* Sidebar */}
          <GridItem bg={cardBg} borderLeft="1px" borderColor={borderColor}>
            <VStack spacing={0} h="full">
              {/* Tabs */}
              <HStack spacing={0} w="full">
                <Button
                  variant={activeTab === 'chat' ? 'solid' : 'ghost'}
                  colorScheme="teal"
                  flex={1}
                  onClick={() => setActiveTab('chat')}
                  leftIcon={<FaComments />}
                >
                  Chat
                </Button>
                <Button
                  variant={activeTab === 'participants' ? 'solid' : 'ghost'}
                  colorScheme="teal"
                  flex={1}
                  onClick={() => setActiveTab('participants')}
                  leftIcon={<FaUsers />}
                >
                  Participants
                </Button>
              </HStack>

              <Divider />

              {/* Tab Content */}
              <Box flex={1} w="full" overflow="hidden">
                {activeTab === 'chat' ? (
                  <VStack spacing={0} h="full">
                    {/* Chat Messages */}
                    <Box flex={1} p={4} overflowY="auto">
                      <VStack spacing={3} align="stretch">
                        {chatMessages.map((message, index) => (
                          <Box key={index} p={3} bg="gray.50" rounded="md">
                            <HStack justify="space-between" mb={1}>
                              <Text fontWeight="bold" fontSize="sm">
                                {message.user.name}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {formatTime(message.timestamp)}
                              </Text>
                            </HStack>
                            <Text fontSize="sm">{message.message}</Text>
                          </Box>
                        ))}
                      </VStack>
                    </Box>

                    {/* Chat Input */}
                    <Box p={4} borderTop="1px" borderColor={borderColor}>
                      <HStack>
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          isDisabled={!liveClass.allowChat}
                        />
                        <Button
                          colorScheme="teal"
                          size="sm"
                          onClick={handleSendMessage}
                          isDisabled={!newMessage.trim() || !liveClass.allowChat}
                        >
                          Send
                        </Button>
                      </HStack>
                    </Box>
                  </VStack>
                ) : (
                  <Box p={4}>
                    <VStack spacing={4} align="stretch">
                      <Text fontWeight="bold" fontSize="lg">
                        Participants ({participants.length})
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {participants.map((participant, index) => (
                          <HStack key={index} p={2} bg="gray.50" rounded="md">
                            <Avatar size="sm" name={participant.name} />
                            <Text fontSize="sm">{participant.name}</Text>
                            {participant._id === liveClass.instructor._id && (
                              <Badge colorScheme="teal" size="sm">Instructor</Badge>
                            )}
                          </HStack>
                        ))}
                      </VStack>
                    </VStack>
                  </Box>
                )}
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default LiveClassRoom; 