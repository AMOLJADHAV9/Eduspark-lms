import React, { useEffect, useState } from 'react';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, IconButton, useToast, Flex, Spinner, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, Textarea, Select, useDisclosure, VStack, HStack, Image, Text
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, AddIcon } from '@chakra-ui/icons';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';

const Courses = () => {
  const { token, apiBaseUrl } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    thumbnail: '', 
    thumbnailFile: null,
    thumbnailPreview: null,
    isPaid: false,
    price: '', 
    syllabus: '',
    category: 'Technology',
    level: 'Beginner',
    duration: '',
    durationUnit: 'hours',
    tags: ''
  });
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalMode, setModalMode] = useState('add');
  const [isUploading, setIsUploading] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/courses`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch courses');
      setCourses(data);
    } catch (err) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleOpenAdd = () => {
    setForm({ 
      title: '', 
      description: '', 
      thumbnail: '', 
      thumbnailFile: null,
      thumbnailPreview: null,
      isPaid: false,
      price: '', 
      syllabus: '',
      category: 'Technology',
      level: 'Beginner',
      duration: '',
      durationUnit: 'hours',
      tags: ''
    });
    setModalMode('add');
    setSelected(null);
    onOpen();
  };

  const handleOpenEdit = (course) => {
    setForm({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail || '',
      thumbnailFile: null,
      thumbnailPreview: null,
      isPaid: !!course.isPaid,
      price: course.price || '',
      syllabus: course.syllabus || '',
      category: course.category || 'Technology',
      level: course.level || 'Beginner',
      duration: course.duration || '',
      durationUnit: course.durationUnit || 'hours',
      tags: course.tags ? course.tags.join(', ') : '',
    });
    setModalMode('edit');
    setSelected(course);
    onOpen();
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let thumbnailUrl = form.thumbnail;

      // If there's a new file, upload it to Cloudinary first
      if (form.thumbnailFile) {
        toast({
          title: 'Uploading image...',
          description: 'Please wait while we upload your image to Cloudinary',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });

        const formDataCloudinary = new FormData();
        formDataCloudinary.append('file', form.thumbnailFile);
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

      // Process form data
      const courseData = {
        ...form,
        thumbnail: thumbnailUrl,
        price: form.isPaid ? (form.price ? Number(form.price) : 0) : 0,
        duration: form.duration ? Number(form.duration) : 0,
        level: String(form.level || '').toLowerCase(),
        tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        // Remove the file object as it's not needed in the database
        thumbnailFile: undefined,
        thumbnailPreview: undefined
      };
      
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const url = modalMode === 'add' ? `${apiBaseUrl}/api/courses` : `${apiBaseUrl}/api/courses/${selected._id}`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save course');
      toast({ title: `Course ${modalMode === 'add' ? 'added' : 'updated'}`, status: 'success' });
      fetchCourses();
      onClose();
    } catch (err) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete course');
      toast({ title: 'Course deleted', status: 'success' });
      fetchCourses();
    } catch (err) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  return (
    <Flex minH="100vh" bg="gray.50">
      <AdminSidebar />
      <Box flex={1} p={8}>
        <Box bg="white" p={6} rounded="2xl" shadow="0 4px 20px rgba(0, 0, 0, 0.1)" border="1px solid" borderColor="gray.200" mb={6}>
          <Heading color="blue.600" mb={4} textAlign="center" fontSize="3xl" fontWeight="extrabold">Course Management</Heading>
          <Button leftIcon={<AddIcon />} colorScheme="blue" size="lg" onClick={handleOpenAdd} _hover={{ transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }} transition="all 0.2s ease">Add Course</Button>
        </Box>
        <Box bg="white" p={6} rounded="2xl" shadow="0 4px 20px rgba(0, 0, 0, 0.1)" border="1px solid" borderColor="gray.200">
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="30vh">
              <Spinner size="lg" color="blue.500" />
            </Box>
          ) : (
            <Table variant="simple" colorScheme="blue">
              <Thead>
                <Tr>
                  <Th>Thumbnail</Th>
                  <Th>Title</Th>
                  <Th>Description</Th>
                  <Th>Type</Th>
                  <Th>Price</Th>
                  <Th>Duration</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {courses.map(course => (
                  <Tr key={course._id}>
                    <Td>
                      <Image
                        src={course.thumbnail || 'https://via.placeholder.com/50x50?text=No+Image'}
                        alt={course.title}
                        boxSize="50px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                    </Td>
                    <Td>{course.title}</Td>
                    <Td>{course.description.slice(0, 40)}...</Td>
                    <Td>{course.isPaid ? 'Paid' : 'Free'}</Td>
                    <Td>{course.isPaid ? `₹${course.price}` : '-'}</Td>
                    <Td>{course.duration ? `${course.duration} ${course.durationUnit || 'hours'}` : '-'}</Td>
                    <Td>
                      <IconButton icon={<EditIcon />} colorScheme="green" size="sm" mr={2} onClick={() => handleOpenEdit(course)} aria-label="Edit course" _hover={{ transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)' }} transition="all 0.2s ease" />
                      <IconButton icon={<DeleteIcon />} colorScheme="red" size="sm" onClick={() => handleDelete(course._id)} aria-label="Delete course" _hover={{ transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)' }} transition="all 0.2s ease" />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{modalMode === 'add' ? 'Add Course' : 'Edit Course'}</ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleSubmit}>
              <ModalBody>
                <FormControl mb={3} isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input name="title" value={form.title} onChange={handleChange} />
                </FormControl>
                <FormControl mb={3} isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea name="description" value={form.description} onChange={handleChange} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Course Thumbnail</FormLabel>
                  <VStack spacing={3} align="stretch">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setForm(prev => ({ ...prev, thumbnailFile: file }));
                          // Create preview URL for the new file
                          const previewUrl = URL.createObjectURL(file);
                          setForm(prev => ({ ...prev, thumbnailPreview: previewUrl }));
                        }
                      }}
                      p={1}
                    />
                    {(form.thumbnailPreview || form.thumbnail) && (
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={2}>
                          {form.thumbnailPreview ? 'New Thumbnail Preview:' : 'Current Thumbnail:'}
                        </Text>
                        <Image
                          src={form.thumbnailPreview || form.thumbnail}
                          alt="Course thumbnail"
                          maxH="100px"
                          borderRadius="md"
                          objectFit="cover"
                        />
                      </Box>
                    )}
                  </VStack>
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Course Type</FormLabel>
                  <Select name="isPaid" value={String(form.isPaid)} onChange={e => setForm(f => ({ ...f, isPaid: e.target.value === 'true' }))}>
                    <option value="false">Free</option>
                    <option value="true">Paid</option>
                  </Select>
                </FormControl>
                {form.isPaid && (
                  <FormControl mb={3}>
                    <FormLabel>Price (₹)</FormLabel>
                    <Input name="price" type="number" value={form.price} onChange={handleChange} />
                  </FormControl>
                )}
                <FormControl mb={3}>
                  <FormLabel>Syllabus</FormLabel>
                  <Textarea name="syllabus" value={form.syllabus} onChange={handleChange} />
                </FormControl>
                <FormControl mb={3} isRequired>
                  <FormLabel>Category</FormLabel>
                  <Select name="category" value={form.category} onChange={handleChange}>
                    <option value="Technology">Technology</option>
                    <option value="Business">Business</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>
                <FormControl mb={3} isRequired>
                  <FormLabel>Level</FormLabel>
                  <Select name="level" value={form.level} onChange={handleChange}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </Select>
                </FormControl>
                <HStack spacing={4} w="full">
                  <FormControl mb={3} flex={1}>
                    <FormLabel>Duration</FormLabel>
                    <Input name="duration" type="number" step="0.5" value={form.duration} onChange={handleChange} />
                  </FormControl>
                  <FormControl mb={3} flex={1}>
                    <FormLabel>Duration Unit</FormLabel>
                    <Select name="durationUnit" value={form.durationUnit} onChange={handleChange}>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </Select>
                  </FormControl>
                </HStack>
                <FormControl mb={3}>
                  <FormLabel>Tags (comma-separated)</FormLabel>
                  <Input name="tags" value={form.tags} onChange={handleChange} placeholder="react, javascript, web development" />
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button 
                  colorScheme="blue" 
                  mr={3} 
                  type="submit"
                  isLoading={isUploading}
                  loadingText={modalMode === 'add' ? 'Adding...' : 'Updating...'}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}
                  transition="all 0.2s ease"
                >
                  {modalMode === 'add' ? 'Add' : 'Update'}
                </Button>
                <Button onClick={onClose} colorScheme="gray" variant="outline" _hover={{ bg: 'gray.50' }}>Cancel</Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </Box>
    </Flex>
  );
};

export default Courses; 