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
  Input,
  Select,
  Progress,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tag,
  TagLabel,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react';
import { 
  FaTrophy, 
  FaSearch, 
  FaStar, 
  FaMedal, 
  FaCrown,
  FaCheck,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShare,
  FaDownload
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [recommendedAchievements, setRecommendedAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [rarityFilter, setRarityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all', 'earned', 'in_progress', 'recommended'
  
  const { token, user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all achievements
      const achievementsRes = await fetch('/api/gamification/achievements');
      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json();
        setAchievements(achievementsData.achievements);
      }

      // Fetch user achievements
      if (user) {
        const userAchievementsRes = await fetch('/api/gamification/users/achievements', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userAchievementsRes.ok) {
          const userAchievementsData = await userAchievementsRes.json();
          setUserAchievements(userAchievementsData.userAchievements);
          setStats(userAchievementsData.statistics);
        }

        // Fetch recommended achievements
        const recommendedRes = await fetch('/api/gamification/achievements/recommended', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (recommendedRes.ok) {
          const recommendedData = await recommendedRes.json();
          setRecommendedAchievements(recommendedData);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error loading achievements',
        description: error.message,
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      'common': 'gray',
      'uncommon': 'green',
      'rare': 'blue',
      'epic': 'purple',
      'legendary': 'orange'
    };
    return colors[rarity] || 'gray';
  };

  const getRarityIcon = (rarity) => {
    const icons = {
      'common': FaMedal,
      'uncommon': FaStar,
      'rare': FaTrophy,
      'epic': FaCrown,
      'legendary': FaCrown
    };
    return icons[rarity] || FaMedal;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'learning': 'blue',
      'engagement': 'green',
      'community': 'purple',
      'excellence': 'orange',
      'special': 'red'
    };
    return colors[category] || 'gray';
  };

  const getStatusColor = (status) => {
    const colors = {
      'in_progress': 'yellow',
      'completed': 'green',
      'claimed': 'blue',
      'expired': 'red'
    };
    return colors[status] || 'gray';
  };

  const getUserAchievement = (achievementId) => {
    return userAchievements.find(ua => ua.achievement._id === achievementId);
  };

  const handleClaimReward = async (achievementId) => {
    try {
      const res = await fetch(`/api/gamification/achievements/${achievementId}/claim`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to claim reward');
      }

      toast({
        title: 'Reward claimed successfully!',
        status: 'success',
        duration: 3000
      });

      fetchData(); // Refresh data
    } catch (error) {
      toast({
        title: 'Error claiming reward',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  };

  const openAchievementModal = (achievement) => {
    setSelectedAchievement(achievement);
    setIsModalOpen(true);
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || achievement.category === categoryFilter;
    const matchesType = !typeFilter || achievement.type === typeFilter;
    const matchesRarity = !rarityFilter || achievement.rarity === rarityFilter;
    
    return matchesSearch && matchesCategory && matchesType && matchesRarity;
  });

  const getDisplayAchievements = () => {
    switch (viewMode) {
      case 'earned':
        return userAchievements.filter(ua => ua.status === 'completed' || ua.status === 'claimed')
          .map(ua => ua.achievement);
      case 'in_progress':
        return userAchievements.filter(ua => ua.status === 'in_progress')
          .map(ua => ua.achievement);
      case 'recommended':
        return recommendedAchievements;
      default:
        return filteredAchievements;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
              <Heading>Achievements</Heading>
              <Text color="gray.600">Unlock badges and earn rewards for your learning journey</Text>
            </VStack>
          </HStack>

          {/* Statistics */}
          {stats && (
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
              <Card>
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel>Total Earned</StatLabel>
                    <StatNumber color="green.500">{stats.totalEarned}</StatNumber>
                    <StatHelpText>out of {achievements.length} achievements</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel>Total Points</StatLabel>
                    <StatNumber color="blue.500">{stats.totalPoints}</StatNumber>
                    <StatHelpText>points earned</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel>Categories</StatLabel>
                    <StatNumber color="purple.500">{stats.categories?.length || 0}</StatNumber>
                    <StatHelpText>categories explored</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel>Rarities</StatLabel>
                    <StatNumber color="orange.500">{stats.rarities?.length || 0}</StatNumber>
                    <StatHelpText>rarity levels</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}

          {/* Filters and View Mode */}
          <Card>
            <CardBody>
              <VStack spacing={4}>
                <HStack spacing={4} wrap="wrap" w="full">
                  <InputGroup maxW="300px">
                    <InputLeftElement>
                      <FaSearch />
                    </InputLeftElement>
                    <Input
                      placeholder="Search achievements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                  
                  <Select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    maxW="200px"
                  >
                    <option value="all">All Achievements</option>
                    <option value="earned">Earned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="recommended">Recommended</option>
                  </Select>
                  
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    maxW="150px"
                  >
                    <option value="">All Categories</option>
                    <option value="learning">Learning</option>
                    <option value="engagement">Engagement</option>
                    <option value="community">Community</option>
                    <option value="excellence">Excellence</option>
                    <option value="special">Special</option>
                  </Select>
                  
                  <Select
                    value={rarityFilter}
                    onChange={(e) => setRarityFilter(e.target.value)}
                    maxW="150px"
                  >
                    <option value="">All Rarities</option>
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </Select>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Achievements Grid */}
          {getDisplayAchievements().length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">No achievements found</Text>
                <Text>Try adjusting your filters or check back later for new achievements!</Text>
              </VStack>
            </Alert>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {getDisplayAchievements().map(achievement => {
                const userAchievement = getUserAchievement(achievement._id);
                const RarityIcon = getRarityIcon(achievement.rarity);
                const isEarned = userAchievement?.status === 'completed' || userAchievement?.status === 'claimed';
                const isInProgress = userAchievement?.status === 'in_progress';
                const progress = userAchievement?.progress || { current: 0, target: achievement.criteria.value, percentage: 0 };

                return (
                  <Card 
                    key={achievement._id} 
                    variant="outline" 
                    _hover={{ shadow: 'md' }}
                    cursor="pointer"
                    onClick={() => openAchievementModal(achievement)}
                    opacity={isEarned ? 0.8 : 1}
                  >
                    <CardHeader>
                      <HStack justify="space-between">
                        <VStack align="start" spacing={2}>
                          <HStack>
                            <RarityIcon color={`${getRarityColor(achievement.rarity)}.500`} />
                            <Badge colorScheme={getRarityColor(achievement.rarity)}>
                              {achievement.rarity}
                            </Badge>
                            <Badge colorScheme={getCategoryColor(achievement.category)}>
                              {achievement.category}
                            </Badge>
                            {isEarned && <FaCheck color="green" />}
                            {achievement.isHidden && <FaLock color="gray" />}
                          </HStack>
                          <Heading size="md">{achievement.name}</Heading>
                        </VStack>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Text noOfLines={3} color="gray.600">
                          {achievement.description}
                        </Text>
                        
                        {isInProgress && (
                          <VStack spacing={2} align="stretch">
                            <HStack justify="space-between" fontSize="sm">
                              <Text>Progress</Text>
                              <Text>{progress.current}/{progress.target}</Text>
                            </HStack>
                            <Progress 
                              value={progress.percentage} 
                              colorScheme={getRarityColor(achievement.rarity)}
                              size="sm"
                            />
                          </VStack>
                        )}
                        
                        {isEarned && userAchievement?.status === 'completed' && (
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClaimReward(achievement._id);
                            }}
                          >
                            Claim Reward
                          </Button>
                        )}
                        
                        <HStack justify="space-between" fontSize="sm" color="gray.500">
                          <HStack>
                            <FaStar />
                            <Text>{achievement.points} points</Text>
                          </HStack>
                          {userAchievement?.earnedAt && (
                            <Text>Earned {formatDate(userAchievement.earnedAt)}</Text>
                          )}
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                );
              })}
            </SimpleGrid>
          )}
        </VStack>
      </Container>

      {/* Achievement Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedAchievement?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedAchievement && (
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <HStack>
                    <Icon as={getRarityIcon(selectedAchievement.rarity)} 
                          color={`${getRarityColor(selectedAchievement.rarity)}.500`} 
                          boxSize={6} />
                    <Badge colorScheme={getRarityColor(selectedAchievement.rarity)}>
                      {selectedAchievement.rarity}
                    </Badge>
                    <Badge colorScheme={getCategoryColor(selectedAchievement.category)}>
                      {selectedAchievement.category}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    {selectedAchievement.points} points
                  </Text>
                </HStack>

                <Text>{selectedAchievement.description}</Text>

                <Divider />

                <VStack align="stretch" spacing={3}>
                  <Text fontWeight="bold">Criteria</Text>
                  <Text fontSize="sm" color="gray.600">
                    {selectedAchievement.criteria.type.replace(/_/g, ' ').toUpperCase()}: {selectedAchievement.criteria.value}
                  </Text>
                  {selectedAchievement.criteria.timeframe && (
                    <Text fontSize="sm" color="gray.600">
                      Timeframe: {selectedAchievement.criteria.timeframe} days
                    </Text>
                  )}
                </VStack>

                {selectedAchievement.rewards && (
                  <>
                    <Divider />
                    <VStack align="stretch" spacing={3}>
                      <Text fontWeight="bold">Rewards</Text>
                      {selectedAchievement.rewards.points > 0 && (
                        <Text fontSize="sm">• {selectedAchievement.rewards.points} points</Text>
                      )}
                      {selectedAchievement.rewards.badges?.length > 0 && (
                        <Text fontSize="sm">• {selectedAchievement.rewards.badges.join(', ')} badges</Text>
                      )}
                      {selectedAchievement.rewards.specialAccess?.length > 0 && (
                        <Text fontSize="sm">• {selectedAchievement.rewards.specialAccess.join(', ')} access</Text>
                      )}
                    </VStack>
                  </>
                )}

                {selectedAchievement.metadata && (
                  <>
                    <Divider />
                    <VStack align="stretch" spacing={3}>
                      <Text fontWeight="bold">Statistics</Text>
                      <Text fontSize="sm">Difficulty: {selectedAchievement.metadata.difficulty}/10</Text>
                      {selectedAchievement.metadata.estimatedTime && (
                        <Text fontSize="sm">Estimated time: {selectedAchievement.metadata.estimatedTime} hours</Text>
                      )}
                      <Text fontSize="sm">Total earned: {selectedAchievement.metadata.totalEarned}</Text>
                    </VStack>
                  </>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Footer />
    </Box>
  );
};

export default Achievements; 