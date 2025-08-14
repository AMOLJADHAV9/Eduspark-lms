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
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Image,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton
} from '@chakra-ui/react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaUsers,
  FaStar,
  FaPlay,
  FaPause,
  FaEllipsisV,
  FaBook,
  FaVideo,
  FaFileAlt,
  FaComments
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import Navbar from '../../components/Navbar';

const TeacherCourses = () => {
  const { user, token, apiBaseUrl } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    level: 'beginner',
    thumbnail: ''
  });
  const toast = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/courses/teacher`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error loading courses',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCourse 
        ? `${apiBaseUrl}/api/courses/teacher/${editingCourse._id}`
        : `${apiBaseUrl}/api/courses/teacher`;
      
      const method = editingCourse ? 'PUT' : 'POST';

      // Sanitize numeric fields
      const sanitizedData = {
        ...formData,
        price: isNaN(Number(formData.price)) ? 0 : Number(formData.price),
        // add other numeric fields here if needed
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(sanitizedData)
      });

      if (!res.ok) {
        throw new Error('Failed to save course');
      }

      toast({
        title: 'Success',
        description: editingCourse ? 'Course updated successfully' : 'Course created successfully',
        status: 'success'
      });

      setIsModalOpen(false);
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        price: 0,
        category: '',
        level: 'beginner',
        thumbnail: ''
      });
      fetchCourses();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error'
      });
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      price: course.price,
      category: course.category,
      level: course.level,
      thumbnail: course.thumbnail
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const res = await fetch(`${apiBaseUrl}/api/courses/teacher/${courseId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error('Failed to delete course');
        }

        toast({
          title: 'Success',
          description: 'Course deleted successfully',
          status: 'success'
        });

        fetchCourses();
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message,
          status: 'error'
        });
      }
    }
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      price: 0,
      category: '',
      level: 'beginner',
      thumbnail: ''
    });
    setIsModalOpen(true);
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
                    My Courses
                  </Heading>
                  <Text color="gray.100">
                    Manage your courses and content
                  </Text>
                </VStack>
                <Button
                  leftIcon={<FaPlus />}
                  colorScheme="teal"
                  size="lg"
                  onClick={openCreateModal}
                >
                  Create Course
                </Button>
              </HStack>
            </Box>

                         {/* Courses Grid */}
             {courses.length === 0 ? (
               <Box
                 bg="rgba(255, 255, 255, 0.15)"
                 backdropFilter="blur(8px)"
                 borderRadius="2xl"
                 border="1px solid rgba(255, 255, 255, 0.18)"
                 p={8}
                 textAlign="center"
               >
                 <VStack spacing={4}>
                   <Icon as={FaBook} boxSize={12} color="gray.400" />
                   <Heading size="md" color="gray.200">
                     No Courses Yet
                   </Heading>
                   <Text color="gray.300">
                     Start by creating your first course to share with students.
                   </Text>
                   <Button
                     colorScheme="teal"
                     leftIcon={<FaPlus />}
                     onClick={openCreateModal}
                   >
                     Create First Course
                   </Button>
                 </VStack>
               </Box>
             ) : (
               <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                 {courses.map((course) => (
                 <Card
                   key={course._id}
                   bg="rgba(255, 255, 255, 0.15)"
                   backdropFilter="blur(8px)"
                   borderRadius="xl"
                   border="1px solid rgba(255, 255, 255, 0.18)"
                   overflow="hidden"
                 >
                                     <Image
                     src={course.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'}
                     alt={course.title}
                     height="200px"
                     width="100%"
                     objectFit="cover"
                   />
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                                                 <Badge
                           colorScheme={typeof course.status === 'string' && course.status === 'published' ? 'green' : 'yellow'}
                           variant="solid"
                         >
                           {typeof course.status === 'string' ? course.status : 'draft'}
                         </Badge>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FaEllipsisV />}
                            variant="ghost"
                            color="white"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem icon={<FaEye />}>View</MenuItem>
                            <MenuItem icon={<FaEdit />} onClick={() => handleEdit(course)}>
                              Edit
                            </MenuItem>
                                                         <MenuItem icon={<FaTrash />} onClick={() => handleDelete(course._id)}>
                               Delete
                             </MenuItem>
                          </MenuList>
                        </Menu>
                      </HStack>

                      <VStack align="start" spacing={2}>
                        <Heading size="md" color="white">
                          {typeof course.title === 'string' ? course.title : 'Untitled Course'}
                        </Heading>
                        <Text color="gray.300" fontSize="sm" noOfLines={2}>
                          {typeof course.description === 'string' ? course.description : 'No description available'}
                        </Text>
                        <Text color="teal.300" fontWeight="bold" fontSize="lg">
                          ${typeof course.price === 'number' ? course.price : 0}
                        </Text>
                      </VStack>

                                             <VStack spacing={3} align="stretch">
                         <HStack justify="space-between">
                           <HStack spacing={2}>
                             <Icon as={FaUsers} color="gray.400" boxSize={4} />
                             <Text color="gray.300" fontSize="sm">
                               {typeof course.students === 'number' ? course.students : 0} students
                             </Text>
                           </HStack>
                           <HStack spacing={2}>
                             <Icon as={FaStar} color="yellow.400" boxSize={4} />
                             <Text color="gray.300" fontSize="sm">
                               {typeof course.rating === 'number' ? course.rating : 'N/A'}
                             </Text>
                           </HStack>
                         </HStack>

                         <HStack justify="space-between" fontSize="sm" color="gray.400">
                           <HStack spacing={1}>
                             <Icon as={FaVideo} boxSize={3} />
                             <Text>{typeof course.lectures === 'number' ? course.lectures : 0} lectures</Text>
                           </HStack>
                           <HStack spacing={1}>
                             <Icon as={FaFileAlt} boxSize={3} />
                             <Text>{typeof course.assignments === 'number' ? course.assignments : 0} assignments</Text>
                           </HStack>
                           <HStack spacing={1}>
                             <Icon as={FaComments} boxSize={3} />
                             <Text>{typeof course.quizzes === 'number' ? course.quizzes : 0} quizzes</Text>
                           </HStack>
                         </HStack>

                         <Progress value={typeof course.progress === 'number' ? course.progress : 0} colorScheme="teal" size="sm" />
                         <Text color="gray.300" fontSize="xs" textAlign="center">
                           {typeof course.progress === 'number' ? course.progress : 0}% complete
                         </Text>
                       </VStack>
                    </VStack>
                                     </CardBody>
                 </Card>
               ))}
               </SimpleGrid>
             )}
          </VStack>
        </Box>
      </Flex>

      {/* Create/Edit Course Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingCourse ? 'Edit Course' : 'Create New Course'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Course Title</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter course title"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter course description"
                    rows={4}
                  />
                </FormControl>

                <HStack spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Price ($)</FormLabel>
                    <NumberInput
                      value={formData.price === 0 ? '' : formData.price}
                      onChange={(value) => setFormData({ ...formData, price: value === '' ? 0 : parseFloat(value) })}
                      min={0}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="">Select category</option>
                      <option value="Programming">Programming</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Backend Development">Backend Development</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Design">Design</option>
                    </Select>
                  </FormControl>
                </HStack>

                <HStack spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Level</FormLabel>
                    <Select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Thumbnail URL</FormLabel>
                    <Input
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      placeholder="Enter thumbnail URL"
                    />
                  </FormControl>
                </HStack>

                <HStack spacing={4} w="full" pt={4}>
                  <Button type="submit" colorScheme="teal" flex={1}>
                    {editingCourse ? 'Update Course' : 'Create Course'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} flex={1}>
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TeacherCourses; 