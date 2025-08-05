import React, { useState, useEffect } from 'react';
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
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Avatar,
  AvatarGroup,
  List,
  ListItem,
  ListIcon,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  Input,
  Select,
  Textarea,
  FormControl,
  FormLabel,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark
} from '@chakra-ui/react';
import { 
  FaUser, 
  FaGraduationCap, 
  FaLightbulb, 
  FaChartLine,
  FaStar,
  FaCheck,
  FaClock,
  FaPlay,
  FaPause,
  FaEdit,
  FaPlus,
  FaCog,
  FaBrain,
  FaRoute,
  FaBook,
  FaVideo,
  FaHeadphones,
  FaEye,
  FaHandsHelping,
  FaUsers,
  FaBell,
  FaGlobe,
  FaLock
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PersonalizedDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState(null);
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { token, user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/personalization/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await res.json();
      setDashboardData(data);
      setPreferences(data.preferences);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error loading dashboard',
        description: error.message,
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updatedPreferences) => {
    try {
      const res = await fetch('/api/personalization/preferences', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(updatedPreferences)
      });

      if (!res.ok) {
        throw new Error('Failed to update preferences');
      }

      const updatedData = await res.json();
      setPreferences(updatedData);
      toast({
        title: 'Preferences updated',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      toast({
        title: 'Error updating preferences',
        description: error.message,
        status: 'error'
      });
    }
  };

  const openPathModal = (path) => {
    setSelectedPath(path);
    setIsPathModalOpen(true);
  };

  const getLearningStyleIcon = (style) => {
    const icons = {
      visual: FaEye,
      auditory: FaHeadphones,
      kinesthetic: FaHandsHelping,
      reading: FaBook
    };
    return icons[style] || FaUser;
  };

  const getLearningStyleColor = (style) => {
    const colors = {
      visual: 'blue',
      auditory: 'green',
      kinesthetic: 'orange',
      reading: 'purple'
    };
    return colors[style] || 'gray';
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'yellow';
    if (percentage >= 40) return 'orange';
    return 'red';
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
          {/* Header */}
          <HStack justify="space-between">
            <VStack align="start" spacing={2}>
              <Heading>Personalized Dashboard</Heading>
              <Text color="gray.600">Your AI-powered learning experience</Text>
            </VStack>
            <Button
              leftIcon={<FaCog />}
              colorScheme="teal"
              variant="outline"
              onClick={() => setIsPreferencesModalOpen(true)}
            >
              Customize
            </Button>
          </HStack>

          {/* Statistics Overview */}
          {dashboardData?.statistics && (
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
              <Card>
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel>Total Time Spent</StatLabel>
                    <StatNumber color="blue.500">
                      {formatTime(dashboardData.statistics.totalTimeSpent)}
                    </StatNumber>
                    <StatHelpText>Learning this week</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel>Completed Content</StatLabel>
                    <StatNumber color="green.500">
                      {dashboardData.statistics.completedContent}
                    </StatNumber>
                    <StatHelpText>Items completed</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel>Engagement Score</StatLabel>
                    <StatNumber color="purple.500">
                      {dashboardData.statistics.averageEngagement}%
                    </StatNumber>
                    <StatHelpText>Average engagement</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel>Active Paths</StatLabel>
                    <StatNumber color="orange.500">
                      {dashboardData.statistics.activePathsCount}
                    </StatNumber>
                    <StatHelpText>Learning paths</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}

          {/* Main Content Tabs */}
          <Card>
            <CardBody>
              <Tabs value={activeTab} onChange={setActiveTab}>
                <TabList>
                  <Tab>Overview</Tab>
                  <Tab>Learning Paths</Tab>
                  <Tab>Recommendations</Tab>
                  <Tab>Adaptive Content</Tab>
                </TabList>

                <TabPanels>
                  {/* Overview Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {/* Learning Style Analysis */}
                      {preferences?.learningStyle && (
                        <Card>
                          <CardHeader>
                            <HStack>
                              <Icon as={FaBrain} color="purple.500" />
                              <Heading size="md">Learning Style Analysis</Heading>
                            </HStack>
                          </CardHeader>
                          <CardBody>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                              {Object.entries(preferences.learningStyle).map(([style, percentage]) => {
                                const StyleIcon = getLearningStyleIcon(style);
                                return (
                                  <VStack key={style} align="stretch" spacing={2}>
                                    <HStack justify="space-between">
                                      <HStack>
                                        <Icon as={StyleIcon} color={`${getLearningStyleColor(style)}.500`} />
                                        <Text fontWeight="bold" textTransform="capitalize">
                                          {style}
                                        </Text>
                                      </HStack>
                                      <Text>{percentage}%</Text>
                                    </HStack>
                                    <Progress 
                                      value={percentage} 
                                      colorScheme={getLearningStyleColor(style)}
                                      size="sm"
                                    />
                                  </VStack>
                                );
                              })}
                            </SimpleGrid>
                          </CardBody>
                        </Card>
                      )}

                      {/* Interests */}
                      {preferences?.interests && preferences.interests.length > 0 && (
                        <Card>
                          <CardHeader>
                            <HStack>
                              <Icon as={FaStar} color="yellow.500" />
                              <Heading size="md">Your Interests</Heading>
                            </HStack>
                          </CardHeader>
                          <CardBody>
                            <HStack wrap="wrap" spacing={2}>
                              {preferences.interests.map((interest, index) => (
                                <Tag
                                  key={index}
                                  size="lg"
                                  colorScheme="blue"
                                  borderRadius="full"
                                >
                                  <TagLabel>{interest.category} (Level {interest.level})</TagLabel>
                                </Tag>
                              ))}
                            </HStack>
                          </CardBody>
                        </Card>
                      )}

                      {/* Goals */}
                      {preferences?.goals && preferences.goals.length > 0 && (
                        <Card>
                          <CardHeader>
                            <HStack>
                              <Icon as={FaGraduationCap} color="green.500" />
                              <Heading size="md">Your Learning Goals</Heading>
                            </HStack>
                          </CardHeader>
                          <CardBody>
                            <VStack spacing={4} align="stretch">
                              {preferences.goals.filter(goal => goal.isActive).map((goal, index) => (
                                <Card key={index} variant="outline">
                                  <CardBody>
                                    <VStack align="stretch" spacing={3}>
                                      <HStack justify="space-between">
                                        <Text fontWeight="bold">{goal.description}</Text>
                                        <Badge colorScheme={goal.type === 'career' ? 'blue' : 'green'}>
                                          {goal.type}
                                        </Badge>
                                      </HStack>
                                      <Progress 
                                        value={goal.progress} 
                                        colorScheme={getProgressColor(goal.progress)}
                                        size="sm"
                                      />
                                      <HStack justify="space-between" fontSize="sm" color="gray.500">
                                        <Text>{goal.progress}% complete</Text>
                                        {goal.targetDate && (
                                          <Text>Target: {new Date(goal.targetDate).toLocaleDateString()}</Text>
                                        )}
                                      </HStack>
                                    </VStack>
                                  </CardBody>
                                </Card>
                              ))}
                            </VStack>
                          </CardBody>
                        </Card>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Learning Paths Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <HStack justify="space-between">
                        <Heading size="md">Your Learning Paths</Heading>
                        <Button leftIcon={<FaPlus />} colorScheme="teal" size="sm">
                          Create Path
                        </Button>
                      </HStack>

                      {dashboardData?.activePaths && dashboardData.activePaths.length > 0 ? (
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          {dashboardData.activePaths.map((path) => (
                            <Card 
                              key={path._id} 
                              variant="outline" 
                              cursor="pointer"
                              _hover={{ shadow: 'md' }}
                              onClick={() => openPathModal(path)}
                            >
                              <CardHeader>
                                <VStack align="start" spacing={2}>
                                  <HStack justify="space-between" w="full">
                                    <Heading size="md">{path.name}</Heading>
                                    <Badge colorScheme={path.status === 'active' ? 'green' : 'gray'}>
                                      {path.status}
                                    </Badge>
                                  </HStack>
                                  <Text color="gray.600" noOfLines={2}>
                                    {path.description}
                                  </Text>
                                </VStack>
                              </CardHeader>
                              <CardBody>
                                <VStack spacing={4} align="stretch">
                                  <HStack justify="space-between">
                                    <Text fontSize="sm">Progress</Text>
                                    <Text fontSize="sm">{path.progressPercentage}%</Text>
                                  </HStack>
                                  <Progress 
                                    value={path.progressPercentage} 
                                    colorScheme="teal"
                                    size="sm"
                                  />
                                  <HStack justify="space-between" fontSize="sm" color="gray.500">
                                    <Text>{path.milestones.filter(m => m.isCompleted).length}/{path.milestones.length} milestones</Text>
                                    <Text>{path.estimatedDuration}h estimated</Text>
                                  </HStack>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                      ) : (
                        <Alert status="info">
                          <AlertIcon />
                          <VStack align="start" spacing={2}>
                            <Text fontWeight="bold">No learning paths yet</Text>
                            <Text>Create your first personalized learning path to get started!</Text>
                          </VStack>
                        </Alert>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Recommendations Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="md">Recommended for You</Heading>
                      
                      {dashboardData?.recentRecommendations && dashboardData.recentRecommendations.length > 0 ? (
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          {dashboardData.recentRecommendations.slice(0, 6).map((rec) => (
                            <Card key={rec._id} variant="outline">
                              <CardBody>
                                <VStack align="stretch" spacing={3}>
                                  <HStack justify="space-between">
                                    <Text fontWeight="bold">{rec.type}</Text>
                                    <Badge colorScheme="blue">{rec.algorithm}</Badge>
                                  </HStack>
                                  <Text fontSize="sm" color="gray.600">
                                    Score: {Math.round(rec.score * 100)}%
                                  </Text>
                                  {rec.reasons && rec.reasons.length > 0 && (
                                    <Text fontSize="sm" color="gray.500">
                                      {rec.reasons[0]?.description}
                                    </Text>
                                  )}
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                      ) : (
                        <Alert status="info">
                          <AlertIcon />
                          <Text>No recommendations available yet. Complete some courses to get personalized recommendations!</Text>
                        </Alert>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Adaptive Content Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="md">Adaptive Content</Heading>
                      
                      {dashboardData?.adaptiveContent && dashboardData.adaptiveContent.length > 0 ? (
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          {dashboardData.adaptiveContent.slice(0, 6).map((content) => (
                            <Card key={content._id} variant="outline">
                              <CardBody>
                                <VStack align="stretch" spacing={3}>
                                  <HStack justify="space-between">
                                    <Text fontWeight="bold">{content.originalContent.title}</Text>
                                    <Badge colorScheme="purple">{content.contentType}</Badge>
                                  </HStack>
                                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                    {content.originalContent.description}
                                  </Text>
                                  <HStack justify="space-between" fontSize="sm">
                                    <Text>Effectiveness: {content.effectiveness}%</Text>
                                    <Text>Adaptation: {content.adaptationAccuracy}%</Text>
                                  </HStack>
                                  <Progress 
                                    value={content.progress.completionPercentage} 
                                    colorScheme="purple"
                                    size="sm"
                                  />
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                      ) : (
                        <Alert status="info">
                          <AlertIcon />
                          <Text>No adaptive content available yet. Start learning to see personalized content adaptations!</Text>
                        </Alert>
                      )}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Learning Path Detail Modal */}
      <Modal isOpen={isPathModalOpen} onClose={() => setIsPathModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedPath?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPath && (
              <VStack spacing={6} align="stretch">
                <Text>{selectedPath.description}</Text>
                
                <Divider />
                
                <VStack align="stretch" spacing={4}>
                  <Text fontWeight="bold">Milestones</Text>
                  {selectedPath.milestones.map((milestone, index) => (
                    <Card key={index} variant="outline">
                      <CardBody>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">{milestone.title}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {milestone.description}
                            </Text>
                          </VStack>
                          {milestone.isCompleted ? (
                            <Icon as={FaCheck} color="green.500" />
                          ) : (
                            <Icon as={FaClock} color="gray.400" />
                          )}
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Footer />
    </Box>
  );
};

export default PersonalizedDashboard; 