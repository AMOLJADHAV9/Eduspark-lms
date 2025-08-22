import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useToast,
  Spinner,
  Center,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Image,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  useBreakpointValue
} from '@chakra-ui/react';
import { FaEye, FaDownload } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import Navbar from '../../components/Navbar';
import * as XLSX from 'xlsx';

const Stories = () => {
  const { token, apiBaseUrl } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const { isOpen, onToggle, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    fetchStories();
  }, []);

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
            story: 'This LMS helped me crack NEET! The lectures and notes are top-notch. The teachers are very supportive and the platform is easy to use.',
            published: true,
            image: 'https://randomuser.me/api/portraits/men/32.jpg',
            createdAt: '2024-01-15'
          },
          {
            id: 2,
            name: 'Priya Singh',
            story: 'The best platform for affordable, quality education. Highly recommended! I improved my grades significantly.',
            published: true,
            image: 'https://randomuser.me/api/portraits/women/44.jpg',
            createdAt: '2024-01-10'
          },
          {
            id: 3,
            name: 'Rahul Verma',
            story: 'I loved the interactive lectures and the support from teachers. The assignments helped me understand concepts better.',
            published: true,
            image: 'https://randomuser.me/api/portraits/men/65.jpg',
            createdAt: '2024-01-08'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({ title: 'Error', description: 'Failed to fetch stories', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const viewStory = (story) => {
    setSelectedStory(story);
    onViewOpen();
  };

  const generateExcelReport = () => {
    // Prepare data for Excel
    const reportData = [
      ['Student Success Stories Report', 'Generated on: ' + new Date().toLocaleDateString()],
      [''],
      ['Story Details'],
      ['Name', 'Story', 'Published', 'Created Date']
    ];

    // Add stories to report
    stories.forEach(story => {
      reportData.push([
        story.name,
        story.story.substring(0, 150) + (story.story.length > 150 ? '...' : ''),
        story.published ? 'Yes' : 'No',
        story.createdAt
      ]);
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Success Stories');

    // Auto-size columns
    const colWidths = reportData[0].map((_, i) => 
      Math.max(...reportData.map(row => String(row[i] || '').length))
    );
    ws['!cols'] = colWidths.map(width => ({ width: Math.min(width + 2, 50) }));

    // Save file
    XLSX.writeFile(wb, `student-success-stories-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast({ title: 'Excel report generated', status: 'success' });
  };

  if (loading) {
    return (
      <Box bg="white" minH="100vh">
        <Navbar />
        <Center h="60vh">
          <VStack spacing={6}>
            <Spinner size="xl" color="teal.500" thickness="4px" />
            <Text color="brand.text" fontSize="lg">Loading stories...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box bg="white" minH="100vh">
      <Navbar />
      <Flex minH="calc(100vh - 80px)" bg="gray.50">
        <TeacherSidebar isOpen={isOpen} onToggle={onToggle} onClose={onClose} />
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
            <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
              <Heading color="teal.600" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="extrabold">
                Student Success Stories
              </Heading>
              <Button 
                colorScheme="green" 
                onClick={generateExcelReport} 
                leftIcon={<FaDownload />}
                size={{ base: 'md', md: 'lg' }}
              >
                Generate Excel Report
              </Button>
            </Flex>

            {stories.length === 0 ? (
              <Center py={20}>
                <VStack spacing={4}>
                  <Text fontSize="lg" color="gray.500">No success stories available yet.</Text>
                  <Text color="gray.400">Check back later for inspiring student stories!</Text>
                </VStack>
              </Center>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {stories.map((story) => (
                  <Card key={story.id} bg="white" boxShadow="0 2px 10px rgba(0, 0, 0, 0.1)" borderRadius="xl" border="1px solid" borderColor="gray.200" _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)' }} transition="all 0.3s ease">
                    <CardHeader pb={2}>
                      <HStack spacing={3}>
                        {story.image && (
                          <Image src={story.image} alt={story.name} boxSize="50px" borderRadius="full" />
                        )}
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold" fontSize="lg" color="gray.800">
                            {story.name}
                          </Text>
                          <Badge colorScheme={story.published ? 'green' : 'gray'} size="sm">
                            {story.published ? 'Published' : 'Draft'}
                          </Badge>
                        </VStack>
                      </HStack>
                    </CardHeader>
                    <CardBody pt={0}>
                      <VStack spacing={4} align="start">
                        <Text color="gray.700" noOfLines={3} lineHeight="tall">
                          {story.story}
                        </Text>
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm" color="gray.500">
                            {new Date(story.createdAt).toLocaleDateString()}
                          </Text>
                          <IconButton
                            icon={<FaEye />}
                            size="sm"
                            colorScheme="teal"
                            onClick={() => viewStory(story)}
                            aria-label="View full story"
                            variant="ghost"
                          />
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Box>
        </Box>
      </Flex>

      {/* View Story Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Student Success Story</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedStory && (
              <VStack spacing={6} align="start">
                <HStack spacing={4} w="full">
                  {selectedStory.image && (
                    <Image src={selectedStory.image} alt={selectedStory.name} boxSize="80px" borderRadius="full" />
                  )}
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" fontSize="xl">{selectedStory.name}</Text>
                    <Badge colorScheme={selectedStory.published ? 'green' : 'gray'} size="lg">
                      {selectedStory.published ? 'Published' : 'Draft'}
                    </Badge>
                  </VStack>
                </HStack>
                <Box>
                  <Text fontSize="lg" lineHeight="tall" color="gray.700">
                    {selectedStory.story}
                  </Text>
                </Box>
                <HStack justify="space-between" w="full" pt={2} borderTop="1px solid" borderColor="gray.200">
                  <Text fontSize="sm" color="gray.500">
                    Created: {new Date(selectedStory.createdAt).toLocaleDateString()}
                  </Text>
                  <Button
                    colorScheme="green"
                    size="sm"
                    onClick={() => {
                      generateExcelReport();
                      onViewClose();
                    }}
                    leftIcon={<FaDownload />}
                  >
                    Download Report
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Stories;
