import React, { useEffect, useState } from 'react';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, IconButton, useToast, Flex, Spinner, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, Select as ChakraSelect, useDisclosure
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, AddIcon } from '@chakra-ui/icons';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';

const Lectures = () => {
  const { token, apiBaseUrl } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', videoUrl: '', notesUrl: '', order: '' });
  const [selected, setSelected] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalMode, setModalMode] = useState('add');

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/courses`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch courses');
      setCourses(data);
      if (data.length && !selectedCourse) setSelectedCourse(data[0]._id);
    } catch (err) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  const fetchLectures = async (courseId) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/lectures/course/${courseId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch lectures');
      setLectures(data);
    } catch (err) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchLectures(selectedCourse); }, [selectedCourse]);

  const handleOpenAdd = () => {
    setForm({ title: '', videoUrl: '', notesUrl: '', order: '' });
    setModalMode('add');
    setSelected(null);
    onOpen();
  };

  const handleOpenEdit = (lecture) => {
    setForm({
      title: lecture.title,
      videoUrl: lecture.videoUrl,
      notesUrl: lecture.notesUrl || '',
      order: lecture.order || '',
    });
    setModalMode('edit');
    setSelected(lecture);
    onOpen();
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const url = modalMode === 'add' ? `${apiBaseUrl}/api/lectures` : `${apiBaseUrl}/api/lectures/${selected._id}`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, course: selectedCourse }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save lecture');
      toast({ title: `Lecture ${modalMode === 'add' ? 'added' : 'updated'}`, status: 'success' });
      fetchLectures(selectedCourse);
      onClose();
    } catch (err) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/lectures/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete lecture');
      toast({ title: 'Lecture deleted', status: 'success' });
      fetchLectures(selectedCourse);
    } catch (err) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    }
  };

  return (
    <Flex minH="100vh" bgGradient="linear(to-br, gray.900, teal.700)">
      <AdminSidebar />
      <Box flex={1} p={8}>
        <Heading color="white" mb={8} textAlign="center">Lecture Management</Heading>
        <Box bg="white" p={6} rounded="lg" shadow="xl">
          <ChakraSelect mb={4} value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} maxW="sm" bg="gray.50">
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </ChakraSelect>
          <Button leftIcon={<AddIcon />} colorScheme="teal" mb={4} onClick={handleOpenAdd}>Add Lecture</Button>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="30vh">
              <Spinner size="lg" color="teal.400" />
            </Box>
          ) : (
            <Table variant="simple" colorScheme="teal">
              <Thead>
                <Tr>
                  <Th>Title</Th>
                  <Th>Video URL</Th>
                  <Th>Notes</Th>
                  <Th>Order</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {lectures.map(lec => (
                  <Tr key={lec._id}>
                    <Td>{lec.title}</Td>
                    <Td><a href={lec.videoUrl} target="_blank" rel="noopener noreferrer">Video</a></Td>
                    <Td>{lec.notesUrl ? <a href={lec.notesUrl} target="_blank" rel="noopener noreferrer">Notes</a> : '-'}</Td>
                    <Td>{lec.order}</Td>
                    <Td>
                      <IconButton icon={<EditIcon />} colorScheme="blue" size="sm" mr={2} onClick={() => handleOpenEdit(lec)} aria-label="Edit lecture" />
                      <IconButton icon={<DeleteIcon />} colorScheme="red" size="sm" onClick={() => handleDelete(lec._id)} aria-label="Delete lecture" />
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
            <ModalHeader>{modalMode === 'add' ? 'Add Lecture' : 'Edit Lecture'}</ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleSubmit}>
              <ModalBody>
                <FormControl mb={3} isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input name="title" value={form.title} onChange={handleChange} />
                </FormControl>
                <FormControl mb={3} isRequired>
                  <FormLabel>Video URL</FormLabel>
                  <Input name="videoUrl" value={form.videoUrl} onChange={handleChange} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Notes URL</FormLabel>
                  <Input name="notesUrl" value={form.notesUrl} onChange={handleChange} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Order</FormLabel>
                  <Input name="order" type="number" value={form.order} onChange={handleChange} />
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

export default Lectures; 