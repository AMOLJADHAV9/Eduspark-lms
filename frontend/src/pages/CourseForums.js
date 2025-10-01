import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Checkbox,
  Tag,
  TagLabel,
  TagCloseButton,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react';
import { 
  FaPlus, 
  FaSearch, 
  FaEllipsisV, 
  FaEdit, 
  FaTrash, 
  FaUsers, 
  FaComments, 
  FaEye,
  FaTag,
  FaLock,
  FaThumbtack
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CourseForums = () => {
  const { courseId } = useParams();
  const [forums, setForums] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingForum, setEditingForum] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('lastActivity');
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'general',
    tags: [],
    allowAnonymous: false,
    requireModeration: false,
    rules: []
  });
  const [newTag, setNewTag] = useState('');
  const [newRule, setNewRule] = useState('');
  
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      // Fetch course details
      const courseRes = await fetch(`/api/courses/${courseId}`);
      if (courseRes.ok) {
        const courseData = await courseRes.json();
        setCourse(courseData);
      }

      // Fetch forums
      const forumsRes = await fetch(`/api/courses/${courseId}/forums`);
      if (forumsRes.ok) {
        const forumsData = await forumsRes.json();
        setForums(forumsData);
      }

      // Fetch forum statistics
      const statsRes = await fetch(`/api/courses/${courseId}/forums/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error loading forums',
        description: error.message,
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const addRule = () => {
    if (newRule.trim() && !form.rules.includes(newRule.trim())) {
      setForm(prev => ({ ...prev, rules: [...prev.rules, newRule.trim()] }));
      setNewRule('');
    }
  };

  const removeRule = (ruleToRemove) => {
    setForm(prev => ({ ...prev, rules: prev.rules.filter(rule => rule !== ruleToRemove) }));
  };

  const openCreateModal = () => {
    setForm({
      title: '',
      description: '',
      category: 'general',
      tags: [],
      allowAnonymous: false,
      requireModeration: false,
      rules: []
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (forum) => {
    setEditingForum(forum);
    setForm({
      title: forum.title,
      description: forum.description,
      category: forum.category,
      tags: forum.tags || [],
      allowAnonymous: forum.allowAnonymous,
      requireModeration: forum.requireModeration,
      rules: forum.rules || []
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingForum 
        ? `/api/forums/${editingForum._id}`
        : `/api/courses/${courseId}/forums`;
      
      const method = editingForum ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to save forum');
      }

      toast({
        title: `Forum ${editingForum ? 'updated' : 'created'} successfully!`,
        status: 'success',
        duration: 3000
      });

      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setEditingForum(null);
      fetchData();
    } catch (error) {
      toast({
        title: `Error ${editingForum ? 'updating' : 'creating'} forum`,
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  };

  const handleDelete = async (forumId) => {
    if (!window.confirm('Are you sure you want to delete this forum? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/forums/${forumId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete forum');
      }

      toast({
        title: 'Forum deleted successfully!',
        status: 'success',
        duration: 3000
      });

      fetchData();
    } catch (error) {
      toast({
        title: 'Error deleting forum',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'general': 'blue',
      'q&a': 'green',
      'discussion': 'purple',
      'announcements': 'orange',
      'resources': 'teal',
      'help': 'red'
    };
    return colors[category] || 'gray';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'general': FaComments,
      'q&a': FaSearch,
      'discussion': FaComments,
      'announcements': FaThumbtack,
      'resources': FaTag,
      'help': FaUsers
    };
    return icons[category] || FaComments;
  };

  const filteredForums = forums.filter(forum => {
    const matchesSearch = forum.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         forum.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         forum.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !categoryFilter || forum.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const sortedForums = [...filteredForums].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'createdAt':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'topics':
        return b.metadata.totalTopics - a.metadata.totalTopics;
      case 'posts':
        return b.metadata.totalPosts - a.metadata.totalPosts;
      case 'views':
        return b.metadata.viewCount - a.metadata.viewCount;
      default:
        return new Date(b.metadata.lastActivity) - new Date(a.metadata.lastActivity);
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const canManageForum = (forum) => {
    return user.isAdmin || 
           forum.createdBy._id === user.id || 
           forum.moderators.some(mod => mod._id === user.id);
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
              <Heading>Course Forums</Heading>
              {course && <Text color="gray.600">{course.title}</Text>}
            </VStack>
            <Button
              leftIcon={<FaPlus />}
              colorScheme="blue"
              onClick={openCreateModal}
            >
              Create Forum
            </Button>
          </HStack>

          {/* Statistics */}
          {stats && (
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
              <Card>
                <CardBody textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                    {stats.totalForums}
                  </Text>
                  <Text color="gray.600">Total Forums</Text>
                </CardBody>
              </Card>
              <Card>
                <CardBody textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {stats.totalTopics}
                  </Text>
                  <Text color="gray.600">Total Topics</Text>
                </CardBody>
              </Card>
              <Card>
                <CardBody textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                    {stats.totalPosts}
                  </Text>
                  <Text color="gray.600">Total Posts</Text>
                </CardBody>
              </Card>
              <Card>
                <CardBody textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                    {stats.totalViews}
                  </Text>
                  <Text color="gray.600">Total Views</Text>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}

          {/* Filters */}
          <Card>
            <CardBody>
              <HStack spacing={4} wrap="wrap">
                <InputGroup maxW="300px">
                  <InputLeftElement>
                    <FaSearch />
                  </InputLeftElement>
                  <Input
                    placeholder="Search forums..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  maxW="200px"
                >
                  <option value="">All Categories</option>
                  <option value="general">General</option>
                  <option value="q&a">Q&A</option>
                  <option value="discussion">Discussion</option>
                  <option value="announcements">Announcements</option>
                  <option value="resources">Resources</option>
                  <option value="help">Help</option>
                </Select>
                
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  maxW="200px"
                >
                  <option value="lastActivity">Last Activity</option>
                  <option value="title">Title</option>
                  <option value="createdAt">Created Date</option>
                  <option value="topics">Most Topics</option>
                  <option value="posts">Most Posts</option>
                  <option value="views">Most Views</option>
                </Select>
              </HStack>
            </CardBody>
          </Card>

          {/* Forums List */}
          {sortedForums.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">No forums found</Text>
                <Text>Create the first forum to start discussions!</Text>
              </VStack>
            </Alert>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {sortedForums.map(forum => {
                const CategoryIcon = getCategoryIcon(forum.category);
                return (
                  <Card key={forum._id} variant="outline" _hover={{ shadow: 'md' }}>
                    <CardHeader>
                      <HStack justify="space-between">
                        <VStack align="start" spacing={2}>
                          <HStack>
                            <CategoryIcon color={`${getCategoryColor(forum.category)}.500`} />
                            <Badge colorScheme={getCategoryColor(forum.category)}>
                              {forum.category}
                            </Badge>
                            {forum.isPinned && <FaThumbtack color="orange" />}
                            {forum.isLocked && <FaLock color="red" />}
                          </HStack>
                          <Heading size="md" cursor="pointer" onClick={() => navigate(`/forum/${forum._id}`)}>
                            {forum.title}
                          </Heading>
                        </VStack>
                        {canManageForum(forum) && (
                          <Menu>
                            <MenuButton as={IconButton} icon={<FaEllipsisV />} variant="ghost" />
                            <MenuList>
                              <MenuItem icon={<FaEdit />} onClick={() => openEditModal(forum)}>
                                Edit Forum
                              </MenuItem>
                              <MenuItem icon={<FaTrash />} onClick={() => handleDelete(forum._id)}>
                                Delete Forum
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        )}
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Text noOfLines={3} color="gray.600">
                          {forum.description}
                        </Text>
                        
                        {forum.tags.length > 0 && (
                          <HStack wrap="wrap">
                            {forum.tags.slice(0, 3).map(tag => (
                              <Tag key={tag} size="sm" colorScheme="blue">
                                <TagLabel>{tag}</TagLabel>
                              </Tag>
                            ))}
                            {forum.tags.length > 3 && (
                              <Tag size="sm" colorScheme="gray">
                                <TagLabel>+{forum.tags.length - 3} more</TagLabel>
                              </Tag>
                            )}
                          </HStack>
                        )}
                        
                        <HStack justify="space-between" fontSize="sm" color="gray.500">
                          <HStack>
                            <FaComments />
                            <Text>{forum.metadata.totalTopics} topics</Text>
                          </HStack>
                          <HStack>
                            <FaUsers />
                            <Text>{forum.metadata.totalPosts} posts</Text>
                          </HStack>
                          <HStack>
                            <FaEye />
                            <Text>{forum.metadata.viewCount} views</Text>
                          </HStack>
                        </HStack>
                        
                        <HStack justify="space-between" fontSize="sm">
                          <Text color="gray.600">
                            Created by {forum.createdBy.name}
                          </Text>
                          <Text color="gray.500">
                            {formatDate(forum.metadata.lastActivity)}
                          </Text>
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

      {/* Create/Edit Forum Modal */}
      <Modal isOpen={isCreateModalOpen || isEditModalOpen} onClose={() => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setEditingForum(null);
      }} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingForum ? 'Edit Forum' : 'Create New Forum'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Forum Title</FormLabel>
                  <Input
                    value={form.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter forum title"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={form.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the purpose of this forum"
                    rows={3}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={form.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    <option value="general">General</option>
                    <option value="q&a">Q&A</option>
                    <option value="discussion">Discussion</option>
                    <option value="announcements">Announcements</option>
                    <option value="resources">Resources</option>
                    <option value="help">Help</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Tags</FormLabel>
                  <HStack>
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button onClick={addTag} size="sm">Add</Button>
                  </HStack>
                  {form.tags.length > 0 && (
                    <HStack wrap="wrap" mt={2}>
                      {form.tags.map(tag => (
                        <Tag key={tag} colorScheme="blue">
                          <TagLabel>{tag}</TagLabel>
                          <TagCloseButton onClick={() => removeTag(tag)} />
                        </Tag>
                      ))}
                    </HStack>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Forum Rules</FormLabel>
                  <HStack>
                    <Input
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      placeholder="Add a rule"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                    />
                    <Button onClick={addRule} size="sm">Add</Button>
                  </HStack>
                  {form.rules.length > 0 && (
                    <VStack align="stretch" mt={2}>
                      {form.rules.map((rule, index) => (
                        <HStack key={index} p={2} bg="gray.50" borderRadius="md">
                          <Text flex={1}>{rule}</Text>
                          <IconButton
                            size="sm"
                            icon={<FaTrash />}
                            onClick={() => removeRule(rule)}
                            variant="ghost"
                          />
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </FormControl>

                <HStack spacing={4}>
                  <Checkbox
                    isChecked={form.allowAnonymous}
                    onChange={(e) => handleInputChange('allowAnonymous', e.target.checked)}
                  >
                    Allow anonymous posts
                  </Checkbox>
                  <Checkbox
                    isChecked={form.requireModeration}
                    onChange={(e) => handleInputChange('requireModeration', e.target.checked)}
                  >
                    Require moderation
                  </Checkbox>
                </HStack>

                <HStack justify="flex-end" w="full">
                  <Button
                    type="submit"
                    colorScheme="blue"
                  >
                    {editingForum ? 'Update Forum' : 'Create Forum'}
                  </Button>
                </HStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Footer />
    </Box>
  );
};

export default CourseForums; 