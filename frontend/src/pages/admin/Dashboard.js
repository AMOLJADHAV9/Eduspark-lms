import React, { useEffect, useState } from 'react';
import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, useToast, Spinner, Flex, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, VStack, FormControl, FormLabel, Input, Textarea, Switch, Image as ChakraImage, HStack, Text, useDisclosure, Table, Thead, Tbody, Tr, Th, Td, IconButton, Badge, useDisclosure as useDisclosureHook } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Navbar from '../../components/Navbar';
import { FaEdit, FaTrash, FaDownload, FaEye } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const StatCard = ({ label, value, color }) => (
  <Stat p={6} shadow="md" rounded="lg" bg={color} color="white">
    <StatLabel fontSize="lg">{label}</StatLabel>
    <StatNumber fontSize="3xl">{value}</StatNumber>
  </Stat>
);

const AdminDashboard = () => {
  const { token, apiBaseUrl } = useAuth();
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [storySubmitting, setStorySubmitting] = useState(false);
  const [storyForm, setStoryForm] = useState({ name: '', story: '', published: true, image: null });
  const [preview, setPreview] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState([]);
  const [editingStory, setEditingStory] = useState(null);
  const [isViewStoryOpen, setIsViewStoryOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const { isOpen, onToggle, onClose } = useDisclosure();
  const { isOpen: isStoriesOpen, onToggle: onStoriesToggle, onClose: onStoriesClose } = useDisclosureHook();
  const toast = useToast();

  useEffect(() => {
    fetchStats();
    fetchStories();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Set mock data for development
      setStats({
        totalUsers: 1250,
        totalCourses: 89,
        totalEnrollments: 3456,
        totalRevenue: 45678
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStories = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/stories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStories(Array.isArray(data) ? data : []);
      } else {
        // Mock data for development
        setStories([
          {
            id: 1,
            name: 'Aman Sharma',
            story: 'This LMS helped me crack NEET! The lectures and notes are top-notch.',
            published: true,
            image: 'https://randomuser.me/api/portraits/men/32.jpg',
            createdAt: '2024-01-15'
          },
          {
            id: 2,
            name: 'Priya Singh',
            story: 'The best platform for affordable, quality education. Highly recommended!',
            published: true,
            image: 'https://randomuser.me/api/portraits/women/44.jpg',
            createdAt: '2024-01-10'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const openStoryModal = () => {
    setEditingStory(null);
    setStoryForm({ name: '', story: '', published: true, image: null });
    setIsStoryOpen(true);
  };

  const closeStoryModal = () => { 
    setIsStoryOpen(false); 
    setStoryForm({ name: '', story: '', published: true, image: null }); 
    setPreview(''); 
    setEditingStory(null);
  };

  const editStory = (story) => {
    setEditingStory(story);
    setStoryForm({
      name: story.name,
      story: story.story,
      published: story.published,
      image: null
    });
    setIsStoryOpen(true);
  };

  const deleteStory = async (storyId) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        const res = await fetch(`${apiBaseUrl}/api/admin/stories/${storyId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          toast({ title: 'Story deleted', status: 'success' });
          fetchStories();
        } else {
          throw new Error('Failed to delete story');
        }
      } catch (err) {
        toast({ title: 'Error', description: err.message, status: 'error' });
      }
    }
  };

  const viewStory = (story) => {
    setSelectedStory(story);
    setIsViewStoryOpen(true);
  };

  const submitStory = async (e) => {
    e.preventDefault();
    try {
      setStorySubmitting(true);
      const fd = new FormData();
      fd.append('name', storyForm.name);
      fd.append('story', storyForm.story);
      fd.append('published', storyForm.published ? 'true' : 'false');
      if (storyForm.image) fd.append('image', storyForm.image);

      const url = editingStory 
        ? `${apiBaseUrl}/api/admin/stories/${editingStory.id}`
        : `${apiBaseUrl}/api/admin/stories`;
      
      const method = editingStory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save story');
      }
      
      toast({ 
        title: editingStory ? 'Story updated' : 'Story published', 
        status: 'success' 
      });
      closeStoryModal();
      fetchStories();
    } catch (err) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    } finally {
      setStorySubmitting(false);
    }
  };

  const generateExcelReport = () => {
    // Prepare data for Excel
    const reportData = [
      ['Dashboard Report', 'Generated on: ' + new Date().toLocaleDateString()],
      [''],
      ['Statistics'],
      ['Total Users', stats?.totalUsers || 0],
      ['Total Courses', stats?.totalCourses || 0],
      ['Total Enrollments', stats?.totalEnrollments || 0],
      ['Total Revenue', `$${stats?.totalRevenue || 0}`],
      [''],
      ['Student Success Stories'],
      ['Name', 'Story', 'Published', 'Created Date']
    ];

    // Add stories to report
    stories.forEach(story => {
      reportData.push([
        story.name,
        story.story.substring(0, 100) + (story.story.length > 100 ? '...' : ''),
        story.published ? 'Yes' : 'No',
        story.createdAt
      ]);
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Admin Dashboard Report');

    // Auto-size columns
    const colWidths = reportData[0].map((_, i) => 
      Math.max(...reportData.map(row => String(row[i] || '').length))
    );
    ws['!cols'] = colWidths.map(width => ({ width: Math.min(width + 2, 50) }));

    // Save file
    XLSX.writeFile(wb, `admin-dashboard-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast({ title: 'Excel report generated', status: 'success' });
  };

  return (
    <Box bg="white" minH="100vh">
      <Navbar />
      <Flex minH="calc(100vh - 80px)" bg="gray.50">
        <AdminSidebar isOpen={isOpen} onToggle={onToggle} onClose={onClose} />
        <Box flex={1} p={{ base: 4, md: 8 }} overflowX="auto">
          <Box
            bg="white"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.200"
            p={{ base: 4, md: 8 }}
            mt={4}
            mx="auto"
            maxW="5xl"
          >
            <Heading color="blue.600" mb={8} textAlign="center" fontWeight="extrabold" letterSpacing="wide" fontSize={{ base: '2xl', md: '3xl' }}>
              Admin Dashboard
            </Heading>
            
            {/* Action Buttons */}
            <Flex justify="space-between" mb={6} flexWrap="wrap" gap={4}>
              <Button colorScheme="teal" onClick={openStoryModal}>
                Publish Student Story
              </Button>
              <Button colorScheme="blue" onClick={onStoriesToggle}>
                Manage Stories
              </Button>
              <Button colorScheme="green" onClick={generateExcelReport} leftIcon={<FaDownload />}>
                Generate Excel Report
              </Button>
            </Flex>

            {/* Stats Display */}
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minH="40vh">
                <Spinner size="xl" color="blue.500" />
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
                <StatCard label="Total Users" value={stats?.totalUsers || 0} color="blue.500" />
                <StatCard label="Total Courses" value={stats?.totalCourses || 0} color="green.500" />
                <StatCard label="Total Enrollments" value={stats?.totalEnrollments || 0} color="purple.500" />
                <StatCard label="Total Revenue" value={`$${stats?.totalRevenue || 0}`} color="orange.500" />
              </SimpleGrid>
            )}

            {/* Stories Management */}
            {isStoriesOpen && (
              <Box mt={8}>
                <Heading size="lg" mb={4} color="gray.700">Student Success Stories</Heading>
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Story</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {stories.map((story) => (
                        <Tr key={story.id}>
                          <Td>
                            <HStack>
                              {story.image && (
                                <ChakraImage src={story.image} alt={story.name} boxSize="40px" borderRadius="full" />
                              )}
                              <Text fontWeight="medium">{story.name}</Text>
                            </HStack>
                          </Td>
                          <Td maxW="300px">
                            <Text noOfLines={2}>{story.story}</Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={story.published ? 'green' : 'gray'}>
                              {story.published ? 'Published' : 'Draft'}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                icon={<FaEye />}
                                size="sm"
                                colorScheme="blue"
                                onClick={() => viewStory(story)}
                                aria-label="View story"
                              />
                              <IconButton
                                icon={<FaEdit />}
                                size="sm"
                                colorScheme="teal"
                                onClick={() => editStory(story)}
                                aria-label="Edit story"
                              />
                              <IconButton
                                icon={<FaTrash />}
                                size="sm"
                                colorScheme="red"
                                onClick={() => deleteStory(story.id)}
                                aria-label="Delete story"
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Flex>

      {/* Story Modal */}
      <Modal isOpen={isStoryOpen} onClose={closeStoryModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingStory ? 'Edit Student Story' : 'Publish Student Story'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={submitStory}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Student Name</FormLabel>
                  <Input
                    value={storyForm.name}
                    onChange={(e) => setStoryForm({ ...storyForm, name: e.target.value })}
                    placeholder="Enter student name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Story</FormLabel>
                  <Textarea
                    value={storyForm.story}
                    onChange={(e) => setStoryForm({ ...storyForm, story: e.target.value })}
                    placeholder="Enter student success story"
                    rows={6}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Image</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setStoryForm({ ...storyForm, image: e.target.files[0] })}
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Publish immediately</FormLabel>
                  <Switch
                    isChecked={storyForm.published}
                    onChange={(e) => setStoryForm({ ...storyForm, published: e.target.checked })}
                  />
                </FormControl>
                <HStack spacing={4} w="full">
                  <Button type="submit" colorScheme="teal" isLoading={storySubmitting} loadingText={editingStory ? "Updating" : "Publishing"}>
                    {editingStory ? 'Update Story' : 'Publish Story'}
                  </Button>
                  <Button onClick={closeStoryModal}>Cancel</Button>
                </HStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* View Story Modal */}
      <Modal isOpen={isViewStoryOpen} onClose={() => setIsViewStoryOpen(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Student Success Story</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedStory && (
              <VStack spacing={4} align="start">
                <HStack spacing={4} w="full">
                  {selectedStory.image && (
                    <ChakraImage src={selectedStory.image} alt={selectedStory.name} boxSize="80px" borderRadius="full" />
                  )}
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" fontSize="lg">{selectedStory.name}</Text>
                    <Badge colorScheme={selectedStory.published ? 'green' : 'gray'}>
                      {selectedStory.published ? 'Published' : 'Draft'}
                    </Badge>
                  </VStack>
                </HStack>
                <Text>{selectedStory.story}</Text>
                <Text fontSize="sm" color="gray.500">
                  Created: {new Date(selectedStory.createdAt).toLocaleDateString()}
                </Text>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminDashboard; 