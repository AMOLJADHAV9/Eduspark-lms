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
    thumbnail: '',
    thumbnailFile: null,
    thumbnailPreview: null,
    duration: '',
    durationUnit: 'hours'
  });
  const [isUploading, setIsUploading] = useState(false);
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
    setIsUploading(true);
    try {
      let thumbnailUrl = formData.thumbnail;

      // If there's a new file, upload it to Cloudinary first
      if (formData.thumbnailFile) {
        toast({
          title: 'Uploading image...',
          description: 'Please wait while we upload your image to Cloudinary',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });

        const formDataCloudinary = new FormData();
        formDataCloudinary.append('file', formData.thumbnailFile);
        formDataCloudinary.append('upload_preset', 'lms_images');
        formDataCloudinary.append('cloud_name', 'dsqgbqinh');

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/dsqgbqinh/image/upload`, {
          method: 'POST',
          body: formDataCloudinary
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadData = await uploadRes.json();
        thumbnailUrl = uploadData.secure_url;
        
        toast({
          title: 'Image uploaded successfully!',
          description: 'Your image has been uploaded to Cloudinary',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }

      const url = editingCourse 
        ? `${apiBaseUrl}/api/courses/teacher/${editingCourse._id}`
        : `${apiBaseUrl}/api/courses/teacher`;
      
      const method = editingCourse ? 'PUT' : 'POST';

      // Sanitize numeric fields and prepare data
      const sanitizedData = {
        ...formData,
        price: isNaN(Number(formData.price)) ? 0 : Number(formData.price),
        thumbnail: thumbnailUrl,
        // Remove the file object as it's not needed in the database
        thumbnailFile: undefined
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
        thumbnail: '',
        thumbnailFile: null,
        thumbnailPreview: null,
        duration: '',
        durationUnit: 'hours'
      });
      fetchCourses();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error'
      });
    } finally {
      setIsUploading(false);
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
        thumbnail: course.thumbnail,
        thumbnailFile: null,
        thumbnailPreview: null,
        duration: course.duration || '',
        durationUnit: course.durationUnit || 'hours'
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
      thumbnail: '',
      thumbnailFile: null,
      thumbnailPreview: null,
      duration: '',
      durationUnit: 'hours'
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Flex minH="100vh" bg="gray.50">
          <TeacherSidebar />
          <Box flex={1} p={8} ml={{ base: "-15px", md: 0 }}>
            <Center h="50vh">
              <Spinner size="xl" color="blue.500" />
            </Center>
          </Box>
        </Flex>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Flex minH="100vh" bg="gray.50">
        <TeacherSidebar />
        <Box flex={1} p={8} ml={{ base: "-15px", md: 0 }}>
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <Box
              bg="white"
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
              borderRadius="2xl"
              border="1px solid"
              borderColor="gray.200"
              p={8}
            >
              <HStack justify="space-between">
                <VStack align="start" spacing={2}>
                  <Heading color="blue.600" fontSize="3xl" fontWeight="extrabold">
                    My Courses
                  </Heading>
                  <Text color="gray.600">
                    Manage your courses and content
                  </Text>
                </VStack>
                <Button
                  leftIcon={<FaPlus />}
                  colorScheme="blue"
                  size={{ base: "md", md: "lg" }}
                  onClick={openCreateModal}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}
                  transition="all 0.2s ease"
                  borderRadius="full"
                  px={{ base: 4, md: 6 }}
                  display={{ base: 'flex', md: 'flex' }}
                  position={{ base: 'fixed', md: 'static' }}
                  bottom={{ base: 4, md: 'auto' }}
                  right={{ base: 4, md: 'auto' }}
                  zIndex={{ base: 1000, md: 'auto' }}
                  boxShadow={{ base: '0 4px 12px rgba(0, 0, 0, 0.15)', md: 'none' }}
                >
                  <Text display={{ base: 'none', md: 'block' }}>Create Course</Text>
                </Button>
              </HStack>
            </Box>

                         {/* Courses Grid */}
             {courses.length === 0 ? (
               <Box
                 bg="white"
                 boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
                 borderRadius="2xl"
                 border="1px solid"
                 borderColor="gray.200"
                 p={8}
                 textAlign="center"
               >
                 <VStack spacing={4}>
                   <Icon as={FaBook} boxSize={12} color="gray.400" />
                   <Heading size="md" color="gray.800">
                     No Courses Yet
                   </Heading>
                   <Text color="gray.600">
                     Start by creating your first course to share with students.
                   </Text>
                   <Button
                     colorScheme="blue"
                     leftIcon={<FaPlus />}
                     onClick={openCreateModal}
                     _hover={{ transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}
                     transition="all 0.2s ease"
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
                   bg="white"
                   boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
                   borderRadius="xl"
                   border="1px solid"
                   borderColor="gray.200"
                   overflow="hidden"
                   _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)' }}
                   transition="all 0.3s ease"
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
                            color="gray.600"
                            size="sm"
                            _hover={{ bg: 'gray.100' }}
                          />
                          <MenuList bg="white" border="1px solid" borderColor="gray.200">
                            <MenuItem icon={<FaEye />} _hover={{ bg: 'blue.50' }}>View</MenuItem>
                            <MenuItem icon={<FaEdit />} onClick={() => handleEdit(course)} _hover={{ bg: 'green.50' }}>
                              Edit
                            </MenuItem>
                            <MenuItem icon={<FaTrash />} onClick={() => handleDelete(course._id)} _hover={{ bg: 'red.50' }}>
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </HStack>

                      <VStack align="start" spacing={2}>
                        <Heading size="md" color="gray.800">
                          {typeof course.title === 'string' ? course.title : 'Untitled Course'}
                        </Heading>
                        <Text color="gray.600" fontSize="sm" noOfLines={2}>
                          {typeof course.description === 'string' ? course.description : 'No description available'}
                        </Text>
                        <Text color="blue.600" fontWeight="bold" fontSize="lg">
                          ${typeof course.price === 'number' ? course.price : 0}
                        </Text>
                      </VStack>

                                             <VStack spacing={3} align="stretch">
                         <HStack justify="space-between">
                           <HStack spacing={2}>
                             <Icon as={FaUsers} color="gray.500" boxSize={4} />
                             <Text color="gray.600" fontSize="sm">
                               {typeof course.students === 'number' ? course.students : 0} students
                             </Text>
                           </HStack>
                           <HStack spacing={2}>
                             <Icon as={FaStar} color="yellow.500" boxSize={4} />
                             <Text color="gray.600" fontSize="sm">
                               {typeof course.rating === 'number' ? course.rating : 'N/A'}
                             </Text>
                           </HStack>
                         </HStack>

                         <HStack justify="space-between" fontSize="sm" color="gray.500">
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

                         <Progress value={typeof course.progress === 'number' ? course.progress : 0} colorScheme="blue" size="sm" />
                         <Text color="gray.600" fontSize="xs" textAlign="center">
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
                    <FormLabel>Duration</FormLabel>
                    <NumberInput
                      value={formData.duration === '' ? '' : formData.duration}
                      onChange={(value) => setFormData({ ...formData, duration: value === '' ? '' : parseFloat(value) })}
                      min={0}
                      step={0.5}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>

                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Duration Unit</FormLabel>
                    <Select
                      value={formData.durationUnit}
                      onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value })}
                    >
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Course Thumbnail</FormLabel>
                    <VStack spacing={3} align="stretch">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData({ ...formData, thumbnailFile: file });
                            // Create preview URL for the new file
                            const previewUrl = URL.createObjectURL(file);
                            setFormData(prev => ({ ...prev, thumbnailPreview: previewUrl }));
                          }
                        }}
                        p={1}
                      />
                      {(formData.thumbnailPreview || formData.thumbnail) && (
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={2}>
                            {formData.thumbnailPreview ? 'New Thumbnail Preview:' : 'Current Thumbnail:'}
                          </Text>
                          <Image
                            src={formData.thumbnailPreview || formData.thumbnail}
                            alt="Course thumbnail"
                            maxH="100px"
                            borderRadius="md"
                            objectFit="cover"
                          />
                        </Box>
                      )}
                    </VStack>
                  </FormControl>
                </HStack>

                <HStack spacing={4} w="full" pt={4}>
                  <Button 
                    type="submit" 
                    colorScheme="teal" 
                    flex={1}
                    isLoading={isUploading}
                    loadingText={editingCourse ? 'Updating...' : 'Creating...'}
                  >
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