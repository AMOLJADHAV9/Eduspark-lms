import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  Checkbox,
  useToast,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const CreateLiveClassModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    scheduledAt: '',
    duration: 60,
    maxParticipants: 100,
    allowChat: true,
    allowScreenShare: true,
    allowWhiteboard: true,
    requireApproval: false,
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const { token } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setFetchingCourses(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/live-classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Live class created successfully!',
          status: 'success',
        });
        onSuccess();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create live class');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      courseId: '',
      scheduledAt: '',
      duration: 60,
      maxParticipants: 100,
      allowChat: true,
      allowScreenShare: true,
      allowWhiteboard: true,
      requireApproval: false,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Live Class</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter live class title"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what this live class will cover"
                  rows={3}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Course</FormLabel>
                {fetchingCourses ? (
                  <HStack>
                    <Spinner size="sm" />
                    <Text>Loading courses...</Text>
                  </HStack>
                ) : (
                  <Select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleChange}
                    placeholder="Select a course"
                  >
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </Select>
                )}
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Date & Time</FormLabel>
                  <Input
                    name="scheduledAt"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <Input
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleChange}
                    min={15}
                    max={480}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Max Participants</FormLabel>
                <Input
                  name="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  min={1}
                  max={500}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Class Settings</FormLabel>
                <VStack align="start" spacing={2}>
                  <Checkbox
                    name="allowChat"
                    isChecked={formData.allowChat}
                    onChange={handleChange}
                  >
                    Allow chat during class
                  </Checkbox>
                  <Checkbox
                    name="allowScreenShare"
                    isChecked={formData.allowScreenShare}
                    onChange={handleChange}
                  >
                    Allow screen sharing
                  </Checkbox>
                  <Checkbox
                    name="allowWhiteboard"
                    isChecked={formData.allowWhiteboard}
                    onChange={handleChange}
                  >
                    Enable interactive whiteboard
                  </Checkbox>
                  <Checkbox
                    name="requireApproval"
                    isChecked={formData.requireApproval}
                    onChange={handleChange}
                  >
                    Require approval to join
                  </Checkbox>
                </VStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              type="submit"
              isLoading={loading}
              loadingText="Creating..."
            >
              Create Live Class
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateLiveClassModal; 