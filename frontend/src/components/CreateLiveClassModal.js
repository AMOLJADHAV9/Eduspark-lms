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
  Switch,
  Text,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CreateLiveClassModal = ({ isOpen, onClose, onSuccess }) => {
  const { token, apiBaseUrl, user } = useAuth();
  const toast = useToast();
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    courseId: '',
    scheduledAt: '',
    duration: 60,
    maxStudents: 50,
    allowChat: true,
    allowRecording: false,
    allowScreenShare: true,
    allowHandRaise: true,
    isPublic: true,
    streamingPlatform: 'youtube',
    youtubeStreamUrl: '',
    zegoRoomId: '',
    meetingUrl: ''
  });
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTeacherCourses();
    }
  }, [isOpen]);

  const fetchTeacherCourses = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/courses/teacher`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your courses',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setFetchingCourses(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title || !form.courseId || !form.scheduledAt) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    // Validate scheduled time is in the future
    const scheduledTime = new Date(form.scheduledAt);
    const now = new Date();
    if (scheduledTime <= now) {
      toast({
        title: 'Invalid Time',
        description: 'Scheduled time must be in the future',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${apiBaseUrl}/api/live-classes`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Success',
        description: 'Live class created successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error creating live class:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create live class',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      courseId: '',
      scheduledAt: '',
      duration: 60,
      maxStudents: 50,
      allowChat: true,
      allowRecording: false,
      allowScreenShare: true,
      allowHandRaise: true,
      isPublic: true,
      streamingPlatform: 'youtube',
      youtubeStreamUrl: '',
      zegoRoomId: '',
      meetingUrl: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() + 30); // Minimum 30 minutes from now
    return today.toISOString().slice(0, 16);
  };

  if (fetchingCourses) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Live Class</ModalHeader>
          <ModalBody>
            <VStack spacing={4} py={8}>
              <Spinner size="lg" color="teal.500" />
              <Text>Loading your courses...</Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Live Class</ModalHeader>
        <ModalCloseButton />
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={6}>
              {courses.length === 0 && (
                <Alert status="warning">
                  <AlertIcon />
                  <AlertTitle>No Courses Available!</AlertTitle>
                  <AlertDescription>
                    You need to create a course first before scheduling live classes.
                  </AlertDescription>
                </Alert>
              )}

              <FormControl isRequired>
                <FormLabel>Class Title</FormLabel>
                <Input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter live class title"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe what this live class will cover..."
                  rows={3}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Course</FormLabel>
                <Select
                  name="courseId"
                  value={form.courseId}
                  onChange={handleChange}
                  placeholder="Select a course"
                  isDisabled={courses.length === 0}
                >
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Scheduled Date & Time</FormLabel>
                  <Input
                    name="scheduledAt"
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={handleChange}
                    min={getMinDate()}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <Select
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Maximum Students</FormLabel>
                <Input
                  name="maxStudents"
                  type="number"
                  value={form.maxStudents}
                  onChange={handleChange}
                  min={1}
                  max={200}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Streaming Platform</FormLabel>
                <Select name="streamingPlatform" value={form.streamingPlatform} onChange={handleChange}>
                  <option value="youtube">YouTube</option>
                  <option value="google_meet">Google Meet</option>
                  <option value="zego">ZEGOCLOUD</option>
                  <option value="custom">Custom URL</option>
                </Select>
              </FormControl>

              {form.streamingPlatform === 'youtube' && (
                <FormControl>
                  <FormLabel>YouTube Stream URL</FormLabel>
                  <Input name="youtubeStreamUrl" value={form.youtubeStreamUrl} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=YOUR_STREAM_KEY" />
                </FormControl>
              )}

              {form.streamingPlatform === 'zego' && (
                <FormControl>
                  <FormLabel>Zego Room ID</FormLabel>
                  <Input name="zegoRoomId" value={form.zegoRoomId} onChange={handleChange} placeholder="Enter a unique room ID" />
                </FormControl>
              )}

              {(form.streamingPlatform === 'google_meet' || form.streamingPlatform === 'custom') && (
                <FormControl isRequired>
                  <FormLabel>{form.streamingPlatform === 'google_meet' ? 'Google Meet Link' : 'Meeting URL'}</FormLabel>
                  <Input name="meetingUrl" value={form.meetingUrl} onChange={handleChange} placeholder={form.streamingPlatform === 'google_meet' ? 'https://meet.google.com/abc-defg-hij' : 'https://your-stream-url.com/session'} />
                </FormControl>
              )}

              <VStack spacing={4} w="full" align="start">
                <Text fontWeight="bold" fontSize="sm">Class Settings</Text>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="allowChat" mb="0">
                    Allow Chat
                  </FormLabel>
                  <Switch
                    id="allowChat"
                    name="allowChat"
                    isChecked={form.allowChat}
                    onChange={handleChange}
                    colorScheme="teal"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="allowRecording" mb="0">
                    Allow Recording
                  </FormLabel>
                  <Switch
                    id="allowRecording"
                    name="allowRecording"
                    isChecked={form.allowRecording}
                    onChange={handleChange}
                    colorScheme="teal"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="allowScreenShare" mb="0">
                    Allow Screen Sharing
                  </FormLabel>
                  <Switch
                    id="allowScreenShare"
                    name="allowScreenShare"
                    isChecked={form.allowScreenShare}
                    onChange={handleChange}
                    colorScheme="teal"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="allowHandRaise" mb="0">
                    Allow Hand Raising
                  </FormLabel>
                  <Switch
                    id="allowHandRaise"
                    name="allowHandRaise"
                    isChecked={form.allowHandRaise}
                    onChange={handleChange}
                    colorScheme="teal"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="isPublic" mb="0">
                    Public Class
                  </FormLabel>
                  <Switch
                    id="isPublic"
                    name="isPublic"
                    isChecked={form.isPublic}
                    onChange={handleChange}
                    colorScheme="teal"
                  />
                </FormControl>
              </VStack>
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
              isDisabled={courses.length === 0}
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