import React, { useEffect, useState } from 'react';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, IconButton, useToast, Flex, Spinner, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, Textarea, Select, useDisclosure
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
    price: '', 
    syllabus: '',
    category: 'Technology',
    level: 'Beginner',
    duration: '',
    tags: ''
  });
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalMode, setModalMode] = useState('add');

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
      price: '', 
      syllabus: '',
      category: 'Technology',
      level: 'Beginner',
      duration: '',
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
      price: course.price || '',
      syllabus: course.syllabus || '',
      category: course.category || 'Technology',
      level: course.level || 'Beginner',
      duration: course.duration || '',
      tags: course.tags ? course.tags.join(', ') : '',
    });
    setModalMode('edit');
    setSelected(course);
    onOpen();
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // Process form data
      const courseData = {
        ...form,
        price: form.price ? Number(form.price) : 0,
        duration: form.duration ? Number(form.duration) : 0,
        tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
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
    <Flex minH="100vh" bgGradient="linear(to-br, gray.900, teal.700)">
      <AdminSidebar />
      <Box flex={1} p={8}>
        <Heading color="white" mb={8} textAlign="center">Course Management</Heading>
        <Box bg="white" p={6} rounded="lg" shadow="xl">
          <Button leftIcon={<AddIcon />} colorScheme="teal" mb={4} onClick={handleOpenAdd}>Add Course</Button>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="30vh">
              <Spinner size="lg" color="teal.400" />
            </Box>
          ) : (
            <Table variant="simple" colorScheme="teal">
              <Thead>
                <Tr>
                  <Th>Title</Th>
                  <Th>Description</Th>
                  <Th>Price</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {courses.map(course => (
                  <Tr key={course._id}>
                    <Td>{course.title}</Td>
                    <Td>{course.description.slice(0, 40)}...</Td>
                    <Td>{course.price ? `₹${course.price}` : 'Free'}</Td>
                    <Td>
                      <IconButton icon={<EditIcon />} colorScheme="blue" size="sm" mr={2} onClick={() => handleOpenEdit(course)} aria-label="Edit course" />
                      <IconButton icon={<DeleteIcon />} colorScheme="red" size="sm" onClick={() => handleDelete(course._id)} aria-label="Delete course" />
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
                  <FormLabel>Thumbnail URL</FormLabel>
                  <Input name="thumbnail" value={form.thumbnail} onChange={handleChange} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Price (₹)</FormLabel>
                  <Input name="price" type="number" value={form.price} onChange={handleChange} />
                </FormControl>
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
                <FormControl mb={3}>
                  <FormLabel>Duration (hours)</FormLabel>
                  <Input name="duration" type="number" step="0.5" value={form.duration} onChange={handleChange} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Tags (comma-separated)</FormLabel>
                  <Input name="tags" value={form.tags} onChange={handleChange} placeholder="react, javascript, web development" />
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="teal" mr={3} type="submit">{modalMode === 'add' ? 'Add' : 'Update'}</Button>
                <Button onClick={onClose}>Cancel</Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </Box>
    </Flex>
  );
};

export default Courses; 